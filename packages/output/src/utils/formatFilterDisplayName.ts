/**
 * Formats filter name into user-friendly display name.
 *
 * @param filterName - Internal filter name (e.g., 'daily-protein')
 * @returns Formatted display name (e.g., 'Daily Protein')
 */


export function formatFilterDisplayName(filterName: string): string {
  return filterName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
