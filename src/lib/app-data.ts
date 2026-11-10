import type { ToolId, PlannerTask } from "@/lib/ai/prompts";
import { createStorageStore } from "@/lib/storage-store";

/** Session activity: only tool type and a short generic label — never the content the user typed. */
export interface Activity {
  id: string;
  kind: ToolId | "task";
  label: string;
  at: number;
}

export const activityStore = createStorageStore<Activity[]>("wpa.activity", "session", []);

export function logActivity(kind: Activity["kind"], label: string) {
  activityStore.set((prev) =>
    [{ id: crypto.randomUUID(), kind, label, at: Date.now() }, ...prev].slice(0, 100),
  );
}

export interface StoredTask extends PlannerTask {
  id: string;
  createdAt: number;
}

/** Planner tasks persist in this browser only (localStorage) and can be cleared in Settings. */
export const tasksStore = createStorageStore<StoredTask[]>("wpa.tasks", "local", []);

export interface PlannerSettings {
  workingHours: string;
  instructions: string;
}

export const plannerSettingsStore = createStorageStore<PlannerSettings>("wpa.planner", "local", {
  workingHours: "Monday to Friday, 09:00–17:00 with a 1-hour lunch break",
  instructions: "",
});
