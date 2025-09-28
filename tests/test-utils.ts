// Shared test utilities (initial scaffold)
// Will be expanded during implementation phase.

import fs from 'node:fs';
import path from 'node:path';

// Integration fixture utilities
const INTEGRATION_FIXTURE_PATH = 'tests/fixtures/integration-output';

export function readIntegrationProducts(): unknown[] {
  const productsPath = path.join(INTEGRATION_FIXTURE_PATH, 'products.jsonl');
  const raw = fs.readFileSync(productsPath, 'utf8').trim();
  if (!raw) return [];
  return raw.split('\n').map((line) => JSON.parse(line));
}

export function readIntegrationStats(): unknown {
  const statsPath = path.join(INTEGRATION_FIXTURE_PATH, 'stats.json');
  const raw = fs.readFileSync(statsPath, 'utf8');
  return JSON.parse(raw);
}

export function readIntegrationIndex(): unknown {
  const indexPath = path.join(INTEGRATION_FIXTURE_PATH, 'products-index.json');
  const raw = fs.readFileSync(indexPath, 'utf8');
  return JSON.parse(raw);
}

export function readIntegrationSchema(): string {
  const schemaPath = path.join(INTEGRATION_FIXTURE_PATH, 'schema.md');
  return fs.readFileSync(schemaPath, 'utf8');
}
