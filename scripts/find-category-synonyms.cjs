#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Analyze category data from production to find synonyms and variations
 * for the satiety analysis normalizedCategorySynonyms mapping
 */

function extractAllCategoryNames(categoryTree, depth = 0) {
  const categories = new Set();

  function traverse(nodes) {
    for (const node of nodes) {
      if (node.name) {
        categories.add(node.name.toLowerCase().trim());
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }

  traverse(categoryTree);
  return Array.from(categories);
}

function analyzeForSatietyMapping(categories) {
  // Current satiety mapping targets
  const satietyTargets = {
    dranken: ['dranken', 'drankje'],
    zuivel: ['zuivel', 'melk', 'zuiveling'],
    fruit: ['fruit'],
    groenten: ['groenten', 'groente'],
    vlees: ['vlees', 'vissen', 'vleeswaren'],
    vis: ['vis'],
    brood: ['brood', 'broodje']
  };

  const findings = {
    dranken: [],
    zuivel: [],
    fruit: [],
    groenten: [],
    vlees: [],
    vis: [],
    brood: [],
    other: []
  };

  console.log('Analyzing categories for satiety mapping relevance...\n');

  for (const category of categories) {
    let matched = false;

    // Check for drink-related terms
    if (category.includes('drank') || category.includes('thee') || category.includes('koffie') ||
        category.includes('sap') || category.includes('water') || category.includes('wijn') ||
        category.includes('bier') || category.includes('frisdrank') || category.includes('smoothie')) {
      findings.dranken.push(category);
      matched = true;
    }

    // Check for dairy-related terms
    else if (category.includes('melk') || category.includes('yoghurt') || category.includes('kaas') ||
             category.includes('room') || category.includes('boter') || category.includes('zuivel') ||
             category.includes('kwark') || category.includes('vla')) {
      findings.zuivel.push(category);
      matched = true;
    }

    // Check for fruit-related terms
    else if (category.includes('fruit') || category.includes('appel') || category.includes('banaan') ||
             category.includes('aardbei') || category.includes('sinaasappel') || category.includes('peer') ||
             category.includes('druif') || category.includes('bes')) {
      findings.fruit.push(category);
      matched = true;
    }

    // Check for vegetable-related terms
    else if (category.includes('groent') || category.includes('salade') || category.includes('tomaat') ||
             category.includes('wortel') || category.includes('ui') || category.includes('paprika') ||
             category.includes('komkommer')) {
      findings.groenten.push(category);
      matched = true;
    }

    // Check for meat-related terms
    else if (category.includes('vlees') || category.includes('kip') || category.includes('rund') ||
             category.includes('varken') || category.includes('ham') || category.includes('worst') ||
             category.includes('gehakt') || category.includes('bacon') || category.includes('salami')) {
      findings.vlees.push(category);
      matched = true;
    }

    // Check for fish-related terms
    else if (category.includes('vis') || category.includes('zalm') || category.includes('tonijn') ||
             category.includes('garnaal') || category.includes('mosselen') || category.includes('haring')) {
      findings.vis.push(category);
      matched = true;
    }

    // Check for bread/grain-related terms
    else if (category.includes('brood') || category.includes('broodje') || category.includes('toast') ||
             category.includes('beschuit') || category.includes('cracker') || category.includes('knäckebröd') ||
             category.includes('wrap') || category.includes('bagel')) {
      findings.brood.push(category);
      matched = true;
    }

    if (!matched) {
      findings.other.push(category);
    }
  }

  return findings;
}

function generateSynonymMapping(findings) {
  console.log('=== SATIETY CATEGORY MAPPING SUGGESTIONS ===\n');

  const synonymMap = {};

  Object.entries(findings).forEach(([target, categories]) => {
    if (target === 'other') return;

    console.log(`🍽️  ${target.toUpperCase()}:`);
    if (categories.length === 0) {
      console.log('   No relevant categories found');
    } else {
      categories.sort().forEach(cat => {
        console.log(`   ${cat}`);
        synonymMap[cat] = target;
      });
    }
    console.log('');
  });

  return synonymMap;
}

function generateCodeOutput(synonymMap) {
  console.log('=== UPDATED normalizedCategorySynonyms CODE ===\n');

  console.log('const normalizedCategorySynonyms = (cat?: string) => {');
  console.log('  if (!cat) return undefined;');
  console.log('  const synonyms: Record<string, string> = {');

  // Current manual mappings (keep these)
  console.log('    // Manual mappings');
  console.log('    dranken: "dranken",');
  console.log('    drankje: "dranken",');
  console.log('    melk: "zuivel",');
  console.log('    zuiveling: "zuivel",');
  console.log('    groente: "groenten",');
  console.log('    vissen: "vis",');
  console.log('    vleeswaren: "vlees",');
  console.log('    broodje: "brood",');
  console.log('');

  // Add data-driven mappings
  console.log('    // Data-driven mappings from category analysis');
  Object.entries(synonymMap).forEach(([synonym, target]) => {
    console.log(`    "${synonym}": "${target}",`);
  });

  console.log('  };');
  console.log('  if (synonyms[cat]) return synonyms[cat];');
  console.log('');
  console.log('  // Fallback plural handling');
  console.log('  if (cat.endsWith("en")) return cat;');
  console.log('  if (cat.endsWith("s")) return cat.slice(0, -1);');
  console.log('  return cat;');
  console.log('};');
}

function main() {
  console.log('Analyzing category data for satiety mapping synonyms...\n');

  // Read the category tree
  const categoryTreePath = path.join(__dirname, '../out/category-tree.json');

  if (!fs.existsSync(categoryTreePath)) {
    console.error('Category tree file not found:', categoryTreePath);
    console.log('Run data transformation first to generate category-tree.json');
    return;
  }

  const categoryData = JSON.parse(fs.readFileSync(categoryTreePath, 'utf8'));

  if (!categoryData.categoryTree) {
    console.error('Invalid category tree structure');
    return;
  }

  console.log(`Found ${categoryData.metadata.totalCategories} total categories`);
  console.log(`${categoryData.metadata.categoriesWithProducts} categories have products\n`);

  // Extract all category names
  const allCategories = extractAllCategoryNames(categoryData.categoryTree);
  console.log(`Extracted ${allCategories.length} unique category names\n`);

  // Analyze for satiety mapping relevance
  const findings = analyzeForSatietyMapping(allCategories);

  // Generate synonym mapping
  const synonymMap = generateSynonymMapping(findings);

  console.log(`\n=== SUMMARY ===`);
  console.log(`Found mappings for:`);
  Object.entries(findings).forEach(([target, categories]) => {
    if (target !== 'other' && categories.length > 0) {
      console.log(`  ${target}: ${categories.length} categories`);
    }
  });
  console.log(`Unmapped categories: ${findings.other.length}`);

  console.log('\n');
  generateCodeOutput(synonymMap);

  // Show some unmapped categories for context
  if (findings.other.length > 0) {
    console.log('\n=== UNMAPPED CATEGORIES (sample) ===');
    findings.other.slice(0, 20).forEach(cat => console.log(`  ${cat}`));
    if (findings.other.length > 20) {
      console.log(`  ... and ${findings.other.length - 20} more`);
    }
  }
}

if (require.main === module) {
  main();
}