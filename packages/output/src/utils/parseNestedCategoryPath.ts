import type { CategoryPathInfo } from '@picklist/types';

/**
 * Parses category breadcrumbs into nested directory path information.
 * Converts "Aardappel > Aardappelen > Geschild" to nested structure.
 *
 * @param breadcrumbs - Category breadcrumbs (e.g., "Aardappel > Aardappelen > Geschild")
 * @returns Path information for nested directory structure
 */


export function parseNestedCategoryPath(breadcrumbs: string): CategoryPathInfo {
  const parts = breadcrumbs
    .split(' > ')
    .map(part => part
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Collapse multiple hyphens
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    )
    .filter(part => part.length > 0);

  const fileName = parts[parts.length - 1]; // Last part becomes filename
  const directoryPath = parts.slice(0, -1).join('/'); // Earlier parts become directory
  const fullPath = parts.join('/');

  return {
    directoryPath,
    fileName,
    fullPath,
    depth: parts.length,
    parts,
  };
}
