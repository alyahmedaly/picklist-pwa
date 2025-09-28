/**
 * Formats kebab-case names into human-readable display names.
 * Used for category and file names in the directory structure.
 *
 * @param name - Kebab-case name (e.g., 'zwarte-thee-meerkops')
 * @returns Human-readable name (e.g., 'Zwarte Thee Meerkops')
 */


export function formatDisplayName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
