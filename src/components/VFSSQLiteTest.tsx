/**
 * Flexible Schema SQLite Test Component
 *
 * Test component for the flexible schema database with multi-dimensional filtering,
 * Ali-specific filter profiles, and advanced search capabilities.
 */

import { useState } from 'react';
import {
  useFlexibleProducts,
  useAliFilterProfile,
  useFlexibleProductSearch,
  useFlexibleSchemaAvailability
} from '../hooks/useFlexibleProductQueries';
import type { FlexibleProductComplete } from '../types/flexible-schema';

export function VFSSQLiteTest() {
  // Flexible schema availability check
  const { isAvailable, isLoading: schemaLoading, error: schemaError } = useFlexibleSchemaAvailability();

  // Ali filter profiles for common use cases
  const dailyProteinQuery = useAliFilterProfile('daily-protein', {}, { enabled: false });
  const cuttingQuery = useAliFilterProfile('cutting', {}, { enabled: false });
  const postWorkoutQuery = useAliFilterProfile('post-workout', {}, { enabled: false });
  const budgetQuery = useAliFilterProfile('budget', {}, { enabled: false });
  const trainingDayQuery = useAliFilterProfile('training-day', {}, { enabled: false });
  const restDayQuery = useAliFilterProfile('rest-day', {}, { enabled: false });

  // General flexible products query
  const allProductsQuery = useFlexibleProducts({}, { enabled: false });

  // Search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const searchQuery = useFlexibleProductSearch(searchTerm, { enabled: false });

  // Component state
  const [products, setProducts] = useState<FlexibleProductComplete[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [queryMetadata, setQueryMetadata] = useState<{
    searchPerformed: boolean;
    categoryHierarchyUsed: boolean;
    multiDimensionalFiltering: boolean;
    scoringContext?: string;
    schemaType?: string;
  } | null>(null);

  if (schemaLoading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Flexible Schema SQLite Test</h2>
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span>Checking flexible schema database availability...</span>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Detecting normalized 8-table schema with multi-dimensional filtering
        </div>
      </div>
    );
  }

  if (schemaError || !isAvailable) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Flexible Schema SQLite Test</h2>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-600 font-medium">Flexible Schema Not Available:</p>
          <p className="text-red-500 text-sm mt-1">{schemaError || 'Flexible schema tables not found'}</p>
          <div className="mt-3 text-sm text-gray-600">
            <p>Possible issues:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Flexible schema database not generated (run with --generate-flexible-schema)</li>
              <li>Browser doesn't support OPFS (Chrome 102+ required)</li>
              <li>Database file not accessible at /products-flexible.db</li>
              <li>Missing required tables: products, categories, product_categories, etc.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const handleTestQuery = async (testType: string) => {
    setActiveFilter(testType);

    try {
      switch (testType) {
        case 'daily-protein':
          await dailyProteinQuery.refetch();
          break;
        case 'cutting':
          await cuttingQuery.refetch();
          break;
        case 'post-workout':
          await postWorkoutQuery.refetch();
          break;
        case 'budget':
          await budgetQuery.refetch();
          break;
        case 'training-day':
          await trainingDayQuery.refetch();
          break;
        case 'rest-day':
          await restDayQuery.refetch();
          break;
        case 'all':
          await allProductsQuery.refetch();
          break;
        case 'search':
          setSearchTerm('yoghurt'); // Dutch spelling
          await searchQuery.refetch();
          break;
      }

      // Update products and metadata from the active query
      const activeQuery = getActiveQuery(testType);
      if (activeQuery?.data) {
        setProducts(activeQuery.data);
        setQueryMetadata({
          ...activeQuery.metadata,
          schemaType: 'flexible'
        });
      }

    } catch (err) {
      console.error('Flexible schema query failed:', err);
    }
  };

  const getActiveQuery = (testType: string) => {
    switch (testType) {
      case 'daily-protein': return dailyProteinQuery;
      case 'cutting': return cuttingQuery;
      case 'post-workout': return postWorkoutQuery;
      case 'budget': return budgetQuery;
      case 'training-day': return trainingDayQuery;
      case 'rest-day': return restDayQuery;
      case 'all': return allProductsQuery;
      case 'search': return searchQuery;
      default: return null;
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Flexible Schema SQLite Test</h2>

      <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
        <p className="text-green-600 font-medium">✅ Flexible Schema Database Ready!</p>
        <p className="text-green-500 text-sm mt-1">
          Using normalized 8-table schema with multi-dimensional filtering
        </p>
        {activeFilter && (
          <p className="text-green-600 text-sm mt-2">
            Active Filter: <span className="font-medium">{activeFilter}</span>
            {queryMetadata && (
              <span className="ml-2">
                ({queryMetadata.multiDimensionalFiltering ? 'Multi-dimensional' : 'Simple'} query)
              </span>
            )}
          </p>
        )}
      </div>

      {/* Ali Filter Profile Buttons */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Ali Filter Profiles</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleTestQuery('daily-protein')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
            disabled={dailyProteinQuery.isLoading}
          >
            {dailyProteinQuery.isLoading ? '...' : 'Daily Protein'}
          </button>
          <button
            onClick={() => handleTestQuery('cutting')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
            disabled={cuttingQuery.isLoading}
          >
            {cuttingQuery.isLoading ? '...' : 'Cutting Phase'}
          </button>
          <button
            onClick={() => handleTestQuery('post-workout')}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm"
            disabled={postWorkoutQuery.isLoading}
          >
            {postWorkoutQuery.isLoading ? '...' : 'Post-Workout'}
          </button>
          <button
            onClick={() => handleTestQuery('budget')}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 text-sm"
            disabled={budgetQuery.isLoading}
          >
            {budgetQuery.isLoading ? '...' : 'Budget Protein'}
          </button>
          <button
            onClick={() => handleTestQuery('training-day')}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
            disabled={trainingDayQuery.isLoading}
          >
            {trainingDayQuery.isLoading ? '...' : 'Training Day'}
          </button>
          <button
            onClick={() => handleTestQuery('rest-day')}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 text-sm"
            disabled={restDayQuery.isLoading}
          >
            {restDayQuery.isLoading ? '...' : 'Rest Day'}
          </button>
        </div>
      </div>

      {/* General Query Buttons */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">General Queries</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleTestQuery('search')}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm"
            disabled={searchQuery.isLoading}
          >
            {searchQuery.isLoading ? '...' : 'Search "yoghurt"'}
          </button>
          <button
            onClick={() => handleTestQuery('all')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
            disabled={allProductsQuery.isLoading}
          >
            {allProductsQuery.isLoading ? '...' : 'All Products'}
          </button>
        </div>
      </div>

      {/* Query Results */}
      {activeFilter && (
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h4 className="font-medium text-blue-800 mb-2">Query Performance & Metadata</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Filter:</span>
                <div className="text-blue-800">{activeFilter}</div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Query Time:</span>
                <div className="text-blue-800">{getActiveQuery(activeFilter)?.queryTimeMs || 0}ms</div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Results:</span>
                <div className="text-blue-800">{products.length} products</div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Schema:</span>
                <div className="text-blue-800">{queryMetadata?.schemaType || 'flexible'}</div>
              </div>
            </div>
            {queryMetadata && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${queryMetadata.searchPerformed ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  <span className="text-blue-700">Search Performed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${queryMetadata.categoryHierarchyUsed ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  <span className="text-blue-700">Category Hierarchy</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${queryMetadata.multiDimensionalFiltering ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  <span className="text-blue-700">Multi-Dimensional</span>
                </div>
                {queryMetadata.scoringContext && (
                  <div className="col-span-2 md:col-span-3">
                    <span className="text-blue-600 font-medium">Scoring Context:</span>
                    <span className="text-blue-800 ml-2">{queryMetadata.scoringContext}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Results */}
      {products.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Products ({products.length})</h3>
          <div className="bg-gray-50 rounded p-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {products.slice(0, 20).map((product) => (
                <div key={product.id} className="bg-white p-3 rounded border">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-600">
                    {product.proteinPer100g && `${product.proteinPer100g}g protein`}
                    {product.caloriesPer100g && ` • ${product.caloriesPer100g} kcal`}
                    {product.displayPrice && ` • €${product.displayPrice.toFixed(2)}`}
                    {product.isOnSale && ' • On Sale'}
                    {product.isHalal !== undefined && ` • ${product.isHalal ? 'Halal' : 'Not Halal'}`}
                  </div>
                  {product.categories && product.categories.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Categories: {product.categories.slice(0, 3).map(c => c.name).join(', ')}
                    </div>
                  )}
                  {product.healthGrade && (
                    <div className="text-xs mt-1">
                      <span className={`inline-block px-2 py-1 rounded text-white text-xs font-medium ${
                        product.healthGrade === 'A' ? 'bg-green-500' :
                        product.healthGrade === 'B' ? 'bg-lime-500' :
                        product.healthGrade === 'C' ? 'bg-yellow-500' :
                        product.healthGrade === 'D' ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}>
                        Grade {product.healthGrade}
                      </span>
                      {product.relevanceScore && (
                        <span className="ml-2 text-gray-500">
                          Relevance: {product.relevanceScore.toFixed(1)}
                        </span>
                      )}
                    </div>
                  )}
                  {product.matchedTerms && product.matchedTerms.length > 0 && (
                    <div className="text-xs text-purple-600 mt-1">
                      Matched: {product.matchedTerms.slice(0, 3).join(', ')}
                    </div>
                  )}
                </div>
              ))}
              {products.length > 20 && (
                <div className="text-sm text-gray-500 text-center py-2">
                  ... and {products.length - 20} more products
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded text-xs">
        <h4 className="font-medium mb-2">Flexible Schema Debug Info:</h4>
        <div className="grid grid-cols-2 gap-4 text-gray-600">
          <div>
            <div>Products loaded: {products.length}</div>
            <div>Active filter: {activeFilter || 'none'}</div>
            <div>Schema available: {isAvailable ? 'yes' : 'no'}</div>
          </div>
          <div>
            <div>Query time: {getActiveQuery(activeFilter)?.queryTimeMs || 0}ms</div>
            <div>Multi-dimensional: {queryMetadata?.multiDimensionalFiltering ? 'yes' : 'no'}</div>
            <div>Search performed: {queryMetadata?.searchPerformed ? 'yes' : 'no'}</div>
          </div>
        </div>
        {queryMetadata?.scoringContext && (
          <div className="mt-2 text-gray-600">
            Scoring context: {queryMetadata.scoringContext}
          </div>
        )}
      </div>
    </div>
  );
}