import { UPLOAD_ALLOWED_TYPE } from '@constants/index';
import { Request } from 'express';
import fs from 'fs';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { UploadedFile as MulterFile } from 'types/common';

// Ensure the upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), '/uploads'); // All uploads go here
fs.mkdirSync(UPLOAD_DIR, { recursive: true }); // Make sure the folder exists

// Multer storage configuration for local storage
/* eslint-disable no-unused-vars */
const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: MulterFile,
    cb: (_error: Error | null, _destination: string) => void,
  ) => {
    cb(null, UPLOAD_DIR); // All files will be stored in the `uploads/` folder
  },
  filename: (
    _req: Request,
    file: MulterFile,
    cb: (_error: Error | null, _filename: string) => void,
  ) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const newFileName = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
    // ✅ Save generated filename into the file object itself
    file.originalname = newFileName; // keep original for reference
    cb(null, newFileName); // Unique filename
  },
});
/* eslint-enable no-unused-vars */

// File filter for allowed image and document types
const fileFilter = (_req: Request, file: MulterFile, cb: FileFilterCallback): void => {
  const extname = path.extname(file.originalname).toLowerCase();
  // Prefer a Set for O(1) lookups and stricter typing
  const allowedTypes = new Set<string>(UPLOAD_ALLOWED_TYPE);

  if (!allowedTypes.has(extname)) {
    cb(
      new Error(
        'Invalid file type. Allowed types are: images, PDFs, Word, Excel, PowerPoint, Text.',
      ),
    );
    return;
  }

  cb(null, true); // Accept file
};

// Multer configuration for multiple fields (shop_logo, documents)
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for each file
});
