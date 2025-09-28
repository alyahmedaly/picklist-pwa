import type { Product } from '@picklist/types';

/**
 * Individual filter function type for functional composition.
 */
export type FilterFunction = (product: Product) => boolean;
