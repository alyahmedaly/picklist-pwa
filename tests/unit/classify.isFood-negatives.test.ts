import { describe, it, expect } from 'vitest';
import { classify } from '../../src/data/transform/classify.ts';

// T009: isFood negative keyword classification – now asserts implemented behavior.

const samples = [
  { categories: ['Supplement Goods'], expectedIsFood: false },
  { categories: ['Health Capsule'], expectedIsFood: false },
  { categories: ['Vitamin Tablet Pack'], expectedIsFood: false },
  { categories: ['Kids Toy Candy Mix'], expectedIsFood: false },
  { categories: ['Spice Pack'], expectedIsFood: false },
  { categories: ['Gourmet Spice Set'], expectedIsFood: false },
  { categories: ['Chef Starter Kit'], expectedIsFood: false },
  { categories: ['Organic Pasta Grocery'], expectedIsFood: true },
];

describe('T009 isFood negative keyword classification', () => {
  it('applies negative keyword rules', () => {
    const failures = samples.filter(
      (s) => classify({ categories: s.categories }).flags.isFood !== s.expectedIsFood,
    );
    expect(failures).toEqual([]);
  });
});
