// TypeScript definitions for media library entities
export interface IMediaLibrary {
  id: string; // UUID
  fileName: string;
  fileType: 'image' | 'document' | 'video' | 'audio' | 'other';
  mimeType?: string;
  url: string;
  size?: number; // in bytes
  uploadedBy?: string; // User UUID
  metadata?: Record<string, unknown>; // JSONB object
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateMediaLibrary {
  fileName: string;
  fileType: 'image' | 'document' | 'video' | 'audio' | 'other';
  mimeType?: string;
  url: string;
  size?: number; // in bytes
  uploadedBy?: string; // User UUID
  metadata?: Record<string, unknown>; // JSONB object
}
