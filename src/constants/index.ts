export const SENSITIVE_FIELDS = ['password', 'authorization', 'token']; // Fields that should not be logged or exposed in logs
export const IS_FULL_LOG_REQUIRED = true; // Flag to determine if full logs are required
export const LOGS_MAX_CHAR = 500; // Maximum characters for logs
export const LOG_RETENTION_PERIOD = '30d'; // Logs retained for 30 days
export const LOG_FOLDER_NAME = 'logs'; // Name of the log directory
export const ALGORITHM = 'aes-256-cbc'; // Strong symmetric encryption
export const IV_LENGTH = 16; // For AES, IV is always 16 bytes
export const UPLOAD_ALLOWED_TYPE = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.pdf',
  '.svg',
  '.doc',
  '.docx',
  '.txt',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
];
export const ADMIN_ROLE_CODE = 'n5ea62lx'; // Role code for admin users
export const DEVELOPER_ROLE_CODE = 'n5ea68l0'; // Role code for developer users
export const AGENT_ROLE_CODE = 'n5ea68l1'; // Role code for agent users
export const INDIVIDUAL_ROLE_CODE = 'n5ea68ly'; // Role code for customer users
