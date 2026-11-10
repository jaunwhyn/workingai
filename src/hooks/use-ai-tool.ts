import { Chat, useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type SourceUrlUIPart, type UIMessage } from "ai";
import { useCallback, useMemo } from "react";

import type { ToolId } from "@/lib/ai/prompts";
import { logActivity } from "@/lib/app-data";
import { useAppState } from "@/lib/app-state";

interface LastRequest {
  input: unknown;
  summary: string;
  language: string;
  activityLabel: string;
}

// One in-memory Chat per tool so results survive navigating between pages
// during the session. Nothing here is written to storage.
const chats = new Map<string, Chat<UIMessage>>();
const lastRequests = new Map<string, LastRequest>();

function createChat(tool: Exclude<ToolId, "chat">) {
  return new Chat<UIMessage>({
    id: `tool-${tool}`,
    transport: new DefaultChatTransport({ api: "/api/ai" }),
    onFinish: ({ isAbort, isError, isDisconnect }) => {
      const last = lastRequests.get(tool);
      if (!isAbort && !isError && !isDisconnect && last) logActivity(tool, last.activityLabel);
    },
  });
}

function getChat(tool: Exclude<ToolId, "chat">) {
  if (typeof window === "undefined") return createChat(tool);
  let chat = chats.get(tool);
  if (!chat) {
    chat = createChat(tool);
    chats.set(tool, chat);
  }
  return chat;
}

/** Turns transport/server errors into a readable sentence. */
export function readableError(error: Error | undefined): string | null {
  if (!error) return null;
  const msg = error.message || "";
  try {
    const parsed = JSON.parse(msg) as { error?: string };
    if (parsed.error) return parsed.error;
  } catch {
    /* not JSON */
  }
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return "Network error — check your internet connection and try again.";
  }
  return msg || "Something went wrong. Please try again.";
}

export function getMessageText(message: UIMessage | undefined) {
  if (!message) return "";
  return message.parts
    .filter((p): p is Extract<UIMessage["parts"][number], { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("");
}

/** Single-turn AI generation for a tool, sharing the secure /api/ai route. */
export function useAiTool(tool: Exclude<ToolId, "chat">) {
  const { language } = useAppState();
  const chat = useMemo(() => getChat(tool), [tool]);
  const { messages, status, error, sendMessage, stop, setMessages, clearError } = useChat({ chat });

  const assistant = [...messages].reverse().find((m) => m.role === "assistant");
  const output = getMessageText(assistant);
  const sources = useMemo(() => {
    const seen = new Set<string>();
    return (assistant?.parts ?? []).filter((p): p is SourceUrlUIPart => {
      if (p.type !== "source-url" || seen.has(p.url)) return false;
      seen.add(p.url);
      return true;
    });
  }, [assistant]);

  const run = useCallback(
    (req: LastRequest) => {
      lastRequests.set(tool, req);
      clearError();
      setMessages([]);
      void sendMessage({ text: req.summary }, { body: { tool, language: req.language, input: req.input } });
    },
    [tool, clearError, setMessages, sendMessage],
  );

  const generate = useCallback(
    (input: unknown, summary: string, activityLabel: string) => run({ input, summary, language, activityLabel }),
    [run, language],
  );

  const regenerate = useCallback(() => {
    const last = lastRequests.get(tool);
    if (last) run({ ...last, language });
  }, [run, tool, language]);

  const busy = status === "submitted" || status === "streaming";

  return {
    output,
    sources,
    status,
    busy,
    error: readableError(error),
    generate,
    regenerate,
    canRegenerate: lastRequests.has(tool),
    stop,
    language,
  };
}

export type AiToolState = ReturnType<typeof useAiTool>;
