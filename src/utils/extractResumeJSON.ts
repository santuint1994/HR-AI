// resumeExtractor.ts
// Full end-to-end: file -> text (multi-page PDF) -> normalize -> CLAMP -> Gemini -> strict JSON parse -> Joi validate
// Notes:
// - Uses pdfjs-dist page-by-page to avoid missing page 2/3 content.
// - Adds scanned-PDF detection hook for OCR fallback (stubbed; plug your OCR provider).
// - Adds clampText() to reduce LLM latency (applied after normalize + before Gemini).
// - Uses JSON-only extraction (fast + robust). If you want tool/structured mode, we can add it back.

import fs from 'node:fs/promises';
import path from 'node:path';

import mammoth from 'mammoth';
import { fileTypeFromBuffer } from 'file-type';

// PDF extraction (multi-page)
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

// Your Joi validations
import { resumeValidation } from '@validations/index';

export type SourceType = 'pdf' | 'docx' | 'txt' | 'unknown';

/* ------------------------------ Prompt ------------------------------ */

function systemPrompt() {
  return `
You are an expert at extracting structured resume/CV data. You MUST return valid JSON matching this EXACT schema:

{
  "basics": {
    "fullName": string | null,
    "headline": string | null,
    "email": string | null,
    "phone": string | null,
    "location": string | null,
    "summary": string | null,
    "links": [{ "label": string | null, "url": string }]
  },
  "skills": [string],
  "languages": [string],
  "certifications": [{ "name": string, "issuer": string | null, "date": string | null }],
  "totalExperience": number,
  "education": [{ "institution": string | null, "degree": string | null, "field": string | null, "startDate": string | null, "endDate": string | null, "location": string | null, "details": string | null }],
  "experience": [{ "company": string | null, "title": string | null, "location": string | null, "startDate": string | null, "endDate": string | null, "highlights": [string] }],
  "projects": [{ "name": string | null, "description": string | null, "link": string | null, "highlights": [string] }]
}

CRITICAL RULES:
1. The "basics" object is REQUIRED and must always be present
2. Do NOT invent information - if something is missing, use null for strings or [] for arrays
3. Keep dates exactly as written in the CV (don't reformat)
4. For highlights arrays, extract key accomplishments/responsibilities as separate strings
5. CV TEXT may include multiple pages separated by "--- PAGE N ---". You MUST use ALL pages.
6. Certifications may appear under headings like Certifications, Courses, Training, Licenses, Achievements.
7. Return ONLY the JSON object, no explanations or markdown
`.trim();
}

/* ------------------------------ Helpers ------------------------------ */

function stripCodeFences(s: string) {
  return s
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
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

function buildModelCandidates(): string[] {
  const env = process.env.GEMINI_MODEL?.trim();

  // Prefer fast models first
  const models = [
    env,
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-flash-latest',
    'gemini-1.5-flash-8b',
    // Pro attempts (often restricted)
    'gemini-1.5-pro',
    'gemini-1.5-pro-002',
  ].filter(Boolean) as string[];

  return Array.from(new Set(models));
}

function makeLLM(model: string) {
  return new ChatGoogleGenerativeAI({
    model,
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });
}

export function normalizeText(input: string): string {
  return input
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[•·▪●]/g, '-')
    .trim();
}

export function clampText(text: string, maxChars = 12000) {
  if (!text) return '';
  return text.length > maxChars ? text.slice(0, maxChars) + '\n[TRUNCATED]' : text;
}

function looksScannedOrEmpty(text: string): boolean {
  // Heuristic: very low non-whitespace content => likely scanned or extraction failed
  const compact = text.replace(/\s/g, '');
  return compact.length < 250; // tweak threshold as you like
}

/* ------------------------------ PDF Extraction ------------------------------ */

async function extractPdfTextPageByPage(buf: Buffer): Promise<string> {
  const loadingTask = pdfjs.getDocument({ data: buf });
  const doc = await loadingTask.promise;

  let out = '';

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageText = (textContent.items as any[])
      .map((it) => (typeof it?.str === 'string' ? it.str : ''))
      .join(' ');

    out += `\n\n--- PAGE ${pageNum} ---\n\n${pageText}`;
  }

  return out.trim();
}

/* ------------------------------ OCR (Optional) ------------------------------ */
/**
 * Plug your OCR provider here (Google Vision, Document AI, AWS Textract, etc.)
 * Return the FULL OCR text.
 */
async function ocrPdf(_buf: Buffer): Promise<string> {
  // TODO: integrate OCR provider. For now, return empty to avoid inventing data.
  return '';
}

/* ------------------------------ File -> Text ------------------------------ */

export async function extractTextFromFile(
  filePath: string,
): Promise<{ sourceType: SourceType; text: string }> {
  const buf = await fs.readFile(filePath);
  const ft = await fileTypeFromBuffer(buf);

  const ext = (ft?.ext || path.extname(filePath).replace('.', '') || '').toLowerCase();
  const mime = (ft?.mime || '').toLowerCase();

  // PDF
  if (ext === 'pdf' || mime === 'application/pdf') {
    let text = await extractPdfTextPageByPage(buf);
    text = normalizeText(text);

    // OCR fallback for scanned/empty PDFs
    if (looksScannedOrEmpty(text)) {
      const ocrText = normalizeText(await ocrPdf(buf));
      if (!looksScannedOrEmpty(ocrText)) {
        return { sourceType: 'pdf', text: clampText(ocrText) };
      }
    }

    return { sourceType: 'pdf', text: clampText(text || '') };
  }

  // DOCX
  if (
    ext === 'docx' ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer: buf });
    const text = clampText(normalizeText(result.value || ''));
    return { sourceType: 'docx', text };
  }

  // TXT fallback
  const asText = clampText(normalizeText(buf.toString('utf8')));
  return { sourceType: asText ? 'txt' : 'unknown', text: asText || '' };
}

/* ------------------------------ LLM JSON Extract + Validate ------------------------------ */

async function extractWithJsonOnly(llm: ChatGoogleGenerativeAI, cvText: string) {
  // Clamp again here for safety if caller passes large text directly
  const safeText = clampText(cvText, 12000);

  const res = await llm.invoke([
    new HumanMessage(
      `SYSTEM INSTRUCTION:\n${systemPrompt()}\n\n` +
        `Output MUST be valid JSON only. No markdown. No extra text. No comments.\n\n` +
        `CV TEXT:\n${safeText}`,
    ),
  ]);

  const raw = typeof res.content === 'string' ? res.content : JSON.stringify(res.content);
  const cleaned = stripCodeFences(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (firstError: any) {
    // Try to salvage a JSON object from mixed output
    const firstBrace = cleaned.indexOf('{');
    if (firstBrace < 0) throw new Error('Model returned non-JSON output.');

    let bestParse: unknown = null;

    for (let i = firstBrace + 1; i <= cleaned.length; i++) {
      if (cleaned[i - 1] === '}') {
        try {
          const candidate = cleaned.slice(firstBrace, i);
          bestParse = JSON.parse(candidate);
        } catch {
          // keep scanning
        }
      }
    }

    if (bestParse !== null) {
      parsed = bestParse;
    } else {
      throw new Error(`JSON parsing failed: ${firstError.message}`);
    }
  }

  // Validate with Joi
  const { error, value } = resumeValidation.ResumeSchema.validate(parsed, {
    abortEarly: false,
    stripUnknown: false, // keep strict to your schema expectations
  });

  if (error) throw error;
  return value;
}

/* ------------------------------ Public API ------------------------------ */

export async function extractResumeJSON(cvText: string): Promise<resumeValidation.ResumeJSON> {
  const models = buildModelCandidates();

  let lastErr: unknown;

  for (const model of models) {
    const llm = makeLLM(model);
    try {
      return await extractWithJsonOnly(llm, cvText);
    } catch (err) {
      lastErr = err;
      if (isModelNotFoundOrUnsupported(err)) continue;
      break; // other errors: stop
    }
  }

  const msg = String((lastErr as any)?.message ?? lastErr ?? 'Unknown error');
  throw new Error(
    `Gemini extraction failed. Tried models: ${models.join(', ')}. Last error: ${msg}`,
  );
}

export async function extractResumeFromFile(
  filePath: string,
): Promise<resumeValidation.ResumeJSON> {
  const { text } = await extractTextFromFile(filePath);

  // Safety: if text is empty, fail fast (don’t let LLM hallucinate)
  if (!text || text.trim().length < 50) {
    throw new Error(
      'Could not extract readable text from file (possibly scanned PDF). Enable OCR fallback.',
    );
  }

  // Clamp again to ensure LLM prompt is bounded
  return extractResumeJSON(clampText(text, 12000));
}
