import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, RetryError, convertToModelMessages, streamText, type ModelMessage, type UIMessage } from "ai";

import { buildChatInstructions, buildToolPrompt, requestSchema } from "./prompts";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function readGatewayMessage(body: string | undefined) {
  if (!body) return undefined;
  try {
    const parsed = JSON.parse(body) as { message?: string; error?: { message?: string } | string };
    if (typeof parsed.message === "string") return parsed.message;
    if (typeof parsed.error === "string") return parsed.error;
    if (parsed.error && typeof parsed.error.message === "string") return parsed.error.message;
  } catch {
    /* not JSON */
  }
  return undefined;
}

/** Converts provider errors into a short, safe message the user can act on. */
export function friendlyAiError(error: unknown): string {
  console.error("[ai] generation failed", error);
  const base = RetryError.isInstance(error) ? error.lastError : error;
  if (APICallError.isInstance(base)) {
    const detail = readGatewayMessage(base.responseBody);
    switch (base.statusCode) {
      case 400:
        return "The AI could not process this request. Try shortening or rephrasing your input.";
      case 401:
        return "The AI service is not configured correctly (invalid API key). The app owner needs to fix the AI setup.";
      case 402:
        return detail ?? "AI credits have run out for this app. The app owner needs to add credits before more responses can be generated.";
      case 403:
        return detail ?? "The AI service declined this request.";
      case 429:
        return "Too many requests right now. Please wait a moment and try again.";
      default:
        if (base.statusCode && base.statusCode >= 500) {
          return "The AI service is temporarily unavailable. Please try again in a moment.";
        }
    }
  }
  return "Something went wrong while generating the response. Please try again.";
}

export async function handleAiRequest(request: Request): Promise<Response> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    return json({ error: "The AI service is not configured: the server is missing its LOVABLE_API_KEY." }, 500);
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) {
    return json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, 400);
  }
  const { tool, language, input } = parsed.data;
  const uiMessages = parsed.data.messages as UIMessage[];

  let instructions: string;
  let messages: ModelMessage[];
  if (tool === "chat") {
    if (uiMessages.length === 0) return json({ error: "Please type a message." }, 400);
    instructions = buildChatInstructions(language);
    messages = await convertToModelMessages(uiMessages);
  } else {
    const built = buildToolPrompt(tool, input, language);
    if (!built.ok) return json({ error: built.error }, 400);
    instructions = built.built.instructions;
    messages = [{ role: "user", content: built.built.prompt }];
  }

  const useWebSearch =
    tool === "research" && typeof input === "object" && input !== null && (input as { webSearch?: unknown }).webSearch === true;

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    instructions,
    messages,
    abortSignal: request.signal,
    ...(useWebSearch ? { tools: { web_search: provider.tools.webSearch({}) } } : {}),
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: tool === "chat" ? "low" : "medium",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: uiMessages,
      sendReasoning: true,
      sendSources: true,
      onError: friendlyAiError,
    }),
    runIdFetch,
  );
}
