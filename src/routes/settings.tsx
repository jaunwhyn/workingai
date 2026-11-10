import { createFileRoute } from "@tanstack/react-router";
import { History, ListTodo, MessagesSquare, Moon, Settings, Sun } from "lucide-react";
import { toast } from "sonner";

import { LanguageSelect } from "@/components/language-select";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { activityStore, tasksStore } from "@/lib/app-data";
import { useAppState } from "@/lib/app-state";
import { LANGUAGES } from "@/lib/languages";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI Workplace Productivity Assistant" },
      { name: "description", content: "Choose your AI response language and theme, and clear any data stored in this browser." },
      { property: "og:title", content: "Settings — AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Choose your AI response language and theme, and clear any data stored in this browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useAppState();
  const activity = activityStore.useValue();
  const tasks = tasksStore.useValue();

  const clearChat = () => {
    try {
      sessionStorage.removeItem("wpa.chat");
    } catch {
      /* ignore */
    }
    toast.success("Chat history cleared. Reload the chat page to start fresh.");
  };

  return (
    <div className="max-w-3xl">
      <PageHeader icon={Settings} title="Settings" description="Preferences are stored only in this browser. Nothing is linked to an account." />
      <div className="space-y-4">
        <Row title="AI response language" description={`All six tools write their responses in this language. ${LANGUAGES.length} languages available.`}>
          <LanguageSelect className="sm:w-64" />
        </Row>
        <Row title="Theme" description="Switch between light and dark appearance.">
          <div className="flex gap-2">
            <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")} aria-pressed={theme === "light"}>
              <Sun /> Light
            </Button>
            <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")} aria-pressed={theme === "dark"}>
              <Moon /> Dark
            </Button>
          </div>
        </Row>

        <h2 className="pt-4 text-lg font-bold">Your data</h2>
        <Row icon={History} title="Session activity" description={`${activity.length} entries. Only tool names and timestamps — never your content. Cleared when you close the tab.`}>
          <Button variant="outline" disabled={!activity.length} onClick={() => { activityStore.reset(); toast.success("Activity cleared"); }}>
            Clear activity
          </Button>
        </Row>
        <Row icon={MessagesSquare} title="WorkMate AI conversation" description="Kept in this tab's session storage only, so it disappears when you close the tab.">
          <Button variant="outline" onClick={clearChat}>Clear chat</Button>
        </Row>
        <Row icon={ListTodo} title="Planner tasks" description={`${tasks.length} task${tasks.length === 1 ? "" : "s"} saved in this browser so your plan is still here next time.`}>
          <Button variant="destructive" disabled={!tasks.length} onClick={() => { tasksStore.reset(); toast.success("All tasks deleted"); }}>
            Delete all tasks
          </Button>
        </Row>
      </div>
    </div>
  );
}

function Row({ icon: Icon, title, description, children }: { icon?: typeof Sun; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="surface-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon && <Icon className="mt-0.5 size-5 shrink-0 text-primary" />}
        <div>
          <h3 className="text-sm font-bold">{title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
