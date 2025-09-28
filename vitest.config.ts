import { defineConfig } from 'vitest/config';

// CI command reference: `vitest run --coverage` (see constitution Quality Gates section)

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    testTimeout: 3000, // 3s for accessibility tests (axe needs time)
    hookTimeout: 2000, // Setup/teardown timeout
    include: ['tests/**/*.{test,spec}.ts', 'tests/**/*.{test,spec}.tsx'],
    exclude: ['dist', 'node_modules'],
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    reporters: process.env.CI ? ['default', 'junit'] : ['default'],
    outputFile: process.env.CI ? 'reports/junit.xml' : undefined,
    // Pool configuration to prevent memory leaks
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        isolate: true
      }
    },
    coverage: {
      enabled: false,
      // enable in later task when more code exists
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'lcov', 'html']
    }
  }
});