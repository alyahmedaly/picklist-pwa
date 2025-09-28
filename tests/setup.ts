import { expect, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

// Extend Vitest's expect with Testing Library's matchers
expect.extend(matchers);

// Cleanup DOM after each test to prevent test interference
afterEach(() => {
  cleanup();
});

// Add vitest-axe matchers
import { toHaveNoViolations } from 'vitest-axe/matchers';
expect.extend({ toHaveNoViolations });

// Mock window.ResizeObserver
(globalThis as any).ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.matchMedia (conditionally for browser environment)
declare global {
  interface Window {
    matchMedia: (query: string) => {
      matches: boolean;
      media: string;
      onchange: null;
      addListener: () => void;
      removeListener: () => void;
      addEventListener: () => void;
      removeEventListener: () => void;
      dispatchEvent: () => void;
    };
  }
}

if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
  Object.defineProperty((globalThis as any).window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}
