import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Wand2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AIOutputPanel } from "@/components/ai-output-panel";
import { FieldLabel, PageHeader } from "@/components/page-header";
import { LanguageField, ToolLayout } from "@/components/tool-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAiTool } from "@/hooks/use-ai-tool";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI Workplace Productivity Assistant" },
      { name: "description", content: "Turn meeting notes into decisions, action items, owners, deadlines and next steps with AI." },
      { property: "og:title", content: "Meeting Notes Summarizer" },
      { property: "og:description", content: "Turn meeting notes into decisions, action items, owners, deadlines and next steps with AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeetingsPage,
});

const EXAMPLE = `Example notes (for demonstration):
Weekly marketing sync – attendees: Thandi, Marco, Priya.
Discussed Q3 campaign results; social engagement up but email open rates dropped.
Agreed to move the product launch webinar to the second week of next month.
Marco to draft new email subject line tests by Friday.
Priya will look into budget for paid ads – no date set.
Question: do we need legal review for the new testimonial videos?`;

function MeetingsPage() {
  const ai = useAiTool("meeting");
  const [notes, setNotes] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (notes.trim().length < 20) {
      toast.error("Please paste your meeting notes (at least a few sentences).");
      return;
    }
    ai.generate({ notes }, "Summarise meeting notes", `Meeting summary generated · ${ai.language}`);
  };

  return (
    <>
      <PageHeader icon={ClipboardList} title="Meeting Notes Summarizer" description="Paste raw notes or a transcript. The AI extracts decisions, action items, owners and deadlines — and flags anything missing." />
      <ToolLayout
        form={
          <form onSubmit={submit} className="space-y-5">
            <div>
              <FieldLabel htmlFor="notes" hint={`${notes.length.toLocaleString()} / 40,000`}>
                Meeting notes *
              </FieldLabel>
              <Textarea id="notes" rows={14} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste your meeting notes here…" maxLength={40000} className="min-h-[300px]" />
              <button type="button" onClick={() => setNotes(EXAMPLE)} className="mt-2 text-xs font-semibold text-primary hover:underline">
                Insert example notes
              </button>
            </div>
            <p className="rounded-lg bg-sky-soft p-3 text-xs text-sky-foreground">
              The AI only reports decisions, owners and deadlines that appear in your notes. Missing details are marked “Not specified”.
            </p>
            <LanguageField />
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={ai.busy}>
              <Wand2 /> {ai.busy ? "Summarizing…" : "Summarize Notes"}
            </Button>
          </form>
        }
        output={<AIOutputPanel ai={ai} title="Meeting summary" downloadName="meeting-summary" emptyIcon={ClipboardList} regenerateLabel="Regenerate Summary" emptyText="Your structured summary — overview, decisions, action items and next steps — will appear here." />}
      />
    </>
  );
}
