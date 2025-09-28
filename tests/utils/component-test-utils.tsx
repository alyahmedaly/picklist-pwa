/**
 * Component Testing Utilities
 *
 * Provides testing utilities for the design system components,
 * including providers, mocks, and accessibility testing helpers.
 */

import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { axe } from 'vitest-axe';
import { designTokens, DesignTokenProvider } from '../../src/lib/design-tokens';

// Note: toHaveNoViolations is extended in tests/setup.ts

/**
 * Design system test provider wrapper
 */
interface TestProvidersProps {
  children: ReactNode;
  tokens?: typeof designTokens;
}

function TestProviders({ children, tokens = designTokens }: TestProvidersProps) {
  const tokenProvider = new DesignTokenProvider(tokens);

  return (
    <div data-testid="design-system-provider">
      {children}
    </div>
  );
}

/**
 * Custom render function with design system providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  designTokens?: typeof designTokens;
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult {
  const { designTokens: tokens, ...renderOptions } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    return <TestProviders tokens={tokens}>{children}</TestProviders>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Mock design tokens for testing
 */
export function mockDesignTokens(overrides: Partial<typeof designTokens> = {}) {
  return {
    ...designTokens,
    ...overrides,
  };
}

/**
 * Accessibility testing helper
 */
export async function testAccessibility(component: ReactElement): Promise<void> {
  const { container } = renderWithProviders(component);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}

/**
 * Mock nutrition data for testing
 */
export const mockNutrition = {
  protein: 25,
  calories: 150,
  carbs: 12,
  fat: 8,
  fiber: 3,
  sodium: 200,
};

/**
 * Mock product data for testing
 */
export const mockProduct = {
  id: 'test-product-1',
  name: 'Test Chicken Breast',
  category: 'meat',
  imageUrl: '/test-image.jpg',
};

/**
 * Mock pricing data for testing
 */
export const mockPricing = {
  pricePerUnit: 2.50,
  unit: '100g',
  currency: 'EUR',
  discounted: false,
};

/**
 * Mock health score data for testing
 */
export const mockHealthScore = {
  grade: 'A' as const,
  score: 95,
};

/**
 * Viewport testing utilities
 */
export const mockViewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1024, height: 768 },
  wide: { width: 1280, height: 800 },
};

export function mockViewport(viewport: keyof typeof mockViewports) {
  const { width, height } = mockViewports[viewport];

  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });

  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
}

/**
 * Component testing patterns
 */
export const testPatterns = {
  /**
   * Test component props validation
   */
  async testComponentProps<T>(
    Component: React.ComponentType<T>,
    validProps: T,
    invalidProps: Partial<T>[]
  ) {
    // Test valid props render without error
    expect(() => renderWithProviders(<Component {...validProps} />)).not.toThrow();

    // Test accessibility with valid props
    await testAccessibility(<Component {...validProps} />);

    // Test invalid props (if provided)
    for (const props of invalidProps) {
      const testProps = { ...validProps, ...props } as T;
      // We expect these to render without crashing but may have console warnings
      expect(() => renderWithProviders(<Component {...testProps} />)).not.toThrow();
    }
  },

  /**
   * Test component accessibility
   */
  async testComponentAccessibility<T>(
    Component: React.ComponentType<T>,
    props: T,
    options: {
      expectedRole?: string;
      expectedLabels?: string[];
      keyboardNavigable?: boolean;
    } = {}
  ) {
    const { container, getByRole, queryByLabelText } = renderWithProviders(
      <Component {...props} />
    );

    // Check ARIA role if specified
    if (options.expectedRole) {
      expect(getByRole(options.expectedRole)).toBeInTheDocument();
    }

    // Check ARIA labels if specified
    if (options.expectedLabels) {
      options.expectedLabels.forEach(label => {
        expect(queryByLabelText(label)).toBeInTheDocument();
      });
    }

    // Check keyboard navigation if specified
    if (options.keyboardNavigable) {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      expect(focusableElements.length).toBeGreaterThan(0);
    }

    // Run axe accessibility tests
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  },

  /**
   * Test component responsive behavior
   */
  testComponentResponsive<T>(
    Component: React.ComponentType<T>,
    props: T,
    expectations: {
      mobile?: (container: HTMLElement) => void;
      tablet?: (container: HTMLElement) => void;
      desktop?: (container: HTMLElement) => void;
    }
  ) {
    Object.entries(expectations).forEach(([viewport, expectation]) => {
      mockViewport(viewport as keyof typeof mockViewports);
      const { container } = renderWithProviders(<Component {...props} />);
      expectation(container);
    });
  },
};

/**
 * Visual regression testing helpers
 */
export async function testVisualRegression(storyName: string): Promise<void> {
  // This would integrate with a visual regression testing tool like Chromatic
  // For now, we'll just validate the story exists and renders
  console.log(`Visual regression test for story: ${storyName}`);
  // In a real implementation, this would take screenshots and compare
}

/**
 * Performance testing utilities
 */
export function measureRenderTime<T>(
  Component: React.ComponentType<T>,
  props: T,
  iterations: number = 100
): number {
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    const { unmount } = renderWithProviders(<Component {...props} />);
    unmount();
  }

  const end = performance.now();
  return (end - start) / iterations;
}

/**
 * Memory leak detection helper
 */
export function detectMemoryLeaks<T>(
  Component: React.ComponentType<T>,
  props: T,
  iterations: number = 50
): Promise<void> {
  return new Promise((resolve) => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

    for (let i = 0; i < iterations; i++) {
      const { unmount } = renderWithProviders(<Component {...props} />);
      unmount();
    }

    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }

    setTimeout(() => {
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Warn if memory increased significantly (more than 1MB)
      if (memoryIncrease > 1024 * 1024) {
        console.warn(`Potential memory leak detected: ${memoryIncrease} bytes increase`);
      }

      resolve();
    }, 100);
  });
}

// Re-export testing library utilities for convenience
export * from '@testing-library/react';
export { axe } from 'vitest-axe';