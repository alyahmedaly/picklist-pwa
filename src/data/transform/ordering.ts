import type { Product } from './types.ts';

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
