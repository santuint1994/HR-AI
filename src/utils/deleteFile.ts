import { promises as fs } from 'fs';
import path from 'path';

export interface DeleteResult {
  deleted: boolean;
  message: string;
}

/**
 * Delete a file from local storage safely.
 *
 * @param fileName - File name (as stored in DB or user input)
 * @returns Promise<DeleteResult>
 */
export async function deleteFile(fileName: string): Promise<DeleteResult> {
  if (!fileName || typeof fileName !== 'string') {
    throw new Error('fileName must be a valid string');
  }

  const uploadsRoot = path.join(process.cwd(), 'uploads'); // ✅ no leading slash
  const absRoot = path.resolve(uploadsRoot);
  const candidatePath = path.resolve(absRoot, fileName);

  // Prevent directory traversal attacks
  if (!candidatePath.startsWith(absRoot + path.sep)) {
    throw new Error('Unsafe file path detected');
  }

  await fs.unlink(candidatePath);
  return { deleted: true, message: `🗑️ File deleted: ${candidatePath}` };
}
