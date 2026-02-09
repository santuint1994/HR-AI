import 'dotenv/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { interviewValidation } from '@validations/index';

function buildModelCandidates(): string[] {
  const env = process.env.GEMINI_MODEL?.trim();

  // safest -> fastest -> most commonly enabled
  const models = [
    env,
    'gemini-1.5-flash',
    'gemini-flash-latest',
    'gemini-1.5-flash-8b',
    // pro may not exist on your key, keep last
    'gemini-1.5-pro',
    'gemini-1.5-pro-002',
  ].filter(Boolean) as string[];

  return Array.from(new Set(models));
}

function isModelNotFoundOrUnsupported(err: unknown): boolean {
  const msg = String((err as any)?.message ?? err ?? '');
  const lower = msg.toLowerCase();
  return (
    lower.includes('404') ||
    lower.includes('not found') ||
    lower.includes('not supported') ||
    lower.includes('models/')
  );
}

function stripCodeFences(s: string) {
  return s
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
}

function safeJsonParse(raw: string) {
  const cleaned = stripCodeFences(raw);
  try {
    return JSON.parse(cleaned);
  } catch {
    const a = cleaned.indexOf('{');
    const b = cleaned.lastIndexOf('}');
    if (a >= 0 && b > a) return JSON.parse(cleaned.slice(a, b + 1));
    throw new Error('Gemini returned non-JSON output.');
  }
}

function clampText(text: string, maxChars = 12000) {
  if (!text) return '';
  return text.length > maxChars ? text.slice(0, maxChars) + '\n[TRUNCATED]' : text;
}

function systemPrompt(requiredSkills: string[]) {
  return `
You are an expert professional interviewer and evaluator.

GOAL:
Analyze the candidate CV and:
1. Detect candidate seniority from CV experience.
2. Detect candidate domain and core skills.
3. Generate structured interview questions based on:
   - detected seniority
   - candidate experience
   - required job skills

IMPORTANT:
Seniority must be calculated from CV work experience:
- 0–2 yrs → Junior
- 2–5 yrs → Mid-level
- 5–8 yrs → Senior
- 8+ yrs → Lead/Principal/Manager (depending on CV)

Do NOT assume seniority without evidence from CV.

STRICT RULES:
- Use ONLY CV text as source of truth.
- Do NOT invent experience.
- If required skill missing → ask conceptual questions.
- Questions must match seniority level.
- Questions must match candidate domain.
- Return ONLY valid JSON (no markdown, no explanation).

REQUIRED JOB SKILLS:
${requiredSkills?.length ? requiredSkills.join(', ') : 'Not provided'}

RETURN JSON IN THIS EXACT FORMAT:
{
  "candidateSummary": string,
  "experienceLevel": string,
  "candidateSkills": string[],
  "requiredSkills": string[],
  "interviewQuestions": [
    {
      "question": string,
      "expectedAnswer": string,
      "difficulty": "easy" | "medium" | "hard",
      "category": string
    }
  ]
}

QUESTION RULES:
Generate EXACTLY 20 interview questions.

Distribution:
• 8 from candidate CV experience  
• 8 from required skills  
• 4 scenario/real-world problem questions  

Difficulty:
• Junior → more easy/medium  
• Mid → medium/hard  
• Senior/Lead → mostly hard + scenario  

MANDATORY INCLUDE:
- 5 scenario-based questions
- 3 troubleshooting/problem-solving questions
- 3 leadership/decision questions (if senior)
- 3 tools/platform questions
- 2 performance/optimization questions

CATEGORY AUTO-DETECT BASED ON DOMAIN:

Software/IT:
Backend, Frontend, Database, SystemDesign, DevOps, Security

Marketing:
SEO, Ads, Analytics, Content, Branding, Funnel, Growth

Project Manager:
Agile, Scrum, Planning, Stakeholder, Risk, Delivery

Sales:
LeadGen, Closing, Negotiation, CRM, Revenue

HR:
Recruitment, HR Ops, Compliance, Culture

Finance:
Accounting, Reporting, Analysis, Compliance

General:
Communication, Leadership, ProblemSolving, Tools

QUALITY:
- Questions must feel like real interview.
- Avoid generic textbook questions.
- Answers must be practical and professional.
- Keep answers under 5 lines.

Return ONLY JSON.
`;
}

export async function generateInterviewQA(cvText: string, requiredStack: string[]) {
  if (!process.env.GOOGLE_API_KEY) throw new Error('Missing GOOGLE_API_KEY');

  const models = buildModelCandidates();
  const safeCV = clampText(cvText, 12000);

  let lastErr: unknown;

  for (const model of models) {
    const llm = new ChatGoogleGenerativeAI({
      model,
      temperature: 0.2,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    try {
      const res = await llm.invoke([
        new SystemMessage(systemPrompt(requiredStack)),
        new HumanMessage(`CANDIDATE CV:\n${safeCV}`),
      ]);

      const raw = typeof res.content === 'string' ? res.content : JSON.stringify(res.content);
      const json = safeJsonParse(raw);

      const { error, value } = interviewValidation.InterviewSchema.validate(json, {
        abortEarly: false,
      });

      if (error) throw error;
      return value;
    } catch (err) {
      lastErr = err;
      if (isModelNotFoundOrUnsupported(err)) continue; // try next model
      throw err; // real error -> stop
    }
  }

  const msg = String((lastErr as any)?.message ?? lastErr ?? 'Unknown error');
  throw new Error(`Gemini failed. Tried models: ${models.join(', ')}. Last error: ${msg}`);
}
