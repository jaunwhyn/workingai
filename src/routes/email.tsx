import { createFileRoute } from "@tanstack/react-router";
import { Mail, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AIOutputPanel } from "@/components/ai-output-panel";
import { FieldLabel, PageHeader } from "@/components/page-header";
import { ChoiceChips, LanguageField, ToolLayout } from "@/components/tool-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAiTool } from "@/hooks/use-ai-tool";
import { EMAIL_TONES } from "@/lib/ai/prompts";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace Productivity Assistant" },
      { name: "description", content: "Generate complete professional emails with AI in 7 tones and 60 languages." },
      { property: "og:title", content: "Smart Email Generator" },
      { property: "og:description", content: "Generate complete professional emails with AI in 7 tones and 60 languages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

type Tone = (typeof EMAIL_TONES)[number];

function EmailPage() {
  const ai = useAiTool("email");
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [points, setPoints] = useState("");
  const [instructions, setInstructions] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) {
      toast.error("Please describe the subject or purpose of the email.");
      return;
    }
    ai.generate(
      { purpose, recipient, points, instructions, tone },
      `Email: ${purpose}`,
      `Email generated · ${tone} · ${ai.language}`,
    );
  };

  return (
    <>
      <PageHeader icon={Mail} title="Smart Email Generator" description="Describe what you need — get a complete email with subject, greeting, body and closing." />
      <ToolLayout
        form={
          <form onSubmit={submit} className="space-y-5">
            <div>
              <FieldLabel htmlFor="purpose">Subject or purpose *</FieldLabel>
              <Input id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Request to reschedule Thursday's project review" maxLength={500} />
            </div>
            <div>
              <FieldLabel htmlFor="recipient" hint="Name or role">Recipient</FieldLabel>
              <Input id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Sarah, Head of Operations" maxLength={200} />
            </div>
            <div>
              <FieldLabel htmlFor="points">Main points to communicate</FieldLabel>
              <Textarea id="points" rows={5} value={points} onChange={(e) => setPoints(e.target.value)} placeholder={"- Conflict with client workshop\n- Propose Friday 10:00 instead\n- Slides will be shared on Wednesday"} maxLength={6000} />
            </div>
            <div>
              <FieldLabel htmlFor="instructions">Additional instructions</FieldLabel>
              <Textarea id="instructions" rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g. Keep it under 150 words, mention the budget is unchanged" maxLength={2000} />
            </div>
            <ChoiceChips label="Tone" options={EMAIL_TONES.map((t) => ({ value: t, label: t }))} value={tone} onChange={setTone} />
            <LanguageField />
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={ai.busy}>
              <Send /> {ai.busy ? "Generating…" : "Generate Email"}
            </Button>
          </form>
        }
        output={<AIOutputPanel ai={ai} title="Your email" downloadName="email" emptyIcon={Mail} emptyText="Fill in the details and press Generate Email. Your draft will appear here." />}
      />
    </>
  );
}
