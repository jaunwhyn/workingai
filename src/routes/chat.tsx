import { Chat, useChat } from "@ai-sdk/react";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AlertCircle, Copy, MessagesSquare, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import workmateAvatar from "@/assets/workmate-avatar.png";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageAction, MessageActions, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { LanguageSelect } from "@/components/language-select";
import { ResponsibleAINotice } from "@/components/responsible-ai-notice";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getMessageText, readableError } from "@/hooks/use-ai-tool";
import { logActivity } from "@/lib/app-data";
import { useAppState } from "@/lib/app-state";
import { RTL_LANGUAGES } from "@/lib/languages";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "WorkMate AI Chatbot — AI Workplace Productivity Assistant" },
      { name: "description", content: "Chat with WorkMate AI for workplace questions, brainstorming, explanations and productivity help in 60 languages." },
      { property: "og:title", content: "WorkMate AI — Workplace Chatbot" },
      { property: "og:description", content: "Chat with WorkMate AI for workplace questions, brainstorming, explanations and productivity help in 60 languages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

const STORAGE_KEY = "wpa.chat";

const SUGGESTED = [
  "How can I run a more productive weekly team meeting?",
  "Brainstorm 5 ideas to improve employee onboarding",
  "Explain OKRs vs KPIs in simple terms",
  "Help me write a polite follow-up after no reply",
];

// Single in-memory conversation for this browser tab, mirrored to sessionStorage.
let chatInstance: Chat<UIMessage> | null = null;
function getChat() {
  if (!chatInstance) {
    let initial: UIMessage[] = [];
    try {
      initial = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]") as UIMessage[];
    } catch {
      initial = [];
    }
    chatInstance = new Chat<UIMessage>({
      id: "workmate",
      messages: initial,
      transport: new DefaultChatTransport({ api: "/api/ai" }),
      onFinish: ({ isAbort, isError }) => {
        if (!isAbort && !isError) logActivity("chat", "WorkMate AI replied");
      },
    });
  }
  return chatInstance;
}

function ChatPage() {
  return (
    <div className="flex h-[calc(100svh-4rem-3rem)] min-h-[520px] flex-col gap-4 lg:h-[calc(100svh-4rem-4rem)]">
      <header className="flex flex-wrap items-center gap-3 animate-rise">
        <img src={workmateAvatar} alt="WorkMate AI" width={48} height={48} className="size-12" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">WorkMate AI</h1>
          <p className="text-sm text-muted-foreground">Your workplace assistant — ask, brainstorm, explain, write.</p>
        </div>
      </header>
      <ClientOnly fallback={<ChatSkeleton />}>
        <ChatWindow />
      </ClientOnly>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="surface-card flex flex-1 flex-col gap-3 p-6">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

function ChatWindow() {
  const { language } = useAppState();
  const { messages, status, error, sendMessage, stop, setMessages, regenerate, clearError } = useChat({ chat: getChat() });
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const busy = status === "submitted" || status === "streaming";
  const rtl = RTL_LANGUAGES.has(language);

  useEffect(() => {
    if (status === "ready" || status === "error") {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        /* ignore */
      }
    }
  }, [messages, status]);

  useEffect(() => {
    if (!busy) textareaRef.current?.focus();
  }, [busy]);

  const send = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    clearError();
    void sendMessage({ text: trimmed }, { body: { tool: "chat", language } });
    setText("");
  };

  const onSubmit = (msg: PromptInputMessage) => send(msg.text ?? text);

  const clear = () => {
    stop();
    setMessages([]);
    clearError();
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    textareaRef.current?.focus();
    toast.success("Conversation cleared");
  };

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  return (
    <div className="surface-card flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
        <span className="text-xs text-muted-foreground">
          {messages.length ? `${messages.length} message${messages.length === 1 ? "" : "s"} · kept for this session only` : "New conversation"}
        </span>
        <Button variant="ghost" size="sm" onClick={clear} disabled={messages.length === 0 && !error}>
          <Trash2 /> Clear conversation
        </Button>
      </div>

      <Conversation className="min-h-0 flex-1 bg-gradient-ai">
        <ConversationContent className="mx-auto w-full max-w-3xl gap-6 px-4 py-6" dir={rtl ? "rtl" : undefined}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center py-6 text-center">
              <img src={workmateAvatar} alt="" width={72} height={72} className="size-18" />
              <h2 className="mt-3 text-lg font-bold">How can I help you today?</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                I reply in <span className="font-semibold text-foreground">{language}</span>. Write in any language — change it anytime below.
              </p>
              <div className="mt-6 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                {SUGGESTED.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="rounded-xl border bg-card p-3 text-left text-sm shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const content = getMessageText(m);
            if (m.role === "user") {
              return (
                <Message key={m.id} from="user">
                  <MessageContent className="group-[.is-user]:rounded-2xl group-[.is-user]:rounded-br-sm group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground">
                    <p className="whitespace-pre-wrap">{content}</p>
                  </MessageContent>
                </Message>
              );
            }
            const streamingThis = status === "streaming" && m.id === lastAssistantId;
            return (
              <Message key={m.id} from="assistant">
                <div className="flex gap-3">
                  <img src={workmateAvatar} alt="" width={28} height={28} className="mt-0.5 size-7 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <MessageContent className="text-[15px] leading-relaxed">
                      {content ? (
                        <MessageResponse isAnimating={streamingThis}>{content}</MessageResponse>
                      ) : streamingThis ? (
                        <Shimmer>Thinking…</Shimmer>
                      ) : null}
                    </MessageContent>
                    {!streamingThis && content && (
                      <MessageActions className="mt-1">
                        <MessageAction
                          tooltip="Copy"
                          onClick={() => {
                            void navigator.clipboard.writeText(content).then(() => toast.success("Copied"));
                          }}
                        >
                          <Copy className="size-3.5" />
                        </MessageAction>
                        {m.id === lastAssistantId && !busy && (
                          <MessageAction tooltip="Regenerate" onClick={() => void regenerate({ body: { tool: "chat", language } })}>
                            <RefreshCw className="size-3.5" />
                          </MessageAction>
                        )}
                      </MessageActions>
                    )}
                  </div>
                </div>
              </Message>
            );
          })}

          {status === "submitted" && (
            <Message from="assistant">
              <div className="flex items-center gap-3">
                <img src={workmateAvatar} alt="" width={28} height={28} className="size-7 shrink-0" />
                <Shimmer className="text-sm">WorkMate is thinking…</Shimmer>
              </div>
            </Message>
          )}

          {error && (
            <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-card p-3 text-sm">
              <AlertCircle className="size-4 text-destructive" />
              <span className="flex-1">{readableError(error)}</span>
              <Button size="sm" variant="outline" onClick={() => void regenerate({ body: { tool: "chat", language } })}>
                <RefreshCw /> Retry
              </Button>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t bg-card p-3 sm:p-4">
        <div className="mx-auto w-full max-w-3xl">
          <PromptInput onSubmit={onSubmit}>
            <PromptInputTextarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Message WorkMate AI…"
              aria-label="Message WorkMate AI"
              maxLength={8000}
              dir={rtl ? "auto" : undefined}
            />
            <PromptInputFooter>
              <LanguageSelect compact className="h-8 border-0 bg-transparent shadow-none" />
              <PromptInputSubmit status={status} onStop={stop} disabled={!busy && !text.trim()} />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            WorkMate AI can make mistakes. Verify important information. Don't share confidential data.
          </p>
        </div>
      </div>
    </div>
  );
}

export { ResponsibleAINotice };
