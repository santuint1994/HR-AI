import { promises as fs } from 'fs';
import path from 'path';

async function deleteDir(dir: string): Promise<void> {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (err) {
    console.error(`Failed to delete ${dir}:`, err);
  }
}

async function copyDir(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function cleanAndCopy() {
  await deleteDir('dist');
  await copyDir('src/assets', 'dist/assets');
  await copyDir('src/views', 'dist/views');
}

cleanAndCopy().catch((err) => console.error('Failed to copy assets:', err));
