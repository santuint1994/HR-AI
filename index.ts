export const SENSITIVE_FIELDS = ['password', 'authorization', 'token']; // Fields that should not be logged or exposed in logs
export const IS_FULL_LOG_REQUIRED = true; // Whether full logs are required
export const LOGS_MAX_CHAR = 500;
export const LOG_RETENTION_PERIOD = '30d'; // Log retention period: 30 days
export const LOG_FOLDER_NAME = 'logs'; // Logs directory
export const ALGORITHM = 'aes-256-cbc';
export const IV_LENGTH = 16; // For AES, IV is always 16 bytes
export const NOTIFICATION_EVENTS = {
  SEND_EMAIL: 'sendEmail',
  SEND_SMS: 'sendSMS',
};
