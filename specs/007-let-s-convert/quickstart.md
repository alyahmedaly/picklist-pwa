# Quickstart: UI-Optimized JSON Output Format

## Overview
This guide demonstrates how to use the new UI-optimized JSON output format for product data transformation.

## Prerequisites
- Node.js 18+
- Existing transform CLI tool
- Sample CSV data file

## Basic Usage

### 1. Transform with UI Format
```bash
# Basic UI format transformation
node src/scripts/transform-data.ts --input data/sample.csv --outDir output --format ui

# Compare with standard format
node src/scripts/transform-data.ts --input data/sample.csv --outDir output-standard
```

### 2. Verify Output Structure
The UI-optimized format produces:
- `products-ui.jsonl` - UI-optimized product data
- `products-ui-index.json` - Searchable UI index
- `stats.json` - Processing statistics
- `schema-ui.md` - UI format documentation

### 3. Example Transformation

**Input Product (standard format)**:
```json
{
  "id": "73",
  "name": "AH Franse baguettes",
  "categories": ["Bakkerij", "Afbakbrood", "Stokbrood en ciabatta"],
  "ingredients": [
    "tarwebloem", "water", "gist",
    "antioxidant (ascorbinezuur [E300])",
    "Waarvan toegevoegde suikers 0.00g per 100g"
  ],
  "price": { "regular": 0.75, "currency": "USD" },
  "nutrition": { "kcal": 241, "fat": 1, "carbs": 50 }
}
```

**Output Product (UI format)**:
```json
{
  "id": "73",
  "name": "AH Franse baguettes",
  "warnings": [],

  "categories": {
    "tree": ["Bakkerij", "Afbakbrood", "Stokbrood en ciabatta"],
    "primary": "Bakkerij",
    "breadcrumbs": "Bakkerij > Afbakbrood > Stokbrood en ciabatta",
    "depth": 3
  },

  "ingredients": {
    "core": ["tarwebloem", "water", "gist"],
    "additives": ["antioxidant (ascorbinezuur [E300])"],
    "nutritionalStatement": "Waarvan toegevoegde suikers 0.00g per 100g",
    "total": 4
  },

  "additives": {
    "eNumbers": ["E300"],
    "summary": "1 additive (natural antioxidant)",
    "warnings": [],
    "dietary": {
      "vegan": true,
      "vegetarian": true,
      "organic": true,
      "natural": true
    },
    "categories": ["Antioxidant"]
  },

  "nutrition": {
    "kcal": 241,
    "kJ": 1009,
    "fat": 1,
    "carbs": 50,
    "protein": 7.2,
    "unit": "per 100g"
  },

  "price": {
    "regular": 0.75,
    "currency": "EUR"
  }
}
```

## Advanced Usage

### 1. Custom Currency Configuration
```bash
# Override default EUR currency
node src/scripts/transform-data.ts \
  --input data/sample.csv \
  --outDir output \
  --format ui \
  --currency USD
```

### 2. Locale-Specific Formatting
```bash
# Use specific locale for number formatting
node src/scripts/transform-data.ts \
  --input data/sample.csv \
  --outDir output \
  --format ui \
  --locale en-US
```

### 3. Batch Processing
```bash
# Process multiple files
for file in data/*.csv; do
  node src/scripts/transform-data.ts \
    --input "$file" \
    --outDir "output/$(basename "$file" .csv)" \
    --format ui
done
```

## Frontend Integration Examples

### 1. React Component Usage
```jsx
function ProductCard({ product }) {
  // Simple price formatting (frontend responsibility)
  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat(navigator.language, {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  return (
    <div className="product-card">
      <h3>{product.name}</h3>

      <div className="categories">
        <span>{product.categories.breadcrumbs}</span>
      </div>

      <div className="nutrition">
        <span>Energy: {product.nutrition.kcal} kcal</span>
        <span>Protein: {product.nutrition.protein}g</span>
        <small>{product.nutrition.unit}</small>
      </div>

      <div className="price">
        <span>{formatPrice(product.price.regular, product.price.currency)}</span>
      </div>

      {product.warnings.length > 0 && (
        <div className="warnings">
          {product.warnings.map(warning => (
            <span key={warning} className="warning">{warning}</span>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 2. Search and Filtering
```javascript
// Filter by category
const bakeryProducts = products.filter(p => p.categories.primary === 'Bakkerij');

// Filter by dietary requirements
const veganFriendly = products.filter(p => p.additives.dietary.vegan);

// Price range filtering
const affordableProducts = products.filter(p => p.price.regular < 5.00);

// Search by name and ingredients
const searchProducts = (query) => {
  const lowerQuery = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.ingredients.core.some(ing => ing.toLowerCase().includes(lowerQuery))
  );
};
```

### 3. Ingredient Display
```jsx
function IngredientsList({ ingredients }) {
  return (
    <div className="ingredients">
      <div className="core-ingredients">
        <h4>Ingredients:</h4>
        <ul>
          {ingredients.core.map(ingredient => (
            <li key={ingredient}>{ingredient}</li>
          ))}
        </ul>
      </div>

      {ingredients.additives.length > 0 && (
        <div className="additives">
          <h4>Additives:</h4>
          <ul>
            {ingredients.additives.map(additive => (
              <li key={additive}>{additive}</li>
            ))}
          </ul>
        </div>
      )}

      {ingredients.nutritionalStatement && (
        <div className="nutritional-info">
          <small>{ingredients.nutritionalStatement}</small>
        </div>
      )}
    </div>
  );
}
```

## Testing Your Implementation

### 1. Validate Output Format
```bash
# Run format validation
npm test -- --grep "UI format"

# Validate specific transformations
npm test -- --grep "category tree transformation"
npm test -- --grep "ingredient separation"
npm test -- --grep "additive simplification"
```

### 2. Integration Testing
```bash
# Test end-to-end transformation
npm run test:integration -- ui-format

# Verify deterministic output
npm run test:deterministic -- ui-format
```

## Common Issues and Solutions

### Issue: Categories appear empty
**Cause**: Original categories array contains only "NA" values
**Solution**: Filter out placeholder values in category processing

### Issue: Nutrition values missing units
**Cause**: Original nutrition data is null or malformed
**Solution**: UI formatter handles missing data gracefully, provides default structure

### Issue: Currency still shows USD
**Cause**: Currency override not configured correctly
**Solution**: Set default currency in configuration or use --currency flag

## Migration from Standard Format

### 1. Update Frontend Code
Replace direct property access with structured access:
```javascript
// Before (standard format)
const energy = product.nutrition.kcal;
const category = product.categories[0];

// After (UI format)
const energy = product.nutrition.kcal;  // Same but with unit context
const category = product.categories.primary;
const unitInfo = product.nutrition.unit; // "per 100g"
```

### 2. Update Search Logic
```javascript
// Before
const searchableText = [
  product.name,
  ...product.categories,
  ...product.ingredients
].join(' ');

// After
const searchableText = [
  product.name,
  product.categories.breadcrumbs,
  ...product.ingredients.core
].join(' ');
```

## Next Steps
1. Integrate UI format into your frontend application
2. Set up automated testing for format consistency
3. Configure production deployment with UI format option
4. Monitor performance and optimize as needed

For detailed API documentation, see [contracts/ui-formatter.json](./contracts/ui-formatter.json).