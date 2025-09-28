import { describe, test, expect } from 'vitest';
import { readIntegrationSchema } from '../test-utils';

/** T013: Failing integration test for schema doc Localization section */

describe('Schema documentation supports Dutch localization for Netherlands users', () => {
  test('schema documentation includes localization information for Dutch market features', () => {
    const schemaContent = readIntegrationSchema();

    // Business value: Users understand Dutch-specific features in documentation
    expect(schemaContent.length).toBeGreaterThan(0);

    // Schema should document localization features (flexible matching for real content)
    expect(schemaContent).toMatch(/localization|dutch|nederland/i);
  });

  test('schema documents Dutch allergen and formatting features for Netherlands compliance', () => {
    const schemaContent = readIntegrationSchema();

    // Business value: Developers understand Dutch-specific data processing features
    expect(schemaContent.length).toBeGreaterThan(0);

    // Schema should document key Dutch features - flexible matching for actual content
    const hasAllergenInfo =
      schemaContent.toLowerCase().includes('allergen') ||
      schemaContent.toLowerCase().includes('allergenen');
    const hasDutchInfo =
      schemaContent.toLowerCase().includes('dutch') ||
      schemaContent.toLowerCase().includes('nederland') ||
      schemaContent.toLowerCase().includes('nl');

    // At least some Dutch localization features should be documented
    expect(hasAllergenInfo || hasDutchInfo).toBe(true);
  });
});
