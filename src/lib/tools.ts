import { BookOpenText, CalendarClock, ClipboardList, Mail, MessagesSquare, PenLine, type LucideIcon } from "lucide-react";

import type { ToolId } from "@/lib/ai/prompts";

export interface ToolMeta {
  id: ToolId;
  title: string;
  shortTitle: string;
  path: "/email" | "/meetings" | "/planner" | "/research" | "/writing" | "/chat";
  icon: LucideIcon;
  description: string;
  cta: string;
}

export const TOOLS: ToolMeta[] = [
  {
    id: "email",
    title: "Smart Email Generator",
    shortTitle: "Email Generator",
    path: "/email",
    icon: Mail,
    description: "Draft complete, well-structured emails in the tone and language you choose.",
    cta: "Write an email",
  },
  {
    id: "meeting",
    title: "Meeting Notes Summarizer",
    shortTitle: "Meeting Summarizer",
    path: "/meetings",
    icon: ClipboardList,
    description: "Turn long meeting notes into decisions, action items and next steps.",
    cta: "Summarize notes",
  },
  {
    id: "planner",
    title: "AI Task Planner",
    shortTitle: "Task Planner",
    path: "/planner",
    icon: CalendarClock,
    description: "Prioritise tasks and get realistic daily and weekly schedules.",
    cta: "Plan my week",
  },
  {
    id: "research",
    title: "AI Research Assistant",
    shortTitle: "Research Assistant",
    path: "/research",
    icon: BookOpenText,
    description: "Understand workplace topics with structured summaries and web sources.",
    cta: "Start researching",
  },
  {
    id: "writing",
    title: "AI Writing Assistant",
    shortTitle: "Writing Assistant",
    path: "/writing",
    icon: PenLine,
    description: "Fix grammar, rewrite, simplify, expand or summarise any text.",
    cta: "Improve my writing",
  },
  {
    id: "chat",
    title: "AI Workplace Chatbot",
    shortTitle: "WorkMate AI",
    path: "/chat",
    icon: MessagesSquare,
    description: "Chat with WorkMate AI for ideas, explanations and workplace help.",
    cta: "Chat with WorkMate",
  },
];

export const TOOL_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t])) as Record<ToolId, ToolMeta>;

export const RESPONSIBLE_AI_NOTICE =
  "AI-generated content may contain errors or inaccuracies. Always review and verify AI-generated information before using it for important workplace decisions. Do not submit confidential, sensitive, or personally identifiable information. Users remain responsible for reviewing and approving all AI-generated content.";
