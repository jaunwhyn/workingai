import { createFileRoute } from "@tanstack/react-router";
import { PenLine, Wand2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AIOutputPanel } from "@/components/ai-output-panel";
import { FieldLabel, PageHeader } from "@/components/page-header";
import { ChoiceChips, LanguageField, ToolLayout } from "@/components/tool-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAiTool } from "@/hooks/use-ai-tool";
import { WRITING_ACTIONS, WRITING_TONES } from "@/lib/ai/prompts";

export const Route = createFileRoute("/writing")({
  head: () => ({
    meta: [
      { title: "AI Writing Assistant — AI Workplace Productivity Assistant" },
      { name: "description", content: "Improve grammar, rewrite professionally, simplify, expand or summarise any text with AI." },
      { property: "og:title", content: "AI Writing Assistant" },
      { property: "og:description", content: "Improve grammar, rewrite professionally, simplify, expand or summarise any text with AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WritingPage,
});

type Tone = (typeof WRITING_TONES)[number];

function WritingPage() {
  const ai = useAiTool("writing");
  const [text, setText] = useState("");
  const [action, setAction] = useState<string>(WRITING_ACTIONS[0].id);
  const [tone, setTone] = useState<Tone>("Professional");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error("Please paste the text you want to improve.");
      return;
    }
    const label = WRITING_ACTIONS.find((a) => a.id === action)?.label ?? "Writing";
    ai.generate({ text, action, tone }, `${label}`, `${label} · ${tone} · ${ai.language}`);
  };

  return (
    <>
      <PageHeader icon={PenLine} title="AI Writing Assistant" description="Paste any text, choose what to do with it, and get an editable improved version." />
      <ToolLayout
        form={
          <form onSubmit={submit} className="space-y-5">
            <div>
              <FieldLabel htmlFor="text" hint={`${text.length.toLocaleString()} / 20,000`}>
                Your text *
              </FieldLabel>
              <Textarea id="text" rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the text you want to improve…" maxLength={20000} className="min-h-[220px]" />
            </div>
            <ChoiceChips label="What should the AI do?" options={WRITING_ACTIONS.map((a) => ({ value: a.id, label: a.label }))} value={action} onChange={setAction} />
            <ChoiceChips label="Tone" options={WRITING_TONES.map((t) => ({ value: t, label: t }))} value={tone} onChange={setTone} />
            <LanguageField />
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={ai.busy}>
              <Wand2 /> {ai.busy ? "Working…" : "Improve Text"}
            </Button>
          </form>
        }
        output={<AIOutputPanel ai={ai} title="Improved text" downloadName="writing" emptyIcon={PenLine} emptyText="Your improved text will appear here. You can edit, copy or download it." />}
      />
    </>
  );
}
