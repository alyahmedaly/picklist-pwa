import React from 'react';
import type { Product } from '@picklist/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { X, Package, Euro, Heart, Leaf, Zap, Shield } from 'lucide-react';
import { NutritionCard } from '../nutrition/nutrition-card';
import { HealthGrade } from '../nutrition/health-grade';
import { HalalBadge } from '../nutrition/halal-badge';
import { getImageUrl, getFallbackImageDataUri } from '../../utils/imageUtils';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailsModal({ product, isOpen, onClose }: ProductDetailsModalProps) {
  if (!product) return null;

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return `€${price.toFixed(2)}`;
  };

  const formatList = (items?: string[]) => {
    if (!items || items.length === 0) return 'None';
    return items.join(', ');
  };

  React.useEffect(() => {
    const handleBackdropClick = () => {
      onClose();
    };

    document.addEventListener('close', handleBackdropClick);
    return () => {
      document.removeEventListener('close', handleBackdropClick);
    };
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b p-6 z-10">
          <DialogHeader>
            <DialogTitle className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold leading-tight">{product.name}</h2>
                {product.brand && (
                  <p className="text-base text-muted-foreground mt-2">by {product.brand}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {product.price?.regular && (
                  <Badge variant="secondary" className="text-lg font-semibold px-3 py-1">
                    <Euro className="h-5 w-5 mr-2" />
                    {formatPrice(product.price.regular)}
                  </Badge>
                )}
                <button
                  onClick={onClose}
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-1"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </button>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
            {/* Product Image */}
            {product.images && (
              <div className="aspect-square w-full max-w-sm mx-auto">
                <img
                  src={getImageUrl(product.images.primary)}
                  alt={product.name}
                  className="w-full h-full object-contain rounded-lg border"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    // Multi-stage fallback for GitHub Pages
                    const img = e.target as HTMLImageElement;
                    const currentSrc = img.src;

                    // Try direct URL if we were using proxy
                    if (currentSrc.includes('/api/images') && !import.meta.env.DEV) {
                      console.log('[ProductDetailsModal] Proxy failed, trying direct URL');
                      img.src = product.images?.primary ?? '';
                      return;
                    }

                    // Try fallback data URI
                    if (img.src !== getFallbackImageDataUri()) {
                      console.log('[ProductDetailsModal] Direct URL failed, using fallback');
                      img.src = getFallbackImageDataUri();
                    }
                  }}
                />
              </div>
            )}

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.categories && product.categories.length > 0 && (
                  <div>
                    <p className="font-medium text-base">Categories:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {product.categories.map((category, index) => (
                        <Badge key={index} variant="outline" className="text-sm px-2 py-1">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {product.unit && (
                  <div>
                    <p className="font-medium text-base">Unit Size:</p>
                    <p className="text-base text-muted-foreground mt-1">
                      {typeof product.unit === 'object' ? product.unit.raw : product.unit}
                    </p>
                  </div>
                )}

                {product.id && (
                  <div>
                    <p className="font-medium text-base">Product ID:</p>
                    <p className="text-base text-muted-foreground font-mono mt-1">{product.id}</p>
                  </div>
                )}

                {/* Nutritional Tags */}
                {product.nutritionalTags && (
                  <div>
                    <p className="font-medium text-base">Dietary Tags:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {product.nutritionalTags.vegan && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm px-3 py-1">
                          <Leaf className="h-4 w-4 mr-1" />
                          Vegan
                        </Badge>
                      )}
                      {product.nutritionalTags.vegetarian && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm px-3 py-1">
                          <Leaf className="h-4 w-4 mr-1" />
                          Vegetarian
                        </Badge>
                      )}
                      {product.nutritionalTags.lowCarb && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
                          Low Carb
                        </Badge>
                      )}
                      {product.nutritionalTags.highProtein && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-sm px-3 py-1">
                          High Protein
                        </Badge>
                      )}
                      {product.nutritionalTags.highFiber && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-sm px-3 py-1">
                          High Fiber
                        </Badge>
                      )}
                      {product.nutritionalTags.glutenFree && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1">
                          Gluten Free
                        </Badge>
                      )}
                      {product.nutritionalTags.lactoseFree && (
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1">
                          Lactose Free
                        </Badge>
                      )}
                      {product.nutritionalTags.plantBased && (
                        <Badge variant="secondary" className="bg-teal-100 text-teal-800 text-sm px-3 py-1">
                          Plant Based
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Food Flags */}
                {product.flags && (
                  <div>
                    <p className="font-medium text-base">Product Flags:</p>
                    <div className="text-sm space-y-2 mt-2">
                      {product.flags.addedSugarFlag && (
                        <div className="text-orange-600 flex items-center">
                          <span className="text-lg mr-2">⚠️</span>
                          Contains added sugar
                        </div>
                      )}
                      {product.flags.addedSaltFlag && (
                        <div className="text-orange-600 flex items-center">
                          <span className="text-lg mr-2">⚠️</span>
                          Contains added salt
                        </div>
                      )}
                      {product.flags.artificialSweetenersFlag && (
                        <div className="text-orange-600 flex items-center">
                          <span className="text-lg mr-2">⚠️</span>
                          Contains artificial sweeteners
                        </div>
                      )}
                      {product.flags.isPetFood && (
                        <div className="text-blue-600 flex items-center">
                          <span className="text-lg mr-2">🐕</span>
                          Pet food product
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Health Scores & Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.globalHealthScore && (
                    <div>
                      <p className="font-medium text-sm">Global Health Score</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{product.globalHealthScore}/100</Badge>
                        {product.globalHealthGrade && <HealthGrade grade={product.globalHealthGrade} />}
                      </div>
                    </div>
                  )}

                  {product.nutriScore && (
                    <div>
                      <p className="font-medium text-sm">Nutri-Score</p>
                      <Badge variant="secondary">{product.nutriScore}</Badge>
                    </div>
                  )}
                </div>

                {/* All Health Scores */}
                <div className="border-t pt-3">
                  <p className="font-medium text-sm mb-2">All Health Scores</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {product.nutriScore && (
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="font-medium">Nutri-Score:</span>
                        <div className="text-lg font-bold text-blue-600">{product.nutriScore}</div>
                      </div>
                    )}
                    {product.globalHealthScore && (
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="font-medium">Global Health:</span>
                        <div className="text-lg font-bold text-green-600">{product.globalHealthScore}/100</div>
                      </div>
                    )}
                    {product.categoryHealthScore && (
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="font-medium">Category Health:</span>
                        <div className="text-lg font-bold text-purple-600">{product.categoryHealthScore}/100</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Post-Workout Analysis */}
                {product.postWorkoutOptimization && (
                  <div className="border-t pt-3">
                    <p className="font-medium text-sm mb-2">Post-Workout Analysis</p>
                    <div className="text-xs space-y-1">
                      {product.postWorkoutOptimization.postWorkoutScore && (
                        <div>
                          <span className="font-medium">Post-Workout Score:</span>
                          <span className="ml-1">{product.postWorkoutOptimization.postWorkoutScore}/100</span>
                        </div>
                      )}
                      {product.postWorkoutOptimization.carbProteinRatio && (
                        <div>
                          <span className="font-medium">Carb:Protein Ratio:</span>
                          <span className="ml-1">{product.postWorkoutOptimization.carbProteinRatio}:1</span>
                        </div>
                      )}
                      {product.postWorkoutOptimization.glycemicBoost && (
                        <div>
                          <span className="font-medium">Glycemic Boost:</span>
                          <span className="ml-1">{product.postWorkoutOptimization.glycemicBoost}x</span>
                        </div>
                      )}
                      {product.postWorkoutOptimization.recoveryWindow && (
                        <div>
                          <span className="font-medium">Recovery Window:</span>
                          <span className="ml-1 capitalize">{product.postWorkoutOptimization.recoveryWindow}</span>
                        </div>
                      )}
                      {product.postWorkoutOptimization.confidence && (
                        <div>
                          <span className="font-medium">Confidence:</span>
                          <span className="ml-1 capitalize">{product.postWorkoutOptimization.confidence}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Protein Optimization */}
            {product.proteinOptimization && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Protein Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {product.proteinOptimization.proteinDensityScore && (
                    <div>
                      <p className="font-medium text-sm">Protein Density Score:</p>
                      <div className="text-2xl font-bold text-orange-600">{product.proteinOptimization.proteinDensityScore}/100</div>
                    </div>
                  )}

                  {product.proteinOptimization.proteinContribution && (
                    <div>
                      <p className="font-medium text-sm">Protein Content:</p>
                      <p className="text-sm text-muted-foreground">{product.proteinOptimization.proteinContribution}g per 100g</p>
                    </div>
                  )}

                  {product.proteinOptimization.targetContribution && (
                    <div>
                      <p className="font-medium text-sm">Daily Target Contribution:</p>
                      <p className="text-sm text-green-600">{product.proteinOptimization.targetContribution}% of 170g target</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Fat Loss Analysis */}
            {product.fatLossCompatibility && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Fat Loss Compatibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {product.fatLossCompatibility.fatLossScore && (
                    <div>
                      <p className="font-medium text-sm">Fat Loss Score:</p>
                      <div className="text-2xl font-bold text-red-600">{product.fatLossCompatibility.fatLossScore}/100</div>
                    </div>
                  )}

                  {product.fatLossCompatibility.calorieDensity && (
                    <div>
                      <p className="font-medium text-sm">Calorie Density:</p>
                      <p className="text-sm text-muted-foreground">{product.fatLossCompatibility.calorieDensity} kcal/100g</p>
                    </div>
                  )}

                  {product.fatLossCompatibility.calorieDensityClass && (
                    <div>
                      <p className="font-medium text-sm">Density Class:</p>
                      <Badge variant="outline" className={`text-xs capitalize ${
                        product.fatLossCompatibility.calorieDensityClass === 'low' ? 'bg-green-50 text-green-700' :
                        product.fatLossCompatibility.calorieDensityClass === 'moderate' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {product.fatLossCompatibility.calorieDensityClass}
                      </Badge>
                    </div>
                  )}

                  {product.fatLossCompatibility.satietyEfficiency && (
                    <div>
                      <p className="font-medium text-sm">Satiety Efficiency:</p>
                      <p className="text-sm text-muted-foreground">{product.fatLossCompatibility.satietyEfficiency}</p>
                    </div>
                  )}

                  {product.fatLossCompatibility.volumeAdvantage !== undefined && (
                    <div>
                      <p className="font-medium text-sm">Volume Advantage:</p>
                      <Badge variant={product.fatLossCompatibility.volumeAdvantage ? "default" : "secondary"} className="text-xs">
                        {product.fatLossCompatibility.volumeAdvantage ? "Yes" : "No"}
                      </Badge>
                    </div>
                  )}

                  {product.fatLossCompatibility.confidence && (
                    <div>
                      <p className="font-medium text-sm">Analysis Confidence:</p>
                      <Badge variant="outline" className="text-xs capitalize">
                        {product.fatLossCompatibility.confidence}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Satiety Analysis */}
            {product.satietyAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Satiety Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {product.satietyAnalysis.satietyScore && (
                    <div>
                      <p className="font-medium text-sm">Satiety Score:</p>
                      <div className="text-2xl font-bold text-purple-600">{product.satietyAnalysis.satietyScore}/100</div>
                    </div>
                  )}

                  {product.satietyAnalysis.expectedSatietyDuration && (
                    <div>
                      <p className="font-medium text-sm">Expected Satiety Duration:</p>
                      <p className="text-sm text-muted-foreground">{product.satietyAnalysis.expectedSatietyDuration} min per 100kcal</p>
                    </div>
                  )}

                  {product.satietyAnalysis.caloriePerSatietyRatio && (
                    <div>
                      <p className="font-medium text-sm">Calorie Efficiency:</p>
                      <p className="text-sm text-muted-foreground">{product.satietyAnalysis.caloriePerSatietyRatio} (lower = better)</p>
                    </div>
                  )}

                  {product.satietyAnalysis.satietyFactors && (
                    <div>
                      <p className="font-medium text-sm">Satiety Factors:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                        <div>
                          <span className="font-medium">Protein:</span>
                          <span className="ml-1">{product.satietyAnalysis.satietyFactors.proteinFactor}/100</span>
                        </div>
                        <div>
                          <span className="font-medium">Fiber:</span>
                          <span className="ml-1">{product.satietyAnalysis.satietyFactors.fiberFactor}/100</span>
                        </div>
                        <div>
                          <span className="font-medium">Volume:</span>
                          <span className="ml-1">{product.satietyAnalysis.satietyFactors.volumeFactor}/100</span>
                        </div>
                        <div>
                          <span className="font-medium">Processing:</span>
                          <span className="ml-1">{product.satietyAnalysis.satietyFactors.processingPenalty}/100</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {product.satietyAnalysis.confidence && (
                    <div>
                      <p className="font-medium text-sm">Analysis Confidence:</p>
                      <Badge variant="outline" className="text-xs capitalize">
                        {product.satietyAnalysis.confidence}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
            {/* Nutrition Information */}
            {product.nutrition && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Nutrition Facts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NutritionCard nutrition={product.nutrition} />
                </CardContent>
              </Card>
            )}

            {/* Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ingredients</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed">
                    {formatList(product.ingredients)}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Allergens */}
            {product.allergens && ((product.allergens.contains && product.allergens.contains.length > 0) ||
              (product.allergens.mayContain && product.allergens.mayContain.length > 0)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Allergen Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {product.allergens.contains && product.allergens.contains.length > 0 && (
                    <div>
                      <p className="font-medium text-sm text-red-600">Contains:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.allergens.contains.map((allergen, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.allergens.mayContain && product.allergens.mayContain.length > 0 && (
                    <div>
                      <p className="font-medium text-sm text-orange-600">May contain:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.allergens.mayContain.map((allergen, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {product.warnings && product.warnings.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="font-medium text-sm text-amber-600">Warnings:</p>
                      <ul className="text-xs text-amber-700 mt-1 space-y-1">
                        {product.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Additives */}
            {product.additiveInfo && product.additiveInfo.totalAdditives > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Additives & E-Numbers Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="font-bold text-lg">{product.additiveInfo.totalAdditives}</div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <div className="font-bold text-lg text-green-600">{product.additiveInfo.naturalAdditives?.length || 0}</div>
                      <div className="text-xs text-green-600">Natural</div>
                    </div>
                    <div className="bg-orange-50 p-2 rounded">
                      <div className="font-bold text-lg text-orange-600">{product.additiveInfo.syntheticAdditives?.length || 0}</div>
                      <div className="text-xs text-orange-600">Synthetic</div>
                    </div>
                  </div>

                  {/* E-Numbers */}
                  {product.additiveInfo.eNumbers && product.additiveInfo.eNumbers.length > 0 && (
                    <div>
                      <p className="font-medium text-sm">E-Numbers:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.additiveInfo.eNumbers.map((eNumber, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {eNumber}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Functional Categories */}
                  {product.additiveInfo.functionalCategories && product.additiveInfo.functionalCategories.length > 0 && (
                    <div>
                      <p className="font-medium text-sm">Functions:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.additiveInfo.functionalCategories.map((category, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dutch Categories */}
                  {product.additiveInfo.dutchCategories && product.additiveInfo.dutchCategories.length > 0 && (
                    <div>
                      <p className="font-medium text-sm">Dutch Categories:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.additiveInfo.dutchCategories.map((category, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specific Additive Types */}
                  <div className="space-y-2 text-xs">
                    {product.additiveInfo.preservatives && product.additiveInfo.preservatives.length > 0 && (
                      <div>
                        <span className="font-medium text-red-600">Preservatives:</span>
                        <span className="ml-2">{product.additiveInfo.preservatives.join(', ')}</span>
                      </div>
                    )}
                    {product.additiveInfo.colors && product.additiveInfo.colors.length > 0 && (
                      <div>
                        <span className="font-medium text-purple-600">Colors:</span>
                        <span className="ml-2">{product.additiveInfo.colors.join(', ')}</span>
                      </div>
                    )}
                    {product.additiveInfo.antioxidants && product.additiveInfo.antioxidants.length > 0 && (
                      <div>
                        <span className="font-medium text-green-600">Antioxidants:</span>
                        <span className="ml-2">{product.additiveInfo.antioxidants.join(', ')}</span>
                      </div>
                    )}
                    {product.additiveInfo.stabilizers && product.additiveInfo.stabilizers.length > 0 && (
                      <div>
                        <span className="font-medium text-blue-600">Stabilizers:</span>
                        <span className="ml-2">{product.additiveInfo.stabilizers.join(', ')}</span>
                      </div>
                    )}
                    {product.additiveInfo.sweeteners && product.additiveInfo.sweeteners.length > 0 && (
                      <div>
                        <span className="font-medium text-pink-600">Sweeteners:</span>
                        <span className="ml-2">{product.additiveInfo.sweeteners.join(', ')}</span>
                      </div>
                    )}
                    {product.additiveInfo.flavorEnhancers && product.additiveInfo.flavorEnhancers.length > 0 && (
                      <div>
                        <span className="font-medium text-yellow-600">Flavor Enhancers:</span>
                        <span className="ml-2">{product.additiveInfo.flavorEnhancers.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Natural vs Synthetic Breakdown */}
                  {((product.additiveInfo.naturalAdditives && product.additiveInfo.naturalAdditives.length > 0) ||
                    (product.additiveInfo.syntheticAdditives && product.additiveInfo.syntheticAdditives.length > 0)) && (
                    <div className="border-t pt-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {product.additiveInfo.naturalAdditives && product.additiveInfo.naturalAdditives.length > 0 && (
                          <div>
                            <p className="font-medium text-green-600 mb-1">Natural Additives:</p>
                            <div className="text-green-700 space-y-1">
                              {product.additiveInfo.naturalAdditives.map((additive, index) => (
                                <div key={index}>• {additive}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        {product.additiveInfo.syntheticAdditives && product.additiveInfo.syntheticAdditives.length > 0 && (
                          <div>
                            <p className="font-medium text-orange-600 mb-1">Synthetic Additives:</p>
                            <div className="text-orange-700 space-y-1">
                              {product.additiveInfo.syntheticAdditives.map((additive, index) => (
                                <div key={index}>• {additive}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Halal Check Details */}
            {product.halalCheck && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Halal Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Status:</span>
                    <Badge variant={product.halalCheck.status === 'halal' ? 'default' :
                                   product.halalCheck.status === 'questionable' ? 'secondary' : 'destructive'}>
                      {product.halalCheck.status}
                    </Badge>
                  </div>

                  {product.halalCheck.confidence && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">Confidence:</span>
                      <span className="capitalize">{product.halalCheck.confidence}</span>
                    </div>
                  )}

                  {/* Flags */}
                  {product.halalCheck.flags && (
                    <div>
                      <p className="font-medium text-sm">Checked For:</p>
                      <div className="grid grid-cols-2 gap-1 text-xs mt-1">
                        <div className={product.halalCheck.flags.hasAlcohol ? 'text-red-600' : 'text-green-600'}>
                          • Alcohol: {product.halalCheck.flags.hasAlcohol ? 'Found' : 'None'}
                        </div>
                        <div className={product.halalCheck.flags.hasPork ? 'text-red-600' : 'text-green-600'}>
                          • Pork: {product.halalCheck.flags.hasPork ? 'Found' : 'None'}
                        </div>
                        <div className={product.halalCheck.flags.hasAnimalGelatine ? 'text-red-600' : 'text-green-600'}>
                          • Gelatine: {product.halalCheck.flags.hasAnimalGelatine ? 'Found' : 'None'}
                        </div>
                        <div className={product.halalCheck.flags.hasDoubtfulAdditives ? 'text-orange-600' : 'text-green-600'}>
                          • Additives: {product.halalCheck.flags.hasDoubtfulAdditives ? 'Questionable' : 'OK'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* E-Number Concerns */}
                  {product.halalCheck.details?.eNumberConcerns && product.halalCheck.details.eNumberConcerns.length > 0 && (
                    <div>
                      <p className="font-medium text-sm text-orange-600">E-Number Concerns:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.halalCheck.details.eNumberConcerns.map((eNumber, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-orange-700">
                            {eNumber}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}