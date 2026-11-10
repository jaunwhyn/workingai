import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarClock, CalendarDays, Clock, Pencil, Plus, Sparkle, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AIOutputPanel } from "@/components/ai-output-panel";
import { FieldLabel, PageHeader } from "@/components/page-header";
import { LanguageField } from "@/components/tool-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAiTool } from "@/hooks/use-ai-tool";
import { logActivity, plannerSettingsStore, tasksStore, type StoredTask } from "@/lib/app-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — AI Workplace Productivity Assistant" },
      { name: "description", content: "Add your tasks and let AI prioritise them, build daily and weekly schedules and flag conflicts." },
      { property: "og:title", content: "AI Task Planner" },
      { property: "og:description", content: "Add your tasks and let AI prioritise them, build daily and weekly schedules and flag conflicts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlannerPage,
});

type Priority = StoredTask["priority"];
const PRIORITY_ORDER: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

interface Draft {
  name: string;
  description: string;
  priority: Priority;
  deadline: string;
  estimatedHours: string;
}
const EMPTY: Draft = { name: "", description: "", priority: "Medium", deadline: "", estimatedHours: "" };

function PlannerPage() {
  const ai = useAiTool("planner");
  const tasks = tasksStore.useValue();
  const settings = plannerSettingsStore.useValue();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sorted = [...tasks].sort(
    (a, b) => Number(a.completed) - Number(b.completed) || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || (a.deadline || "9999").localeCompare(b.deadline || "9999"),
  );
  const openCount = tasks.filter((t) => !t.completed).length;

  const saveTask = (e: FormEvent) => {
    e.preventDefault();
    const name = draft.name.trim();
    if (!name) {
      toast.error("Please enter a task name.");
      return;
    }
    const hours = draft.estimatedHours.trim() === "" ? null : Number(draft.estimatedHours);
    if (hours != null && (Number.isNaN(hours) || hours < 0)) {
      toast.error("Estimated time must be a positive number of hours.");
      return;
    }
    const fields = { name, description: draft.description.trim(), priority: draft.priority, deadline: draft.deadline, estimatedHours: hours };
    if (editingId) {
      tasksStore.set((prev) => prev.map((t) => (t.id === editingId ? { ...t, ...fields } : t)));
      toast.success("Task updated");
    } else {
      tasksStore.set((prev) => [...prev, { ...fields, id: crypto.randomUUID(), createdAt: Date.now(), completed: false }]);
      logActivity("task", `Task added · ${draft.priority} priority`);
      toast.success("Task added");
    }
    setDraft(EMPTY);
    setEditingId(null);
  };

  const startEdit = (t: StoredTask) => {
    setEditingId(t.id);
    setDraft({ name: t.name, description: t.description, priority: t.priority, deadline: t.deadline, estimatedHours: t.estimatedHours?.toString() ?? "" });
  };

  const remove = (id: string) => {
    tasksStore.set((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setDraft(EMPTY);
    }
  };

  const toggle = (id: string) => {
    tasksStore.set((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    const task = tasks.find((t) => t.id === id);
    if (task && !task.completed) logActivity("task", "Task marked as completed");
  };

  const generate = () => {
    if (openCount === 0) {
      toast.error("Add at least one open task before generating a schedule.");
      return;
    }
    if (!settings.workingHours.trim()) {
      toast.error("Please describe your available working hours.");
      return;
    }
    ai.generate(
      {
        tasks: tasks.map(({ name, description, priority, deadline, estimatedHours, completed }) => ({ name, description, priority, deadline, estimatedHours, completed })),
        workingHours: settings.workingHours,
        instructions: settings.instructions,
        today: format(new Date(), "EEEE, d MMMM yyyy"),
      },
      "Generate schedule",
      `Schedule generated for ${openCount} task${openCount === 1 ? "" : "s"} · ${ai.language}`,
    );
  };

  return (
    <>
      <PageHeader icon={CalendarClock} title="AI Task Planner" description="Add your tasks, set your working hours, and get a prioritised daily and weekly plan with breaks and conflict checks." />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="space-y-6">
          <form onSubmit={saveTask} className="surface-card space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">{editingId ? "Edit task" : "Add a task"}</h2>
              {editingId && (
                <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingId(null); setDraft(EMPTY); }}>
                  <X /> Cancel
                </Button>
              )}
            </div>
            <div>
              <FieldLabel htmlFor="task-name">Task name *</FieldLabel>
              <Input id="task-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Prepare quarterly budget report" maxLength={200} />
            </div>
            <div>
              <FieldLabel htmlFor="task-desc">Description</FieldLabel>
              <Textarea id="task-desc" rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Optional details" maxLength={1500} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <FieldLabel htmlFor="task-priority">Priority</FieldLabel>
                <Select value={draft.priority} onValueChange={(v) => setDraft({ ...draft, priority: v as Priority })}>
                  <SelectTrigger id="task-priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel htmlFor="task-deadline">Deadline</FieldLabel>
                <Input id="task-deadline" type="date" value={draft.deadline} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} />
              </div>
              <div>
                <FieldLabel htmlFor="task-hours">Est. hours</FieldLabel>
                <Input id="task-hours" type="number" min={0} step={0.5} inputMode="decimal" value={draft.estimatedHours} onChange={(e) => setDraft({ ...draft, estimatedHours: e.target.value })} placeholder="e.g. 3" />
              </div>
            </div>
            <Button type="submit" className="w-full">
              {editingId ? <Pencil /> : <Plus />} {editingId ? "Save changes" : "Add task"}
            </Button>
          </form>

          <section aria-labelledby="task-list" className="surface-card p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="task-list" className="text-base font-bold">Your tasks</h2>
              <span className="text-xs text-muted-foreground">{openCount} open · {tasks.length - openCount} done</span>
            </div>
            {sorted.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No tasks yet. Add your first task above.</p>
            ) : (
              <ul className="space-y-2">
                {sorted.map((t) => (
                  <li key={t.id} className={cn("flex items-start gap-3 rounded-xl border bg-background p-3 transition-opacity", t.completed && "opacity-60", editingId === t.id && "border-primary/50 ring-2 ring-primary/15")}>
                    <Checkbox checked={t.completed} onCheckedChange={() => toggle(t.id)} aria-label={`Mark "${t.name}" as ${t.completed ? "not completed" : "completed"}`} className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-semibold", t.completed && "line-through")}>{t.name}</p>
                      {t.description && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{t.description}</p>}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
                        <PriorityBadge priority={t.priority} />
                        {t.deadline && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                            <CalendarDays className="size-3" /> {format(new Date(`${t.deadline}T00:00:00`), "d MMM yyyy")}
                          </span>
                        )}
                        {t.estimatedHours != null && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                            <Clock className="size-3" /> {t.estimatedHours} h
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-0.5">
                      <Button variant="ghost" size="icon-sm" onClick={() => startEdit(t)} aria-label={`Edit "${t.name}"`}><Pencil /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => remove(t.id)} aria-label={`Delete "${t.name}"`} className="hover:text-destructive"><Trash2 /></Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="surface-card space-y-4 p-5 sm:p-6">
            <h2 className="text-base font-bold">Schedule settings</h2>
            <div>
              <FieldLabel htmlFor="hours">Available working hours *</FieldLabel>
              <Input id="hours" value={settings.workingHours} onChange={(e) => plannerSettingsStore.set({ ...settings, workingHours: e.target.value })} maxLength={300} />
            </div>
            <div>
              <FieldLabel htmlFor="plan-instructions">Additional instructions</FieldLabel>
              <Textarea id="plan-instructions" rows={2} value={settings.instructions} onChange={(e) => plannerSettingsStore.set({ ...settings, instructions: e.target.value })} placeholder="e.g. I focus best in the morning; keep Friday afternoon free" maxLength={2000} />
            </div>
            <LanguageField />
            <Button variant="hero" size="lg" className="w-full" onClick={generate} disabled={ai.busy}>
              <Sparkle /> {ai.busy ? "Planning…" : `Generate Schedule${openCount ? ` (${openCount} task${openCount === 1 ? "" : "s"})` : ""}`}
            </Button>
          </section>
          <AIOutputPanel ai={ai} title="Your AI schedule" downloadName="schedule" emptyIcon={CalendarClock} regenerateLabel="Regenerate Schedule" emptyText="Add tasks and press Generate Schedule to get priorities, daily and weekly plans, breaks and conflict checks." />
        </div>
      </div>
    </>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5",
        priority === "High" && "bg-primary text-primary-foreground",
        priority === "Medium" && "bg-sky-soft text-sky-foreground",
        priority === "Low" && "bg-muted text-muted-foreground",
      )}
    >
      {priority}
    </span>
  );
}
