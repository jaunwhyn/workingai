import { createFileRoute } from "@tanstack/react-router";

import { handleAiRequest } from "@/lib/ai/ai.server";

// Shared, secure AI endpoint used by all six tools. The API key never leaves the server.
export const Route = createFileRoute("/api/ai")({
  server: { handlers: { POST: ({ request }) => handleAiRequest(request) } },
});
