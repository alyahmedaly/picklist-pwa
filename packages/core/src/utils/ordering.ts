import type { Product } from '@picklist/types';

/** Canonical ordering for final product list: ascending id (numeric or string), then name ascending. */
export function canonicalOrderProducts<T extends Product>(products: T[]): T[] {
  return [...products].sort((a, b) => {
    // Normalize id to comparable (string vs number) by using string but detect numeric possibility
    const aid = a.id;
    const bid = b.id;
    const aNum = typeof aid === 'number' ? aid : Number(aid);
    const bNum = typeof bid === 'number' ? bid : Number(bid);
    const aNumValid = !Number.isNaN(aNum) && String(aNum) === String(aid).replace(/^0+/, '');
    const bNumValid = !Number.isNaN(bNum) && String(bNum) === String(bid).replace(/^0+/, '');
    if (aNumValid && bNumValid) {
      if (aNum !== bNum) return aNum - bNum;
    } else {
      const idCmp = String(aid).localeCompare(String(bid));
      if (idCmp !== 0) return idCmp;
    }
    return String(a.name).localeCompare(String(b.name));
  });
}

/** Canonical key ordering for Product hashing (excluding transient / derived fields). */
export const PRODUCT_KEY_ORDER: string[] = [
  'id',
  'name',
  'price',
  'categories',
  'unit',
  'nutrition',
  'ingredients',
  'allergens',
  'images',
  'flags',
  'added',
  // Note: duplicate_conflicts excluded; hash appended separately
];

/**
 * Sort products by specified criteria
 * @param products - Array of products to sort
 * @param criteria - Sorting criteria: 'name', 'protein', or 'price'
 * @returns Sorted array of products
 */
export function sortProducts(
  products: Product[],
  criteria: 'name' | 'protein' | 'price',
): Product[] {
  return [...products].sort((a, b) => {
    switch (criteria) {
      case 'name':
        return a.name.localeCompare(b.name);

      case 'protein': {
        const aProtein = a.nutrition?.protein || 0;
        const bProtein = b.nutrition?.protein || 0;
        return bProtein - aProtein; // Descending order (highest protein first)
      }

      case 'price': {
        // Prefer sale price when available, otherwise regular price; missing price sorts last
        const aPrice = a.price
          ? typeof a.price.sale === 'number'
            ? a.price.sale
            : a.price.regular
          : Number.MAX_VALUE;
        const bPrice = b.price
          ? typeof b.price.sale === 'number'
            ? b.price.sale
            : b.price.regular
          : Number.MAX_VALUE;
        return aPrice - bPrice; // Ascending order (lowest effective price first)
      }

      default:
        return 0;
    }
  });
}

/**
 * Generate a consistent product ID from name and brand
 * @param name - Product name
 * @param brand - Optional brand name
 * @returns Generated product ID
 */
export function generateProductId(name: string, brand?: string): string {
  const baseName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const brandPart = brand ? `-${brand.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : '';
  return `${baseName}${brandPart}`.replace(/-+/g, '-').replace(/^-|-$/g, '');
}
