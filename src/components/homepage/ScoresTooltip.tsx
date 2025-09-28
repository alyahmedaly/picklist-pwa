import React from 'react';
import { Info } from 'lucide-react';
import type { Product } from '@picklist/types';

interface ScoresTooltipProps {
  product: Product;
}

export const ScoresTooltip: React.FC<ScoresTooltipProps> = ({ product }) => {
  // Collect all available scores
  const scores = [
    { label: 'Global Health Score', value: product.globalHealthScore, unit: '/100', grade: product.globalHealthGrade },
    { label: 'Category Health Score', value: product.categoryHealthScore, unit: '/100', grade: product.categoryHealthGrade },
    { label: 'Nutri-Score', value: product.nutriScore, unit: '', grade: null },
    { label: 'Protein Density', value: product.proteinOptimization?.proteinDensityScore, unit: '/100' },
    { label: 'Satiety Score', value: product.satietyAnalysis?.satietyScore, unit: '/100' },
    { label: 'Post-Workout Score', value: product.postWorkoutOptimization?.postWorkoutScore, unit: '/100' },
    { label: 'Fat Loss Score', value: product.fatLossCompatibility?.fatLossScore, unit: '/100' },
  ].filter(score => score.value !== undefined && score.value !== null);

  // Don't render if no scores available
  if (scores.length === 0) {
    return null;
  }

  return (
    <div className="relative group">
      {/* Info Icon Trigger */}
      <div className="cursor-help p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <Info className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
      </div>

      {/* Tooltip Content */}
      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>

        {/* Scores List */}
        <div className="space-y-1">
          <div className="font-medium text-center mb-2">Health Scores</div>
          {scores.map((score, index) => (
            <div key={index} className="flex justify-between items-center min-w-48">
              <span className="text-left">{score.label}:</span>
              <span className="font-medium">
                {typeof score.value === 'number' ? score.value.toFixed(1) : score.value}
                {score.unit}
                {score.grade && (
                  <span className="ml-1 px-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-xs">
                    {score.grade}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoresTooltip;