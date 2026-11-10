import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, CheckCircle2, ClipboardList, History, ListPlus, Mail, Languages } from "lucide-react";

import { ResponsibleAINotice } from "@/components/responsible-ai-notice";
import { Button } from "@/components/ui/button";
import { activityStore, tasksStore } from "@/lib/app-data";
import { useAppState } from "@/lib/app-state";
import { LANGUAGES } from "@/lib/languages";
import { TOOLS, TOOL_BY_ID } from "@/lib/tools";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content: "Your AI Workplace Productivity Hub: write emails, summarise meetings, plan tasks, research and chat with AI — free, no sign-in.",
      },
      { property: "og:title", content: "Your AI Workplace Productivity Hub" },
      {
        property: "og:description",
        content: "Work smarter, save time, and achieve more with your personal AI productivity assistant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { language } = useAppState();
  const activity = activityStore.useValue();
  const tasks = tasksStore.useValue();
  const emails = activity.filter((a) => a.kind === "email").length;
  const summaries = activity.filter((a) => a.kind === "meeting").length;
  const completed = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-hero p-6 shadow-card sm:p-10 animate-rise">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-sky/30 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold text-primary">
            <Languages className="size-3.5" /> AI responses in {language} · {LANGUAGES.length} languages available
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">
            Your AI Workplace <span className="text-gradient-brand">Productivity Hub</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Work smarter, save time, and achieve more with your personal AI productivity assistant.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild variant="hero" size="lg">
              <Link to="/chat">
                Ask WorkMate AI <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-card/70">
              <Link to="/email">Write an email</Link>
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Your activity
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={ListPlus}
            label="Total tasks created"
            value={tasks.length}
            hint={tasks.length ? `${completed} completed · saved in this browser` : "Add tasks in the AI Task Planner"}
          />
          <StatCard icon={Mail} label="Emails generated" value={emails} hint="During this session" />
          <StatCard icon={ClipboardList} label="Meeting summaries" value={summaries} hint="During this session" />
        </div>
      </section>

      <section aria-labelledby="tools-heading">
        <div className="mb-4 flex items-end justify-between gap-2">
          <div>
            <h2 id="tools-heading" className="text-xl font-bold">
              AI tools
            </h2>
            <p className="text-sm text-muted-foreground">Six assistants, one secure AI connection.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {TOOLS.map((tool, i) => (
            <article
              key={tool.id}
              className="group surface-card flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift animate-rise"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <tool.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-bold">{tool.title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{tool.description}</p>
              <Button asChild variant="soft" className="mt-4 w-full justify-between">
                <Link to={tool.path}>
                  {tool.cta} <ArrowRight />
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-5">
        <section aria-labelledby="recent-heading" className="surface-card p-5 lg:col-span-3">
          <div className="mb-3 flex items-center gap-2">
            <History className="size-4 text-primary" />
            <h2 id="recent-heading" className="text-base font-bold">
              Recent activity
            </h2>
            <span className="ml-auto text-xs text-muted-foreground">This session only</span>
          </div>
          {activity.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No activity yet. Generate something with any AI tool and it will appear here.
            </p>
          ) : (
            <ul className="divide-y">
              {activity.slice(0, 8).map((a) => {
                const Icon = a.kind === "task" ? CheckCircle2 : TOOL_BY_ID[a.kind].icon;
                return (
                  <li key={a.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sky-soft text-sky-foreground">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{a.label}</span>
                    <time className="shrink-0 text-xs text-muted-foreground" dateTime={new Date(a.at).toISOString()}>
                      {formatDistanceToNow(a.at, { addSuffix: true })}
                    </time>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="quick-heading" className="surface-card p-5 lg:col-span-2">
          <h2 id="quick-heading" className="mb-3 text-base font-bold">
            Quick access
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {TOOLS.map((tool) => (
              <Link
                key={tool.id}
                to={tool.path}
                className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary"
              >
                <tool.icon className="size-4 shrink-0" />
                <span className="truncate">{tool.shortTitle}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <ResponsibleAINotice />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Mail;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="surface-card flex items-center gap-4 p-5">
      <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-sky text-sky-foreground border border-sky/40")}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-display text-3xl font-bold tabular-nums">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}
