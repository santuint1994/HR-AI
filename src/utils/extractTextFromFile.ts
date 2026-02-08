import fs from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { fileTypeFromBuffer } from 'file-type';

export type SourceType = 'pdf' | 'docx' | 'txt' | 'unknown';

/**
 * Faster PDF extraction by limiting to first N pages.
 * CVs are usually 1–2 pages; set maxPages to 2 or 3.
 */
async function extractPdfTextLimited(buffer: Buffer, maxPages = 2): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText({ first: maxPages });
  return result.text.trim();
}

export async function extractTextFromFile(
  filePath: string,
): Promise<{ sourceType: SourceType; text: string }> {
  const buf = await fs.readFile(filePath);
  const ft = await fileTypeFromBuffer(buf);

  const ext = (ft?.ext || '').toLowerCase();
  const mime = (ft?.mime || '').toLowerCase();

  // ✅ PDF (FAST)
  if (ext === 'pdf' || mime === 'application/pdf') {
    const text = await extractPdfTextLimited(buf, 2); // change 2 -> 3 if needed
    return { sourceType: 'pdf', text };
  }

  // DOCX
  if (
    ext === 'docx' ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer: buf });
    return { sourceType: 'docx', text: result.value || '' };
  }

  // TXT fallback
  const asText = buf.toString('utf8');
  return { sourceType: asText ? 'txt' : 'unknown', text: asText || '' };
}

export function normalizeText(input: unknown): string {
  const s = typeof input === 'string' ? input : '';
  return s
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[•·▪●]/g, '-')
    .trim();
}
