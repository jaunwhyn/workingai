import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe2, Info, KeyRound, Languages, Lock, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { ResponsibleAINotice } from "@/components/responsible-ai-notice";
import { LANGUAGES } from "@/lib/languages";
import { TOOLS } from "@/lib/tools";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — AI Workplace Productivity Assistant" },
      { name: "description", content: "How the AI Workplace Productivity Assistant works, how your data is handled, and our Responsible AI approach." },
      { property: "og:title", content: "About the AI Workplace Productivity Assistant" },
      { property: "og:description", content: "How the AI Workplace Productivity Assistant works, how your data is handled, and our Responsible AI approach." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const PRINCIPLES = [
  { icon: Globe2, title: "Open to everyone", text: "No account, sign-in, email or password. Open the link and start working." },
  { icon: KeyRound, title: "Secure AI connection", text: "Every request goes through a protected server. AI keys never reach your browser." },
  { icon: Lock, title: "Privacy-conscious", text: "Your inputs are sent only to generate a response and are not saved on our servers. Session activity stores tool names only." },
  { icon: Languages, title: `${LANGUAGES.length} languages`, text: "Choose an output language once — every tool writes its response in that language." },
];

function AboutPage() {
  return (
    <div className="max-w-4xl space-y-8">
      <PageHeader icon={Info} title="About this assistant" description="An all-in-one AI workplace productivity platform for employees, students, entrepreneurs, managers and professionals." />

      <section className="grid gap-4 sm:grid-cols-2">
        {PRINCIPLES.map((p) => (
          <div key={p.title} className="surface-card p-5">
            <p.icon className="size-5 text-primary" />
            <h2 className="mt-3 text-base font-bold">{p.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
          </div>
        ))}
      </section>

      <section className="surface-card p-6">
        <h2 className="text-lg font-bold">What's inside</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {TOOLS.map((t) => (
            <li key={t.id}>
              <Link to={t.path} className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-primary-soft">
                <t.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <span className="block text-sm font-semibold">{t.title}</span>
                  <span className="block text-xs text-muted-foreground">{t.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface-card p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <h2 className="text-lg font-bold">How AI is used</h2>
        </div>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>All responses are generated live by an AI model (Lovable AI). Nothing is pre-written.</li>
          <li>Each tool uses its own specialised instructions, but all share one secure connection.</li>
          <li>The Meeting Summarizer is instructed never to invent decisions, owners or deadlines.</li>
          <li>The Research Assistant links only to pages it actually found on the web; with web search off it gives no citations.</li>
          <li>Everything the AI produces is labelled as AI-generated so you can review it.</li>
        </ul>
      </section>

      <ResponsibleAINotice />
    </div>
  );
}
