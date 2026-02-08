export const isEmptyObject = (obj: unknown): obj is Record<string, never> => {
  if (obj === null || obj === undefined) return false;

  // Must be of type object
  if (typeof obj !== 'object') return false;

  // Ensure it's a plain object (not Array, Date, Map, Set, class instance, etc.)
  const prototype = Object.getPrototypeOf(obj);
  if (prototype !== Object.prototype && prototype !== null) return false;

  // Check no own enumerable properties
  return Object.keys(obj as object).length === 0;
};
