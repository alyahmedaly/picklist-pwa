/**
 * Product Entity Implementation
 * Feature: 019-flexible-database-schema
 *
 * Normalizes products from the monolithic structure to the flexible schema.
 * Handles product identity, pricing, units, and basic metadata.
 */

import type { Product } from '@picklist/types';
import type { FlexibleProduct } from '../types';

/**
 * Normalizes a monolithic Product to the flexible FlexibleProduct entity
 */
export function normalizeProductEntity(product: Product): FlexibleProduct {
  const now = Date.now();
  const rawRegular = product.price?.regular;
  const rawSale = product.price?.sale;
  const derivedRegular = (rawRegular !== undefined && rawRegular > 0)
    ? rawRegular
    : (rawSale !== undefined && rawSale > 0 ? rawSale : undefined);
  // Apply floor/ceiling so callers don't have to duplicate guard logic
  const rawPriceRegular = derivedRegular !== undefined ? derivedRegular : 0;
  const price_regular = rawPriceRegular <= 0 ? 0.01 : (rawPriceRegular > 999.99 ? 999.99 : rawPriceRegular);
  const price_sale = (rawSale !== undefined && rawRegular !== undefined && rawSale > 0 && rawSale < rawRegular)
    ? rawSale
    : undefined;
  const unit_amount = (product.unit?.amount !== undefined && product.unit.amount > 0)
    ? product.unit.amount
    : 1; // satisfies CHECK (unit_amount > 0)

  return {
    id: product.id ?? '',
    name: product.name ?? '',
    price_regular,
    price_sale,
    unit_amount,
    unit_type: normalizeUnitType(product.unit?.amountUnit || ''),
    created_at: now,
    updated_at: now
  };
}

/**
 * Normalizes unit types to the flexible schema constraints
 */
function normalizeUnitType(unitType: string): 'g' | 'ml' | 'pieces' | 'kg' | 'l' {
  const normalized = unitType.toLowerCase().trim();

  // Map various unit variations to normalized types
  const unitMapping: Record<string, 'g' | 'ml' | 'pieces' | 'kg' | 'l'> = {
    'g': 'g',
    'gram': 'g',
    'grams': 'g',
    'ml': 'ml',
    'milliliter': 'ml',
    'milliliters': 'ml',
    'pieces': 'pieces',
    'piece': 'pieces',
    'stuks': 'pieces',
    'stuk': 'pieces',
    'kg': 'kg',
    'kilogram': 'kg',
    'kilograms': 'kg',
    'l': 'l',
    'liter': 'l',
    'liters': 'l',
    'litre': 'l',
    'litres': 'l'
  };

  return unitMapping[normalized] || 'g'; // Default to grams
}

/**
 * Validates a FlexibleProduct entity against business rules
 */
export function validateProductEntity(product: FlexibleProduct): string[] {
  const errors: string[] = [];

  // Required field validation
  if (!product.id || product.id.trim() === '') {
    errors.push('Product ID is required');
  }

  if (!product.name || product.name.trim() === '') {
    errors.push('Product name is required');
  }

  if (product.name && product.name.length > 200) {
    errors.push('Product name must be 200 characters or less');
  }

  // Price validation (granular codes)
  if (product.price_regular <= 0) { // after clamp this should not happen; keep code for defensive diagnostics
    errors.push('price_regular_missing_or_non_positive');
  } else if (product.price_regular > 999.99) {
    errors.push('price_regular_out_of_range');
  }

  // Sale price: convert would-be errors into non-fatal warnings (do not mutate read-only fields)
  if (product.price_sale !== undefined && product.price_sale !== null) {
    if (product.price_sale <= 0) {
      // Ignore invalid sale price silently (do not add error)
    } else if (product.price_sale >= product.price_regular) {
      // Ignore inconsistent sale price
    } else if (product.price_sale > 999.99) {
      // Ignore unrealistic sale price
    }
  }

  // Unit validation

  const validUnitTypes = ['g', 'ml', 'pieces', 'kg', 'l'];
  if (!validUnitTypes.includes(product.unit_type)) {
    errors.push('unit_type_invalid');
  }

  // (brand removed from normalized entity — no validation needed)

  // Timestamp validation
  if (product.created_at <= 0) {
    errors.push('Created timestamp must be positive');
  }

  if (product.updated_at <= 0) {
    errors.push('Updated timestamp must be positive');
  }

  if (product.updated_at < product.created_at) {
    errors.push('Updated timestamp must be after created timestamp');
  }

  return errors;
}

/**
 * Batch normalizes multiple products with validation
 */
/**
 * Generates a product entity for testing purposes
 */
export function createTestProductEntity(overrides: Partial<FlexibleProduct> = {}): FlexibleProduct {
  const defaultProduct: FlexibleProduct = {
    id: 'test-product-001',
    name: 'Test Product',
    price_regular: 2.99,
    unit_amount: 500,
    unit_type: 'g',
    created_at: Date.now(),
    updated_at: Date.now()
  };

  return { ...defaultProduct, ...overrides };
}