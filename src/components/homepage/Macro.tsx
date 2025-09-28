// Returns color for suger macro based on percent of calories
function getSugerColor(value?: number, caloriesTotal?: number): MacroColor {
  if (value === undefined || !caloriesTotal || caloriesTotal <= 0) return 'text-gray-700';
  const sugarCalories = value * 4;
  const percent = (sugarCalories / caloriesTotal) * 100;
  if (percent > 20) return 'text-red-600';
  if (percent > 10) return 'text-yellow-600';
  return 'text-green-600';
}
// Returns color for calories macro (can be customized)
function getCaloriesColor(value?: number): MacroColor {
  if (value === undefined) return 'text-gray-700';
  if (value < 100) return 'text-green-600'; // very light (e.g. kwark, yogurt)
  if (value < 150) return 'text-blue-600'; // light
  if (value < 200) return 'text-yellow-600'; // moderate
  if (value < 300) return 'text-orange-600'; // high
  return 'text-red-600'; // very high calorie
}
// Returns color for salt macro based on value
function getSaltColor(value?: number): MacroColor {
  if (value === undefined) return 'text-gray-700';
  if (value > 1.5) return 'text-red-600';
  if (value > 0.5) return 'text-yellow-600';
  return 'text-green-600';
}
// Returns color for carbs macro based on percent of calories
function getCarbsColor(percentOfCalories?: number): MacroColor {
  if (percentOfCalories === undefined) return 'text-gray-700';
  if (percentOfCalories > 60) return 'text-red-600';
  if (percentOfCalories > 40) return 'text-yellow-600';
  return 'text-green-600';
}
// Returns color for fat macro based on percent of calories
function getFatColor(percentOfCalories?: number): MacroColor {
  if (percentOfCalories === undefined) return 'text-gray-700';
  if (percentOfCalories > 35) return 'text-red-600';
  if (percentOfCalories > 20) return 'text-yellow-600';
  return 'text-green-600';
}
// Returns color for fiber macro based on value
function getFiberColor(value?: number): MacroColor {
  if (value && value >= 3) {
    return 'text-green-600';
  }
  if (value && value >= 1) {
    return 'text-blue-600';
  }
  return 'text-gray-700';
}
// Returns color for protein macro based on value and percent of calories
function getProteinColor(value?: number, percentOfCalories?: number): MacroColor {
  // If protein is high (e.g., >15g) or high % of calories, use green
  if ((value && value >= 15) || (percentOfCalories && percentOfCalories >= 20)) {
    return 'text-green-600';
  }
  // Moderate protein
  if ((value && value >= 8) || (percentOfCalories && percentOfCalories >= 10)) {
    return 'text-blue-600';
  }
  // Low protein
  return 'text-gray-700';
}

import type React from 'react';

export type MacroLabel = 'Calories' | 'Protein' | 'Carbs' | 'Fat' | 'Fiber' | 'Salt' | 'Suger';
export type MacroUnit = 'cal' | 'g';
export type MacroColor = 'text-orange-600' | 'text-blue-600' | 'text-purple-600' | 'text-red-600' | 'text-green-600' | 'text-gray-700' | 'text-yellow-600';

export interface MacroProps {
  label: MacroLabel;
  value?: number;
  unit: MacroUnit;
  color: MacroColor;
  precision?: number;
  formatValue?: (value?: number) => string;
  loading?: boolean;
  locale?: string;
  placeholder?: string;
  caloriesTotal?: number;
}

export const Macro: React.FC<MacroProps> = ({
  label,
  value,
  unit,
  color,
  precision = 1,
  formatValue,
  loading = false,
  locale = 'en-US',
  placeholder = '-',
  caloriesTotal,
}) => {
  let displayValue: string;
  if (loading) {
    displayValue = '...';
  } else if (typeof formatValue === 'function') {
    displayValue = formatValue(value);
  } else if (value === null || value === undefined || isNaN(value)) {
    displayValue = placeholder;
  } else {
    // Locale-aware formatting
    const isInt = Number.isInteger(value);
    const options: Intl.NumberFormatOptions = isInt
      ? { maximumFractionDigits: 0 }
      : { minimumFractionDigits: precision, maximumFractionDigits: precision };
    displayValue = new Intl.NumberFormat(locale, options).format(value);
  }

  if (displayValue === placeholder) {
    return null;
  }

  // Step 2: Calculate macro's calorie contribution and percentage
  let macroCalories = 0;
  if (label === 'Protein' && value) macroCalories = value * 4;
  else if (label === 'Carbs' && value) macroCalories = value * 4;
  else if (label === 'Fat' && value) macroCalories = value * 9;
  else if (label === 'Fiber' && value) macroCalories = value * 2;
  // Salt and Calories itself do not contribute

  let percentOfCalories: number | undefined = undefined;
  if (caloriesTotal && caloriesTotal > 0 && macroCalories > 0) {
    percentOfCalories = (macroCalories / caloriesTotal) * 100;
  }

  // percentOfCalories is now available for dynamic coloring in next step

  // Step 3: Dynamic color styling based on percentOfCalories
  let dynamicColor = color;
  if (label === 'Protein') {
    dynamicColor = getProteinColor(value, percentOfCalories);
  } else if (label === 'Fiber') {
    dynamicColor = getFiberColor(value);
  } else if (label === 'Fat') {
    dynamicColor = getFatColor(percentOfCalories);
  } else if (label === 'Carbs') {
    dynamicColor = getCarbsColor(percentOfCalories);
  } else if (label === 'Salt') {
    dynamicColor = getSaltColor(value);
  } else if (label === 'Calories') {
    dynamicColor = getCaloriesColor(value);
  } else if (label === 'Suger') {
    dynamicColor = getSugerColor(value, caloriesTotal);
  } else if (percentOfCalories !== undefined) {
    if (percentOfCalories < 10) dynamicColor = 'text-green-600';
    else if (percentOfCalories < 25) dynamicColor = 'text-yellow-600';
    else dynamicColor = 'text-red-600';
  }

  return (
    <div title={`${label} (${unit})`}>
      <div className={`font-bold ${dynamicColor}`}>{displayValue}{unit}</div>
      <div className="text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
};
