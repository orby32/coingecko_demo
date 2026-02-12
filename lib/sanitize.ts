const SEARCH_MAX_LENGTH = 10;

/**
 * Sanitizes search input: trims, collapses spaces, limits to max length.
 */
export function sanitizeSearchInput(value: string): string {
  const trimmed = value.trim();
  const collapsed = trimmed.replace(/\s+/g, " ");
  return collapsed.slice(0, SEARCH_MAX_LENGTH);
}
