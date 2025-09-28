import { describe, it, expect } from 'vitest';
import { buildCategoryTree } from '../../src/data/transform/parseCategories.ts';

describe('parseCategories - buildCategoryTree', () => {
  it('should build category tree from flat array', () => {
    const categories = ['Food', 'Dairy', 'Milk'];
    const result = buildCategoryTree(categories);

    expect(result.tree).toEqual(['Food', 'Dairy', 'Milk']);
    expect(result.primary).toBe('Food');
    expect(result.breadcrumbs).toBe('Food > Dairy > Milk');
    expect(result.depth).toBe(3);
  });

  it('should handle empty array', () => {
    const result = buildCategoryTree([]);

    expect(result.tree).toEqual([]);
    expect(result.primary).toBe('');
    expect(result.breadcrumbs).toBe('');
    expect(result.depth).toBe(0);
  });

  it('should handle null/undefined input', () => {
    const resultNull = buildCategoryTree(null as any);
    const resultUndefined = buildCategoryTree(undefined as any);

    expect(resultNull.tree).toEqual([]);
    expect(resultNull.primary).toBe('');
    expect(resultNull.breadcrumbs).toBe('');
    expect(resultNull.depth).toBe(0);

    expect(resultUndefined.tree).toEqual([]);
    expect(resultUndefined.primary).toBe('');
    expect(resultUndefined.breadcrumbs).toBe('');
    expect(resultUndefined.depth).toBe(0);
  });

  it('should handle single category', () => {
    const result = buildCategoryTree(['Electronics']);

    expect(result.tree).toEqual(['Electronics']);
    expect(result.primary).toBe('Electronics');
    expect(result.breadcrumbs).toBe('Electronics');
    expect(result.depth).toBe(1);
  });

  it('should filter out empty/null categories', () => {
    const categories = ['Food', '', null, 'Dairy', '   ', 'Milk'];
    const result = buildCategoryTree(categories as any);

    expect(result.tree).toEqual(['Food', 'Dairy', 'Milk']);
    expect(result.primary).toBe('Food');
    expect(result.breadcrumbs).toBe('Food > Dairy > Milk');
    expect(result.depth).toBe(3);
  });
});
