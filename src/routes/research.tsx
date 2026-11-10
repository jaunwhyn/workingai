import { createFileRoute } from "@tanstack/react-router";
import { BookOpenText, Globe, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AIOutputPanel } from "@/components/ai-output-panel";
import { FieldLabel, PageHeader } from "@/components/page-header";
import { ChoiceChips, LanguageField, ToolLayout } from "@/components/tool-form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAiTool } from "@/hooks/use-ai-tool";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — AI Workplace Productivity Assistant" },
      { name: "description", content: "Research workplace topics with AI: summaries, key findings, limitations and real web source links." },
      { property: "og:title", content: "AI Research Assistant" },
      { property: "og:description", content: "Research workplace topics with AI: summaries, key findings, limitations and real web source links." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchPage,
});

const SUGGESTIONS = [
  "What are the pros and cons of a four-day work week?",
  "How does POPIA affect how small businesses store customer data?",
  "Best practices for running effective hybrid meetings",
];

function ResearchPage() {
  const ai = useAiTool("research");
  const [question, setQuestion] = useState("");
  const [depth, setDepth] = useState<"overview" | "detailed">("overview");
  const [webSearch, setWebSearch] = useState(true);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (question.trim().length < 3) {
      toast.error("Please enter a research question or topic.");
      return;
    }
    ai.generate({ question, depth, webSearch }, `Research: ${question}`, `Research summary · ${webSearch ? "with web sources" : "AI explanation"} · ${ai.language}`);
  };

  return (
    <>
      <PageHeader icon={BookOpenText} title="AI Research Assistant" description="Ask about any workplace topic. Get a structured explanation, key findings, limitations and follow-up questions." />
      <ToolLayout
        form={
          <form onSubmit={submit} className="space-y-5">
            <div>
              <FieldLabel htmlFor="question">Research question or topic *</FieldLabel>
              <Textarea id="question" rows={4} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. What does research say about the impact of remote work on productivity?" maxLength={3000} />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => setQuestion(s)} className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <ChoiceChips label="Depth" options={[{ value: "overview", label: "Quick overview" }, { value: "detailed", label: "Detailed" }] as const} value={depth} onChange={setDepth} />
            <div className="flex items-start justify-between gap-4 rounded-xl border bg-background p-4">
              <div>
                <label htmlFor="web-search" className="flex items-center gap-2 text-sm font-semibold">
                  <Globe className="size-4 text-primary" /> Search the web for sources
                </label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {webSearch
                    ? "The AI searches the web and links the real pages it used. Sources appear below the answer."
                    : "Off: the answer is a general AI explanation without verified sources or citations."}
                </p>
              </div>
              <Switch id="web-search" checked={webSearch} onCheckedChange={setWebSearch} />
            </div>
            <LanguageField />
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={ai.busy}>
              <Search /> {ai.busy ? "Researching…" : "Research Topic"}
            </Button>
          </form>
        }
        output={<AIOutputPanel ai={ai} title="Research summary" downloadName="research" emptyIcon={BookOpenText} emptyText="Your research summary with key findings, limitations and further questions will appear here." />}
      />
    </>
  );
}
