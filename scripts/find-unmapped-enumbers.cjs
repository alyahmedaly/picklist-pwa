#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Find E-numbers mentioned in ingredient lists that aren't in our database
 */

// Read our current E-number database to get known E-numbers
function getKnownENumbers() {
  const dbPath = path.join(__dirname, '../packages/parser/src/product/parse/additive/eNumberDatabase.ts');
  const content = fs.readFileSync(dbPath, 'utf8');

  // Extract E-numbers from the database (matches like "E123:" in object keys)
  const matches = content.match(/E\d{3}[a-z]*:/g);
  const known = new Set();

  if (matches) {
    matches.forEach(match => {
      const eNumber = match.replace(':', '');
      known.add(eNumber.toUpperCase());
    });
  }

  return known;
}

// Extract E-numbers from ingredient text
function extractENumbersFromText(text) {
  if (!text || typeof text !== 'string') return [];

  // Match E-numbers in various formats:
  // E123, E123a, E123b, etc.
  // Also match formats like (E123) or "E 123"
  const eNumberPattern = /\b[Ee][\s-]?(\d{3}[a-zA-Z]*)\b/g;
  const found = [];
  let match;

  while ((match = eNumberPattern.exec(text)) !== null) {
    const eNumber = 'E' + match[1];
    found.push(eNumber.toUpperCase());
  }

  return found;
}

// Process CSV data to find all E-numbers mentioned
function findAllENumbers() {
  const testFixture = path.join(__dirname, '../data/2024-10-23.csv');

  if (!fs.existsSync(testFixture)) {
    console.error('Test fixture not found:', testFixture);
    return new Map();
  }

  const csvContent = fs.readFileSync(testFixture, 'utf8');
  const lines = csvContent.split('\n');

  if (lines.length < 2) {
    console.error('Invalid CSV format');
    return new Map();
  }

  // Get headers
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

  // Find ingredient-related columns
  const ingredientColumns = [];
  headers.forEach((header, index) => {
    const lowerHeader = header.toLowerCase();
    if (lowerHeader.includes('ingredient') ||
        lowerHeader.includes('additives') ||
        lowerHeader.includes('allergen') ||
        lowerHeader === 'ingredients') {
      ingredientColumns.push(index);
    }
  });

  console.log(`Found ${ingredientColumns.length} ingredient-related columns:`,
    ingredientColumns.map(i => headers[i]));

  const eNumberCounts = new Map();

  // Process each data row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (assuming no commas within quoted fields for ingredient columns)
    const fields = line.split(',').map(f => f.replace(/^"(.*)"$/, '$1').trim());

    // Check ingredient columns for E-numbers
    ingredientColumns.forEach(colIndex => {
      if (fields[colIndex]) {
        const eNumbers = extractENumbersFromText(fields[colIndex]);
        eNumbers.forEach(eNumber => {
          eNumberCounts.set(eNumber, (eNumberCounts.get(eNumber) || 0) + 1);
        });
      }
    });
  }

  return eNumberCounts;
}

function main() {
  console.log('Finding unmapped E-numbers in ingredient lists...\n');

  // Get known E-numbers from our database
  const knownENumbers = getKnownENumbers();
  console.log(`Known E-numbers in database: ${knownENumbers.size}`);

  // Find all E-numbers mentioned in ingredient lists
  const allENumbers = findAllENumbers();
  console.log(`Total E-numbers found in ingredient lists: ${allENumbers.size}\n`);

  // Find unmapped ones
  const unmappedENumbers = new Map();
  const mappedENumbers = new Map();

  allENumbers.forEach((count, eNumber) => {
    if (knownENumbers.has(eNumber)) {
      mappedENumbers.set(eNumber, count);
    } else {
      unmappedENumbers.set(eNumber, count);
    }
  });

  // Sort by frequency
  const sortedUnmapped = Array.from(unmappedENumbers.entries())
    .sort((a, b) => b[1] - a[1]);

  const sortedMapped = Array.from(mappedENumbers.entries())
    .sort((a, b) => b[1] - a[1]);

  console.log('=== UNMAPPED E-NUMBERS (not in database) ===');
  if (sortedUnmapped.length === 0) {
    console.log('✅ All E-numbers found in ingredient lists are mapped!');
  } else {
    console.log('E-Number\tFrequency\tPriority');
    console.log('--------\t---------\t--------');
    sortedUnmapped.forEach(([eNumber, count]) => {
      let priority = 'LOW';
      if (count >= 10) priority = 'HIGH';
      else if (count >= 5) priority = 'MEDIUM';

      console.log(`${eNumber}\t\t${count}\t\t${priority}`);
    });
  }

  console.log('\n=== MAPPED E-NUMBERS (already in database) ===');
  console.log('Top 10 most frequent:');
  sortedMapped.slice(0, 10).forEach(([eNumber, count]) => {
    console.log(`${eNumber}: ${count}`);
  });

  console.log('\n=== SUMMARY ===');
  console.log(`✅ Mapped E-numbers: ${mappedENumbers.size}`);
  console.log(`❌ Unmapped E-numbers: ${unmappedENumbers.size}`);
  console.log(`📊 Coverage: ${((mappedENumbers.size / allENumbers.size) * 100).toFixed(1)}%`);

  if (sortedUnmapped.length > 0) {
    console.log('\n=== RECOMMENDATIONS ===');
    const highPriority = sortedUnmapped.filter(([, count]) => count >= 50);
    const mediumPriority = sortedUnmapped.filter(([, count]) => count >= 5 && count < 10);

    if (highPriority.length > 0) {
      console.log('🔴 HIGH PRIORITY (≥50 occurrences):');
      highPriority.forEach(([eNumber]) => {
        console.log(`   Add ${eNumber} to eNumberDatabase.ts`);
      });
    }

    if (mediumPriority.length > 0) {
      console.log('🟡 MEDIUM PRIORITY (5-9 occurrences):');
      mediumPriority.forEach(([eNumber]) => {
        console.log(`   Consider adding ${eNumber} to eNumberDatabase.ts`);
      });
    }
  }
}

if (require.main === module) {
  main();
}