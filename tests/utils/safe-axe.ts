/**
 * Safe axe testing utilities with timeout protection
 */
import { axe, AxeResults } from 'vitest-axe';

/**
 * Safe axe test with timeout protection
 */
export async function safeAxe(
  container: Element,
  options: any = {},
  timeoutMs: number = 2000
): Promise<AxeResults> {
  return new Promise((resolve, reject) => {
    // Set up timeout
    const timeout = setTimeout(() => {
      reject(new Error(`Axe test timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    // Run axe test
    axe(container, options)
      .then((results) => {
        clearTimeout(timeout);
        resolve(results);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

/**
 * Safe axe test with retry logic
 */
export async function safeAxeWithRetry(
  container: Element,
  options: any = {},
  maxRetries: number = 2,
  timeoutMs: number = 2000
): Promise<AxeResults> {
  let lastError: Error | null = null;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await safeAxe(container, options, timeoutMs);
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries) {
        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  throw lastError || new Error('Axe test failed after retries');
}

/**
 * Quick contrast-only axe test
 */
export async function quickContrastTest(container: Element): Promise<AxeResults> {
  return safeAxe(container, {
    rules: {
      'color-contrast': { enabled: true }
    }
  }, 1500); // Shorter timeout for contrast-only tests
}