import { describe, expect, it } from "vitest";

import { buildChatInstructions, buildToolPrompt, requestSchema } from "@/lib/ai/prompts";
import { LANGUAGES, LANGUAGE_NAMES } from "@/lib/languages";

const REQUIRED = [
  "English", "Afrikaans", "isiZulu", "isiXhosa", "Sesotho", "Setswana", "Sepedi", "Xitsonga", "siSwati", "Tshivenda",
  "French", "Spanish", "Portuguese", "German", "Italian", "Dutch", "Swedish", "Norwegian", "Danish", "Finnish",
  "Polish", "Russian", "Ukrainian", "Greek", "Turkish", "Arabic", "Hebrew", "Hindi", "Urdu", "Bengali",
  "Punjabi", "Tamil", "Telugu", "Marathi", "Gujarati", "Chinese (Simplified)", "Chinese (Traditional)", "Japanese", "Korean", "Thai",
  "Vietnamese", "Indonesian", "Malay", "Filipino", "Swahili", "Amharic", "Somali", "Yoruba", "Igbo", "Hausa",
  "Romanian", "Hungarian", "Czech", "Slovak", "Bulgarian", "Croatian", "Serbian", "Persian", "Nepali", "Irish",
];

const sampleInputs = {
  email: { purpose: "Reschedule meeting", recipient: "Sarah", points: "Move to Friday", instructions: "", tone: "Formal" },
  meeting: { notes: "Team agreed to launch on Monday. Thandi owns the press release." },
  planner: {
    tasks: [{ name: "Budget report", description: "", priority: "High", deadline: "2026-11-12", estimatedHours: 3, completed: false }],
    workingHours: "09:00-17:00",
    instructions: "",
    today: "Tuesday, 10 November 2026",
  },
  research: { question: "Four-day work week", depth: "overview", webSearch: false },
  writing: { text: "me and him goes to the office", action: "grammar", tone: "Professional" },
} as const;

describe("languages", () => {
  it("offers all 60 required languages", () => {
    expect(LANGUAGES).toHaveLength(60);
    for (const name of REQUIRED) expect(LANGUAGE_NAMES).toContain(name);
  });

  it("rejects languages that are not in the list", () => {
    expect(requestSchema.safeParse({ tool: "chat", language: "Klingon", messages: [] }).success).toBe(false);
  });
});

describe("every tool tells the AI to answer in the selected language", () => {
  for (const tool of Object.keys(sampleInputs) as (keyof typeof sampleInputs)[]) {
    it(`${tool} uses the chosen language for all 60 languages`, () => {
      for (const language of LANGUAGE_NAMES) {
        const result = buildToolPrompt(tool, sampleInputs[tool], language);
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.built.instructions).toContain(`entire response in ${language}`);
      }
    });
  }

  it("chat replies in the chosen language", () => {
    expect(buildChatInstructions("isiZulu")).toContain("Respond in isiZulu");
  });
});

describe("tool rules", () => {
  it("email offers exactly the 7 requested tones", () => {
    for (const tone of ["Formal", "Friendly", "Professional", "Persuasive", "Apologetic", "Confident", "Concise"]) {
      expect(buildToolPrompt("email", { ...sampleInputs.email, tone }, "English").ok).toBe(true);
    }
    expect(buildToolPrompt("email", { ...sampleInputs.email, tone: "Sarcastic" }, "English").ok).toBe(false);
  });

  it("meeting summaries must not invent owners or deadlines", () => {
    const r = buildToolPrompt("meeting", sampleInputs.meeting, "English");
    expect(r.ok && r.built.instructions).toContain("Never guess");
    expect(r.ok && r.built.instructions).toContain("Not specified");
  });

  it("research without web search forbids citations", () => {
    const r = buildToolPrompt("research", sampleInputs.research, "English");
    expect(r.ok && r.built.instructions).toContain("Do NOT include any URLs");
  });

  it("planner requires at least one task", () => {
    expect(buildToolPrompt("planner", { ...sampleInputs.planner, tasks: [] }, "English").ok).toBe(false);
  });
});
