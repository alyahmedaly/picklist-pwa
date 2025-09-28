import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { classify } from '../../src/data/transform/classify.ts';

// T016: Debug logging gate – classify should only emit console.log when CLASSIFY_DEBUG enabled.

const prevEnv = { ...process.env };

describe('T016 debug logging gate', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    process.env.CLASSIFY_DEBUG = prevEnv.CLASSIFY_DEBUG;
  });

  it('suppresses logs when debug disabled', () => {
    delete process.env.CLASSIFY_DEBUG;
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    classify({ categories: ['Grocery Kit'] }); // contains negative but without debug flag
    expect(spy).not.toHaveBeenCalled();
  });

  it('still suppresses logs when debug flag set (debug removed)', () => {
    process.env.CLASSIFY_DEBUG = '1';
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    classify({ categories: ['Grocery Supplement Pack'] });
    expect(spy).not.toHaveBeenCalled();
  });
});
