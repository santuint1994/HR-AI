export interface UploadedFile {
  fieldname: string; // The field name in the form
  originalname: string; // Original name of the uploaded file
  encoding: string; // Encoding type (e.g., '7bit')
  mimetype: string; // MIME type (e.g., 'image/png')
  destination: string; // Local folder path where the file is stored
  filename: string; // Generated filename on the server
  path: string; // Full path to the file on the disk
  size: number; // File size in bytes
}

export interface User {
  id: string;
  role: { code: string; id: string };
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  totalActiveProjectsLimit: number;
  totalActivePropertiesLimit: number;
  totalActiveProjects?: number;
  totalActiveProperties?: number;
  totalActiveFeaturedPropertiesLimit?: number;
  totalActiveHighlightedProjectsLimit?: number;
  totalActiveHighlightedProjects?: number;
  totalActiveFeaturedProperties?: number;
  isMembershipActive?: boolean;
  profileVerified?: boolean;
  documentVerified?: string;
  membershipExpiryDate?: Date;
}
