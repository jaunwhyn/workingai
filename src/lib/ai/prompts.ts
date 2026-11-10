import { z } from "zod";

import { LANGUAGE_NAMES } from "@/lib/languages";

/**
 * Specialised prompts for every AI tool. All tools share one secure server route
 * (src/routes/api/ai.ts); only the instructions and user prompt differ.
 */

export const TOOL_IDS = ["email", "meeting", "planner", "research", "writing", "chat"] as const;
export type ToolId = (typeof TOOL_IDS)[number];

export const EMAIL_TONES = [
  "Formal",
  "Friendly",
  "Professional",
  "Persuasive",
  "Apologetic",
  "Confident",
  "Concise",
] as const;

export const WRITING_ACTIONS = [
  { id: "grammar", label: "Improve grammar", instruction: "Correct all grammar, spelling and punctuation errors while keeping the original meaning, structure and voice." },
  { id: "professional", label: "Rewrite professionally", instruction: "Rewrite the text so it reads as polished, professional workplace communication." },
  { id: "simplify", label: "Simplify language", instruction: "Rewrite the text in plain, simple language that is easy for anyone to understand. Use short sentences." },
  { id: "expand", label: "Expand content", instruction: "Expand the text with more detail, context and supporting explanation, without inventing specific facts, figures, names or dates." },
  { id: "summarise", label: "Summarise text", instruction: "Summarise the text concisely, keeping only the key points." },
  { id: "clarity", label: "Improve clarity", instruction: "Rewrite the text to be clearer and better organised, removing ambiguity and redundancy." },
  { id: "bullets", label: "Convert to bullet points", instruction: "Convert the text into a well-organised bullet-point list. Group related points under short bold headings if helpful." },
  { id: "persuasive", label: "Make more persuasive", instruction: "Rewrite the text to be more persuasive and compelling, with a clear call to action, without inventing facts." },
] as const;

export const WRITING_TONES = ["Professional", "Friendly", "Formal", "Casual", "Confident", "Neutral", "Empathetic"] as const;

const text = (max: number) => z.string().trim().max(max);
const languageSchema = z.string().refine((v) => LANGUAGE_NAMES.includes(v), "Unsupported language");

export const emailInputSchema = z.object({
  purpose: text(500).min(1, "Please describe the subject or purpose of the email."),
  recipient: text(200).default(""),
  points: text(6000).default(""),
  instructions: text(2000).default(""),
  tone: z.enum(EMAIL_TONES),
});

export const meetingInputSchema = z.object({
  notes: text(40000).min(20, "Please paste your meeting notes (at least a few sentences)."),
});

export const plannerTaskSchema = z.object({
  name: text(200).min(1),
  description: text(1500).default(""),
  priority: z.enum(["High", "Medium", "Low"]),
  deadline: text(40).default(""),
  estimatedHours: z.number().min(0).max(1000).nullable().default(null),
  completed: z.boolean().default(false),
});

export const plannerInputSchema = z.object({
  tasks: z.array(plannerTaskSchema).min(1, "Add at least one task before generating a schedule.").max(60),
  workingHours: text(300).min(1, "Please describe your available working hours."),
  instructions: text(2000).default(""),
  today: text(60),
});

export const researchInputSchema = z.object({
  question: text(3000).min(3, "Please enter a research question or topic."),
  depth: z.enum(["overview", "detailed"]),
  webSearch: z.boolean(),
});

export const writingInputSchema = z.object({
  text: text(20000).min(1, "Please paste the text you want to improve."),
  action: z.enum(WRITING_ACTIONS.map((a) => a.id) as [string, ...string[]]),
  tone: z.enum(WRITING_TONES),
});

export const requestSchema = z.object({
  tool: z.enum(TOOL_IDS),
  language: languageSchema,
  input: z.unknown().optional(),
  messages: z.array(z.any()).max(80),
});

export type EmailInput = z.infer<typeof emailInputSchema>;
export type MeetingInput = z.infer<typeof meetingInputSchema>;
export type PlannerInput = z.infer<typeof plannerInputSchema>;
export type PlannerTask = z.infer<typeof plannerTaskSchema>;
export type ResearchInput = z.infer<typeof researchInputSchema>;
export type WritingInput = z.infer<typeof writingInputSchema>;

export function languageRule(language: string) {
  return [
    `OUTPUT LANGUAGE: Write your entire response in ${language}, including all headings, labels and section titles.`,
    `If the user's input is written in another language, understand it, but still respond in ${language}.`,
    "Keep personal names, company names, email addresses, product names, URLs and code exactly as given.",
  ].join(" ");
}

const SHARED_RULES = [
  "You are part of the AI Workplace Productivity Assistant, a professional workplace tool.",
  "Format the answer in clean Markdown (headings, bullet lists, bold for key terms). Do not wrap the whole answer in a code block.",
  "Do not include any preamble such as 'Sure, here is' — start directly with the content.",
  "Never invent facts, people, dates, numbers, decisions or references that were not provided or that you cannot support.",
].join("\n");

function block(label: string, value: string | undefined | null) {
  const v = (value ?? "").trim();
  return `### ${label}\n${v.length ? v : "(not provided)"}`;
}

export interface BuiltPrompt {
  instructions: string;
  prompt: string;
}

export function buildEmailPrompt(input: EmailInput, language: string): BuiltPrompt {
  return {
    instructions: [
      SHARED_RULES,
      "ROLE: You are an expert business communication writer.",
      "TASK: Write one complete, ready-to-send email based on the user's details.",
      "STRUCTURE (use exactly this order):",
      "1. A first line formatted as `**Subject:** <subject line>`.",
      "2. A blank line, then the greeting (address the recipient by name/role if provided, otherwise a suitable generic greeting).",
      "3. A well-structured body in short paragraphs that covers every main point provided.",
      "4. A professional closing line and sign-off. Use the placeholder `[Your Name]` for the sender's name unless the user provided it.",
      `TONE: ${input.tone}. Apply this tone consistently.`,
      "Do not invent commitments, prices, dates or facts that were not provided; use clear [placeholders] where specific details are needed.",
      languageRule(language),
    ].join("\n"),
    prompt: [
      block("Subject or purpose", input.purpose),
      block("Recipient", input.recipient),
      block("Main points to communicate", input.points),
      block("Additional instructions", input.instructions),
    ].join("\n\n"),
  };
}

export function buildMeetingPrompt(input: MeetingInput, language: string): BuiltPrompt {
  return {
    instructions: [
      SHARED_RULES,
      "ROLE: You are a meticulous executive assistant who summarises meetings accurately.",
      "TASK: Convert the meeting notes into a structured summary using exactly these level-2 Markdown headings, in this order (translate the heading text into the output language):",
      "## Meeting Overview",
      "## Main Discussion Points",
      "## Important Decisions",
      "## Action Items",
      "## Outstanding Questions",
      "## Recommended Next Steps",
      "Under 'Action Items', use a Markdown table with columns: Action, Responsible Person, Deadline.",
      "STRICT ACCURACY RULES:",
      "- Only include decisions, people, responsibilities and deadlines that are explicitly stated in the notes.",
      "- If a responsible person or deadline is not stated, write 'Not specified' in that cell. Never guess.",
      "- If a section has no supporting information in the notes, write 'None recorded in the notes.'",
      "- 'Recommended Next Steps' may contain your suggestions, but label them clearly as AI suggestions.",
      languageRule(language),
    ].join("\n"),
    prompt: block("Meeting notes", input.notes),
  };
}

export function buildPlannerPrompt(input: PlannerInput, language: string): BuiltPrompt {
  const taskLines = input.tasks
    .map((t, i) =>
      [
        `${i + 1}. **${t.name}**`,
        `   - Priority: ${t.priority}`,
        `   - Deadline: ${t.deadline || "Not specified"}`,
        `   - Estimated time: ${t.estimatedHours != null ? `${t.estimatedHours} hours` : "Not specified"}`,
        `   - Status: ${t.completed ? "Completed" : "Open"}`,
        t.description ? `   - Description: ${t.description}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n");

  return {
    instructions: [
      SHARED_RULES,
      "ROLE: You are an expert productivity coach and scheduling assistant.",
      "TASK: Build a realistic plan for the user's open tasks. Ignore completed tasks except to acknowledge them briefly.",
      "Use exactly these level-2 Markdown headings, in this order (translate the heading text into the output language):",
      "## Priority Overview — a table of open tasks sorted by urgency and priority (columns: Task, Priority, Deadline, Est. time, Urgency).",
      "## Urgent Tasks — tasks due soon or at risk, with a short reason.",
      "## Daily Plan — a time-blocked plan for the next working day, as a table (Time, Activity). Include short breaks and a lunch break.",
      "## Weekly Plan — a day-by-day plan for the next 5 working days, as a table (Day, Focus, Tasks).",
      "## Breaks & Wellbeing — concrete break suggestions.",
      "## Scheduling Conflicts — identify overlaps, overloaded days or deadlines that cannot fit the available hours. If there are none, say so.",
      "## Productivity Recommendations — 3 to 6 specific tips.",
      "Respect the available working hours exactly. Do not schedule more work than fits. If estimates are missing, state your assumption.",
      `Today's date is ${input.today}. Use it to judge urgency.`,
      languageRule(language),
    ].join("\n"),
    prompt: [block("Tasks", taskLines), block("Available working hours", input.workingHours), block("Additional instructions", input.instructions)].join("\n\n"),
  };
}

export function buildResearchPrompt(input: ResearchInput, language: string): BuiltPrompt {
  const sourcing = input.webSearch
    ? [
        "SOURCES: Use the web search tool to find current, reputable information.",
        "Cite claims that come from search results with inline Markdown links to the exact pages you found. Only link pages returned by your search — never invent or guess URLs.",
        "Clearly distinguish information verified from sources from your own general AI explanation (e.g. label paragraphs or bullets as 'From sources' vs 'AI explanation').",
      ]
    : [
        "SOURCES: Web search is OFF for this request. Do NOT include any URLs, citations, reference lists or named studies you cannot verify.",
        "State near the top that this answer is an AI-generated explanation without verified sources.",
      ];
  return {
    instructions: [
      SHARED_RULES,
      "ROLE: You are a careful research analyst helping professionals understand workplace topics.",
      `DEPTH: ${input.depth === "detailed" ? "Detailed — thorough explanation with examples." : "Overview — concise, about 300-500 words."}`,
      "Use exactly these level-2 Markdown headings, in this order (translate the heading text into the output language):",
      "## Summary",
      "## Key Findings",
      "## Detailed Explanation",
      "## Limitations & Uncertainty — be honest about what is uncertain, disputed, time-sensitive or outside your knowledge.",
      "## Further Research Questions",
      ...sourcing,
      languageRule(language),
    ].join("\n"),
    prompt: block("Research question or topic", input.question),
  };
}

export function buildWritingPrompt(input: WritingInput, language: string): BuiltPrompt {
  const action = WRITING_ACTIONS.find((a) => a.id === input.action) ?? WRITING_ACTIONS[0];
  return {
    instructions: [
      SHARED_RULES,
      "ROLE: You are a professional editor.",
      `TASK: ${action.instruction}`,
      `TONE: ${input.tone}.`,
      "Return only the revised text. Do not add commentary, explanations or notes about what you changed.",
      languageRule(language),
    ].join("\n"),
    prompt: block("Original text", input.text),
  };
}

export function buildChatInstructions(language: string) {
  return [
    "You are WorkMate AI, a friendly and professional workplace assistant inside the AI Workplace Productivity Assistant.",
    "You help with workplace questions, brainstorming, explaining difficult concepts, productivity, writing professional documents and improving workflows.",
    "Be natural, clear and practical. Use Markdown formatting where it helps (lists, headings, tables). Keep answers focused.",
    "Be honest about uncertainty and never invent facts, statistics or references. Remind users to verify important information when relevant.",
    `LANGUAGE: Respond in ${language} by default. If the user explicitly asks you to use a different language, follow that request.`,
  ].join("\n");
}

export type ToolPromptResult = { ok: true; built: BuiltPrompt } | { ok: false; error: string };

/** Validates raw tool input and builds the specialised prompt. */
export function buildToolPrompt(tool: Exclude<ToolId, "chat">, rawInput: unknown, language: string): ToolPromptResult {
  const schemas = {
    email: emailInputSchema,
    meeting: meetingInputSchema,
    planner: plannerInputSchema,
    research: researchInputSchema,
    writing: writingInputSchema,
  } as const;
  const parsed = schemas[tool].safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  switch (tool) {
    case "email":
      return { ok: true, built: buildEmailPrompt(parsed.data as EmailInput, language) };
    case "meeting":
      return { ok: true, built: buildMeetingPrompt(parsed.data as MeetingInput, language) };
    case "planner":
      return { ok: true, built: buildPlannerPrompt(parsed.data as PlannerInput, language) };
    case "research":
      return { ok: true, built: buildResearchPrompt(parsed.data as ResearchInput, language) };
    case "writing":
      return { ok: true, built: buildWritingPrompt(parsed.data as WritingInput, language) };
  }
}
