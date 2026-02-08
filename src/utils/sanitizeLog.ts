import { SENSITIVE_FIELDS } from '@constants/index';

export const sanitizeLog = <T>(obj: T): T => {
  // Convert all sensitive keys to lowercase for a case-insensitive comparison.
  const sensitiveKeys = SENSITIVE_FIELDS.map((key) => key.toLowerCase());

  const deepSanitize = (input: unknown): unknown => {
    if (Array.isArray(input)) {
      return input.map((item) => deepSanitize(item));
    }
    if (input !== null && typeof input === 'object') {
      return Object.fromEntries(
        Object.entries(input as Record<string, unknown>).map(([key, value]) => {
          if (sensitiveKeys.includes(key.toLowerCase())) {
            return [key, '******'];
          }
          return [key, deepSanitize(value)];
        }),
      );
    }
    return input;
  };

  return deepSanitize(obj) as T;
};
