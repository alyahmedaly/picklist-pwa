import { describe, test, expect } from 'vitest';
import { readIntegrationStats } from '../test-utils';

/** T005: Failing test for decimal comma normalization (Dutch) */

describe('T005 decimal comma normalization (Dutch)', () => {
  test('stats include decimalCommaNormalizedCount >= 1', () => {
    // Read from integration fixture stats which contains real Dutch decimal comma data
    const stats = readIntegrationStats() as {
      decimalCommaNormalizedCount: number;
    };

    // Our real data contains products with "2,5 g" format (comma decimal)
    // Counter should be >= 1 once decimal comma normalization is implemented
    expect(stats).toHaveProperty('decimalCommaNormalizedCount');
    expect(typeof stats.decimalCommaNormalizedCount).toBe('number');
    expect(stats.decimalCommaNormalizedCount).toBeGreaterThanOrEqual(1); // will fail until implemented
  });
});
