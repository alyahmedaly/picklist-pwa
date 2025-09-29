/**
 * Image URL utilities for handling Albert Heijn product images
 *
 * Uses /api/images proxy path for all environments:
 * - Development: Handled by Vite dev server proxy configuration
 * - Production: Handled by service worker runtime caching with URL rewriting
 */

/**
 * Transform image URL for the current environment
 * @param originalUrl - Original Albert Heijn image URL
 * @returns Appropriate URL for current environment
 */
export function getImageUrl(originalUrl: string): string {
  if (!originalUrl) return '';

  // Always use the /api/images proxy path
  // - Development: Handled by Vite dev server proxy
  // - Production: Handled by service worker proxy
  return originalUrl.replace('https://static.ah.nl', '/api/images');
}

/**
 * Get a fallback image URL or data URI for broken images
 */
export function getFallbackImageDataUri(): string {
  // Simple SVG fallback as data URI
  const svg = `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f3f4f6"/>
      <text x="100" y="90" font-family="Arial, sans-serif" font-size="48" text-anchor="middle" fill="#9ca3af">📦</text>
      <text x="100" y="130" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#6b7280">No Image</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}