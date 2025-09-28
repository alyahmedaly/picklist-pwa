# Quickstart: CSV Parser Package

## Quick Validation

After extraction is complete, run this quickstart to verify the parser package works correctly.

### Prerequisites
- NPM workspaces configured with @picklist/parser package
- Dependencies installed: `npm install`
- Package built: `npm run build --workspace=@picklist/parser`

### Basic Usage Test

```bash
# 1. Verify package imports work
node -e "
import('@picklist/parser').then(parser => {
  console.log('✅ Parser package imports successfully');
  console.log('Available functions:', Object.keys(parser));
}).catch(error => {
  console.error('❌ Import failed:', error.message);
})"

# 2. Run contract tests to verify API compliance
npm test -- tests/contract/parser-api.contract.test.ts

# 3. Test integration with existing transform pipeline
node src/scripts/transform-data.ts --input tests/fixtures/sample-small.csv --outDir out-test
```

### Validation Scenarios

#### Scenario 1: Basic CSV Parsing
```typescript
import { readCSV, createRows, convertTypes } from '@picklist/parser';

const csvText = `ProductId,ProductName,Category1
123,Test Product,Dairy
456,Another Product,Bakery`;

// Test basic parsing
const parsed = readCSV(csvText);
console.log('Headers:', parsed.headers);
console.log('Row count:', parsed.rowCount);

// Test row creation
const rows = createRows(parsed.headers, parsed.matrix);
console.log('First row:', rows[0]);

// Test conversion for sparsity analysis
const { records } = convertTypes(rows);
console.log('Records for sparsity:', records);
```

**Expected Output**:
```
Headers: ['ProductId', 'ProductName', 'Category1']
Row count: 2
First row: { ProductId: '123', ProductName: 'Test Product', Category1: 'Dairy' }
Records for sparsity: [
  { ProductId: '123', ProductName: 'Test Product', Category1: 'Dairy' },
  { ProductId: '456', ProductName: 'Another Product', Category1: 'Bakery' }
]
```

#### Scenario 2: Integration with @picklist/core
```typescript
import { readCSV, createRows, convertTypes } from '@picklist/parser';
import { calculateSparsity } from '@picklist/core';

const csvText = `ProductId,ProductName,Empty1,Empty2,Category1
123,Test Product,,,Dairy
456,Another Product,,,Bakery`;

const parsed = readCSV(csvText);
const rows = createRows(parsed.headers, parsed.matrix);
const { records } = convertTypes(rows);

// This should work seamlessly
const sparsity = calculateSparsity(records);
console.log('Empty columns detected:', sparsity.emptyColumns);
```

**Expected Output**:
```
Empty columns detected: ['Empty1', 'Empty2']
```

#### Scenario 3: Error Handling Validation
```typescript
import { readCSV } from '@picklist/parser';

// Test error cases
try {
  readCSV(''); // Should throw
} catch (error) {
  console.log('✅ Empty CSV error handled:', error.message);
}

try {
  readCSV('header1,header2\nvalue1'); // Malformed - missing value
} catch (error) {
  console.log('✅ Malformed CSV error handled:', error.message);
}
```

#### Scenario 4: Transform Pipeline Integration
```bash
# Before extraction - this should work with inline parsing
node src/scripts/transform-data.ts --input tests/fixtures/sample-small.csv --outDir baseline-output

# After extraction - this should produce identical results
node src/scripts/transform-data.ts --input tests/fixtures/sample-small.csv --outDir parser-output

# Compare outputs for identity
diff -r baseline-output parser-output || echo "✅ Outputs are identical"
```

### Performance Validation

```bash
# Test performance parity
time node src/scripts/transform-data.ts --input tests/fixtures/sample-small.csv --outDir performance-test
```

**Success Criteria**:
- Transform completes in reasonable time (similar to baseline)
- Memory usage remains comparable
- No performance regressions detected

### Integration Test Scenarios

#### Package Installation
```bash
# Verify package can be installed in new project
mkdir test-parser-integration
cd test-parser-integration
npm init -y
npm install file:../packages/parser
node -e "console.log(require('@picklist/parser'))"
```

#### Dependency Isolation
```typescript
// Verify @std/csv is properly encapsulated
import parser from '@picklist/parser';

// @std/csv should not be exposed
try {
  // @ts-expect-error - should not be accessible
  parser.parse; // Should be undefined
  console.log('❌ CSV library leaked from package');
} catch {
  console.log('✅ CSV library properly encapsulated');
}
```

#### Version Validation
```bash
# Verify package starts at 1.0.0
cat packages/parser/package.json | grep version
# Expected: "version": "1.0.0"
```

### Troubleshooting

#### Import Errors
If imports fail, check:
1. Package is built: `npm run build --workspace=@picklist/parser`
2. TypeScript project references are configured
3. NPM workspace structure is correct

#### Type Errors
If TypeScript complains:
1. Verify contract interfaces match implementation
2. Check tsconfig.json project references
3. Ensure all exports are properly typed

#### Performance Issues
If transform is slower:
1. Check for memory leaks in parser functions
2. Verify in-memory processing is maintained
3. Profile difference with baseline implementation

### Success Checklist

After running quickstart:

- [ ] ✅ Package imports successfully
- [ ] ✅ All contract tests pass
- [ ] ✅ Basic parsing works correctly
- [ ] ✅ Integration with @picklist/core works
- [ ] ✅ Error handling works as expected
- [ ] ✅ Transform pipeline produces identical output
- [ ] ✅ Performance remains comparable
- [ ] ✅ Package version is 1.0.0
- [ ] ✅ Dependencies are properly encapsulated

If all items are checked, the CSV parser package extraction is successful!

## Next Steps

After quickstart validation:

1. **Update Documentation**: Verify README.md has usage examples
2. **Add More Tests**: Consider edge cases specific to your use case
3. **Performance Optimization**: Profile and optimize if needed
4. **Version Management**: Plan for semantic versioning strategy
5. **Integration**: Use parser in other applications as needed

## Support

If quickstart fails:
1. Check package build process
2. Verify contract tests for specific failures
3. Compare with baseline transform-data.ts behavior
4. Review error messages for debugging hints