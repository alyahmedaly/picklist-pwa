/**
 * String processing utilities for @picklist/core
 * Common text manipulation functions used across the picklist ecosystem
 */

/**
 * Normalize text by trimming whitespace and converting to lowercase
 * @param text - Input text to normalize
 * @returns Normalized text
 */
export function normalizeText(text: string): string {
  return text.trim().toLowerCase();
}

/**
 * Remove placeholder values like "NA", "n/a", empty strings
 * @param text - Input text to clean
 * @returns Cleaned text or empty string if it was a placeholder
 */
export function removePlaceholders(text: string): string {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // Common placeholder patterns
  const placeholders = ['na', 'n/a', 'null', 'undefined', '-', ''];

  if (placeholders.includes(lower)) {
    return '';
  }

  return trimmed;
}

/**
 * Split text by delimiter and trim each element
 * @param text - Input text to split
 * @param delimiter - Delimiter to split on
 * @returns Array of trimmed strings
 */
export function splitAndTrim(text: string, delimiter: string): string[] {
  if (!text || !text.trim()) {
    return [];
  }

  return text
    .split(delimiter)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Sanitize text for use as a filename by removing invalid characters
 * @param text - Input text to sanitize
 * @returns Safe filename string
 */
export function sanitizeForFilename(text: string): string {
  // Remove invalid filename characters: < > : " / \ | ? *
  return text
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .toLowerCase();
}
