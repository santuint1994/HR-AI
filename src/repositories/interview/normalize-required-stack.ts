/**
 * Normalize requiredStack (string or string[]) to a comparable key for DB lookup.
 * e.g. "node,js,docker" or ["node", "js", "docker"] -> "docker,js,node"
 */
export function normalizeRequiredStackKey(requiredTech: string | string[]): string {
  const arr = Array.isArray(requiredTech)
    ? requiredTech
    : requiredTech
        .split(/[,;\s]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
  return [...new Set(arr)].sort().join(',');
}

/**
 * Parse requiredTech (string or string[]) to string[] for API/LLM.
 */
export function parseRequiredStack(requiredTech: string | string[]): string[] {
  const arr = Array.isArray(requiredTech)
    ? requiredTech
    : requiredTech
        .split(/[,;\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
  return [...new Set(arr)];
}
