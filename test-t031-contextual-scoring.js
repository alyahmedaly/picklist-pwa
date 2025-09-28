/**
 * T031 Contextual Scoring Test
 * 
 * Basic test to validate the new contextual scoring functionality
 */

import { ProductRepositoryImpl } from '../src/db/repositories/ProductRepository.js';
import { ProductScoreType, ProductScoreContext } from '../src/db/kysely/database.js';

async function testContextualScoring() {
  console.log('🧪 Testing T031: Contextual Scoring with Metadata');
  
  const repository = new ProductRepositoryImpl();
  
  try {
    // Test 1: Basic contextual scoring query
    console.log('\n📊 Test 1: Basic contextual scoring query');
    const filters = {
      context: ProductScoreContext.training_day,
      minScore: 70,
      includeMetadata: true
    };
    
    const result = await repository.getProductsWithContextualScoring(
      filters,
      { limit: 10, offset: 0 }
    );
    
    console.log(`✅ Found ${result.filteredCount} products with training day scores >= 70`);
    console.log(`📈 Query time: ${result.queryTimeMs}ms`);
    console.log(`📊 Average score across all: ${result.scoringMetrics.averageScoreAcrossAll.toFixed(2)}`);
    console.log(`🏃 Products with scores: ${result.scoringMetrics.productsWithScores}`);
    console.log(`❌ Products without scores: ${result.scoringMetrics.productsWithoutScores}`);
    
    // Test 2: Score type filtering with sorting
    console.log('\n📊 Test 2: Score type filtering with sorting');
    const sortedFilters = {
      scoreTypes: [ProductScoreType.protein_efficiency, ProductScoreType.post_workout_score],
      sortByScore: {
        scoreType: ProductScoreType.protein_efficiency,
        direction: 'desc'
      }
    };
    
    const sortedResult = await repository.getProductsWithContextualScoring(
      sortedFilters,
      { limit: 5, offset: 0 }
    );
    
    console.log(`✅ Found ${sortedResult.filteredCount} products sorted by protein efficiency`);
    console.log(`📈 Query time: ${sortedResult.queryTimeMs}ms`);
    
    // Show top products with their contextual scores
    sortedResult.products.slice(0, 3).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - Avg: ${product.scoresSummary.averageScore.toFixed(1)} (${product.scoresSummary.scoreCount} scores)`);
      
      // Show available contexts
      if (product.scoresSummary.contextsAvailable.length > 0) {
        console.log(`   Contexts: ${product.scoresSummary.contextsAvailable.join(', ')}`);
      }
      
      // Show top score type
      if (product.scoresSummary.topScoreType) {
        console.log(`   Top score type: ${product.scoresSummary.topScoreType}`);
      }
    });
    
    // Test 3: Score distribution analysis
    console.log('\n📊 Test 3: Score distribution analysis');
    const distributionResult = await repository.getProductsWithContextualScoring(
      {},  // No filters - get all products
      { limit: 100, offset: 0 }
    );
    
    console.log('📊 Score Type Distribution:');
    Object.entries(distributionResult.scoringMetrics.scoreTypeDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([scoreType, count]) => {
        console.log(`   ${scoreType}: ${count} scores`);
      });
    
    console.log('\n📊 Context Distribution:');
    Object.entries(distributionResult.scoringMetrics.contextDistribution)
      .sort(([,a], [,b]) => b - a)
      .forEach(([context, count]) => {
        console.log(`   ${context}: ${count} scores`);
      });
    
    console.log('\n✅ T031 Contextual Scoring tests completed successfully!');
    
  } catch (error) {
    console.error('❌ T031 test failed:', error);
    throw error;
  }
}

// Run the test
testContextualScoring().catch(console.error);