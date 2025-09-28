#!/usr/bin/env node

/**
 * Pre-integration fixture builder
 *
 * This script transforms real production data once to create a comprehensive
 * fixture output that all integration tests can read from, eliminating race
 * conditions and improving test performance.
 *
 * Usage: node scripts/build-integration-fixture.js
 * Output: tests/fixtures/integration-output/
 */

import { execSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const FIXTURE_INPUT = 'tests/fixtures/integration-real-data.csv';
const FIXTURE_OUTPUT = 'tests/fixtures/integration-output';

async function main() {
  console.log('🔧 Building integration test fixture from real data...');

  // Clean and create output directory
  if (existsSync(FIXTURE_OUTPUT)) {
    rmSync(FIXTURE_OUTPUT, { recursive: true, force: true });
  }
  mkdirSync(FIXTURE_OUTPUT, { recursive: true });

  // Transform the real data fixture
  const transformCmd = `node src/scripts/transform-data.ts --input ${FIXTURE_INPUT} --outDir ${FIXTURE_OUTPUT} --log human`;

  try {
    console.log(`📊 Running transform: ${transformCmd}`);
    execSync(transformCmd, { stdio: 'inherit' });

    console.log('✅ Integration fixture built successfully!');
    console.log(`📁 Output available at: ${resolve(FIXTURE_OUTPUT)}`);
    console.log('📋 Files created:');
    console.log('   - products.jsonl');
    console.log('   - products-index.json');
    console.log('   - stats.json');
    console.log('   - schema.md');
  } catch (error) {
    console.error('❌ Failed to build integration fixture:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
