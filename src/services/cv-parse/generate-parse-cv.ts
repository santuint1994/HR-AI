import { UploadedFile } from 'types';
import { extractTextFromFile, normalizeText, extractResumeJSON } from '@utils/index';
import fs from 'fs/promises';

export const generateParseCv = async <T>(body: T & { files?: { media?: UploadedFile[] } }) => {
  const file = body.files?.media?.[0];

  if (!file) {
    throw new Error("No file uploaded. Use form-data key 'file'.");
  }

  try {
    const { sourceType, text } = await extractTextFromFile(file.path);
  
    const clean = normalizeText(text);

    // very common issue: scanned PDF => almost no text
    if (clean.length < 80) {
      throw new Error(
        'Extracted text is too short. This CV may be a scanned PDF image. OCR is required.',
      );
    }

    const json = await extractResumeJSON(clean);
    json.raw = clean;


    return json;
  } catch (e: any) {
    throw new Error(e?.message || 'Parsing failed');
  } finally {
    // cleanup uploaded file
    try {
      await fs.unlink(file.path);
    } catch {
      // ignore
      throw new Error('File cleanup failed');
    }
  }
};
