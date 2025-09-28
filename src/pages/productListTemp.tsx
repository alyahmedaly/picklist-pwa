import { useState, useMemo, useEffect, useRef } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { useProductQueries, type ProductQueryFilters } from '../hooks/useProductQueries';
import type { Product, Nutrition } from '../types/product';

// Fallback sample (tiny) so page still renders instantly before streaming completes
const SAMPLE_FALLBACK: Product[] = [
  {
    id: "sample-1",
    name: "Loading placeholder",
    categories: ["Loading"],
    price: { regular: 0, currency: "EUR" },
    nutrition: { unit: "per 100g", kcal: 0, fat: 0, carbs: 0, sugars: 0, protein: 0, fiber: 0, salt: 0 },
    allergens: { contains: [], mayContain: [] },
    ingredients: ["Sample ingredient 1", "Sample ingredient 2"],
    warnings: ["This is a sample warning"],
    unit: { raw: "per 100g", amount: 100, amountUnit: "g" },
    halalCheck: { status: "unknown", confidence: "low" },
  },
];

function formatPrice(p?: { regular: number; currency: string }) {
  if (!p) return "-";
  return `${p.currency} ${p.regular.toFixed(2)}`;
}

function NutriBar({ score }: { score?: number }) {
  // simple colored bar for nutri score-like visualization
  const pct = Math.max(0, Math.min(100, (100 - (score || 0))));
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className="h-2 rounded-full"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg,#34d399,#60a5fa)` }}
        title={`Nutri composite ${score}`}
      />
    </div>
  );
}

function NutritionChart({ nutrition }: { nutrition: Nutrition }) {
  const data = [
    { name: "kcal", value: nutrition.kcal },
    { name: "fat", value: nutrition.fat },
    { name: "carbs", value: nutrition.carbs },
    { name: "sugars", value: nutrition.sugars },
    { name: "protein", value: nutrition.protein },
    { name: "fiber", value: nutrition.fiber || 0 },
    { name: "salt", value: nutrition.salt },
  ];

  return (
    <div style={{ width: "100%", height: 140 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: 6, right: 6 }}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value">
            {data.map((_, idx) => (
              <Cell key={`c-${idx}`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ProductListVisualizer() {
  // UI state for filters
  const [filters, setFilters] = useState<ProductQueryFilters>({
    query: "",
    category: "All",
    sort: "name",
    filterHalal: 'any',
    onlyVegan: false,
  });
  const [maxAdditives, setMaxAdditives] = useState<number | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);

  // Debug logging
  useEffect(() => {
    if (selected) {
      console.log('Selected product details:', {
        name: selected.name,
        categories: selected.categories,
        price: selected.price,
        unit: selected.unit,
        ingredients: selected.ingredients,
        warnings: selected.warnings,
        nutrition: selected.nutrition,
        halalCheck: selected.halalCheck,
        allKeys: Object.keys(selected)
      });
    }
  }, [selected]);

  // Data fetching hook
  const {
    products: productsFromHook,
    categories: categoryStats,
    isLoading,
    error: hasError,
    queryTime: queryTimeMs,
    runQuery,
  } = useProductQueries();

  const products = productsFromHook.length > 0 ? productsFromHook : SAMPLE_FALLBACK;

  // Debug product loading
  useEffect(() => {
    console.log('Products status:', {
      productsFromHook: productsFromHook.length,
      usingFallback: productsFromHook.length === 0,
      isLoading,
      hasError,
      products: products.length
    });
  }, [productsFromHook, isLoading, hasError, products]);

  // Run query whenever filters change
  useEffect(() => {
    const handle = setTimeout(() => {
      runQuery(filters);
    }, filters.query ? 250 : 80); // Debounce
    return () => clearTimeout(handle);
  }, [filters, runQuery]);


  // Derived data for UI
  const categories = useMemo(() => {
    return ["All", ...categoryStats.map(c => c.category).sort()];
  }, [categoryStats]);

  const filtered = useMemo(() => {
    let res = products;
    if (maxAdditives != null) {
      res = res.filter(p => (p.additiveInfo?.totalAdditives ?? 0) <= maxAdditives);
    }

    res = [...res];
    try {
      if (filters.sort === "price") res.sort((a, b) => (a.price?.regular || 0) - (b.price?.regular || 0));
      else if (filters.sort === "kcal") res.sort((a, b) => (a.nutrition?.kcal || 0) - (b.nutrition?.kcal || 0));
      else if (filters.sort === "name") res.sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) {
      console.warn('sort error', e);
    }
    return res;
  }, [products, filters.sort, maxAdditives]);

  // Virtualizer
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const enableVirtual = filtered.length >= 800;
  const virtualizer = useVirtualizer({
    count: enableVirtual ? filtered.length : 0,
    getScrollElement: () => listContainerRef.current,
    estimateSize: () => 260,
    overscan: 12,
    measureElement:
      typeof window !== 'undefined' && 'ResizeObserver' in window
        ? (el) => el.getBoundingClientRect().height
        : undefined,
  });
  const virtualItems = enableVirtual ? virtualizer.getVirtualItems() : [];

  // Auto-select first product for testing (shorter delay)
  useEffect(() => {
    if (filtered.length > 0 && !selected) {
      setTimeout(() => {
        console.log('Auto-selecting first product for testing:', filtered[0]);
        setSelected(filtered[0]);
      }, 1000); // Wait 1 second then auto-select
    }
  }, [filtered, selected]);
  const totalHeight = enableVirtual ? virtualizer.getTotalSize() : 0;
  const paddingTop = enableVirtual && virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = enableVirtual && virtualItems.length > 0 ? totalHeight - virtualItems[virtualItems.length - 1].end : 0;

  const retry = () => {
    runQuery(filters);
  };

  const handleFilterChange = <K extends keyof ProductQueryFilters>(key: K, value: ProductQueryFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };


  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <header className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Product list visualizer</h1>
            <div className="text-xs text-gray-500 mt-1">
              {isLoading && <span>Querying SQLite…</span>}
              {!isLoading && !hasError && <span>Loaded {products.length.toLocaleString()} items {queryTimeMs != null && `(in ${queryTimeMs}ms)`}</span>}
              {hasError && <span className="text-red-600">Error: {hasError}</span>}
              {!isLoading && !hasError && products.length === 0 && <span>Initializing database…</span>}
            </div>
          </div>
          
          {/* Debug Info */}
          <div className="p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
            <div><strong>DEBUG:</strong></div>
            <div>Hook Products: {productsFromHook.length}</div>
            <div>Fallback: {productsFromHook.length === 0 ? 'YES' : 'NO'}</div>
            <div>Loading: {isLoading ? 'YES' : 'NO'}</div>
            <div>Error: {hasError || 'None'}</div>
            <div>Filtered: {filtered.length}</div>
            <div>Selected: {selected ? selected.name : 'None'}</div>
          </div>
          <div className="flex gap-2 items-center text-sm">
            <button onClick={retry} disabled={isLoading} className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50">
              {isLoading ? 'Loading…' : 'Reload'}
            </button>
          </div>
        </header>

        {isLoading && (
          <div className="mb-6">
            <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-400 to-green-400 animate-pulse" style={{ width: '60%' }} />
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              Running query…
            </div>
          </div>
        )}

        <section className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="col-span-1 md:col-span-2 p-3 rounded-lg border border-gray-200 shadow-sm"
            placeholder="Search name or category..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
          />
          <div className="flex gap-2 items-center">
            {/* existing selects */}
            <select
              className="p-2 rounded border"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              className="p-2 rounded border"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="name">Sort: Name</option>
              <option value="price">Sort: Price</option>
              <option value="kcal">Sort: Calories</option>
            </select>
          </div>
        </section>
        {/* New advanced filters */}
        <section className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Halal status</label>
            <select
              className="p-2 rounded border"
              value={filters.filterHalal}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const v = e.target.value as 'any'|'halal'|'non-haram'|'haramExcluded';
                handleFilterChange('filterHalal', v);
              }}
            >
              <option value="any">Any</option>
              <option value="halal">Halal only</option>
              <option value="haramExcluded">Exclude haram</option>
              <option value="non-haram">Halal or Unknown</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                className="rounded"
                checked={filters.onlyVegan}
                onChange={(e) => handleFilterChange('onlyVegan', e.target.checked)}
              />
              <span className="text-gray-700">Vegan only</span>
            </label>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Max additives</label>
            <input
              type="number"
              min={0}
              className="p-2 rounded border"
              placeholder="e.g. 2"
              value={maxAdditives ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                setMaxAdditives(v === '' ? null : Math.max(0, Number(v)));
              }}
            />
          </div>
          <div className="flex flex-col justify-end">
            <button
              className="text-xs text-blue-600 underline self-start"
              onClick={() => { 
                setFilters(prev => ({...prev, filterHalal: 'any', onlyVegan: false}));
                setMaxAdditives(null); 
              }}
            >
              Reset filters
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="md:col-span-2 relative"
            ref={listContainerRef}
            style={{ maxHeight: enableVirtual ? 'calc(100vh - 260px)' : undefined, overflowY: enableVirtual ? 'auto' : undefined }}
          >
            {enableVirtual ? (
              <div style={{ height: totalHeight, position: 'relative' }}>
                {paddingTop > 0 && <div style={{ height: paddingTop }} />}
                {virtualItems.map(vItem => {
                  const p = filtered[vItem.index];
                  if (!p) return null;
                  return (
                    <div
                      key={p.id}
                      ref={virtualizer.measureElement}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${vItem.start}px)` }}
                      className="p-4 bg-white rounded-2xl shadow-sm flex items-start gap-4 border border-gray-100"
                    >
                      <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-700">
                        {p.name.split(' ').slice(0,2).map(w => w[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className="text-lg font-semibold">{p.name}</h2>
                            <div className="text-sm text-gray-500">{p.categories?.join(' • ')}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-medium">{formatPrice(p.price)}</div>
                            <div className="text-xs text-gray-400">{p.unit?.raw}</div>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 items-center">
                          <div className="col-span-1">
                            {p.nutrition && (
                              <>
                                <div className="text-xs text-gray-500 mb-1">Nutrition ({p.nutrition.unit})</div>
                                <NutritionChart nutrition={p.nutrition} />
                              </>
                            )}
                          </div>
                          <div className="col-span-1 flex flex-col gap-2">
                            <div className="text-xs text-gray-500">Allergens</div>
                            <div className="flex gap-2 flex-wrap">
                              {p.allergens?.contains?.length === 0 ? (
                                <span className="text-xs px-2 py-1 bg-green-50 rounded">No declared allergens</span>
                              ) : (
                                p.allergens?.contains?.map((a: string) => (
                                  <span key={a} className="text-xs px-2 py-1 bg-red-50 rounded border text-red-700">{a}</span>
                                ))
                              )}
                              {p.allergens?.mayContain?.map((a: string) => (
                                <span key={a} className="text-xs px-2 py-1 bg-yellow-50 rounded border text-yellow-800">may contain: {a}</span>
                              ))}
                            </div>
                            <div className="mt-auto">
                              <div className="text-xs text-gray-500">Nutri composite</div>
                              <NutriBar score={p.nutriScore} />
                              <div className="text-xs text-gray-400 mt-1">Grade: {p.globalHealthGrade}</div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button className="px-3 py-1 rounded-lg bg-red-500 text-white text-sm border" onClick={() => {
                            console.log('Details clicked for product:', p);
                            // Test if the state update works
                            if (selected) {
                              setSelected(null); // Toggle off if already selected
                            } else {
                              setSelected(p); // Select this product
                            }
                          }}>
                            {selected && selected.id === p.id ? 'CLOSE' : 'Details'}
                          </button>
                          <button className="px-3 py-1 rounded-lg bg-gray-50 text-gray-700 text-sm border" onClick={() => navigator.clipboard?.writeText(JSON.stringify(p, null, 2))}>Copy JSON</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {paddingBottom > 0 && <div style={{ height: paddingBottom }} />}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filtered.map(p => (
                  <article key={p.id} className="p-4 bg-white rounded-2xl shadow-sm flex items-start gap-4 border border-gray-100">
                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-700">
                      {p.name.split(' ').slice(0,2).map(w => w[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-lg font-semibold">{p.name}</h2>
                          <div className="text-sm text-gray-500">{p.categories?.join(' • ')}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-medium">{formatPrice(p.price)}</div>
                          <div className="text-xs text-gray-400">{p.unit?.raw}</div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 items-center">
                        <div className="col-span-1">
                          {p.nutrition && (
                            <>
                              <div className="text-xs text-gray-500 mb-1">Nutrition ({p.nutrition.unit})</div>
                              <NutritionChart nutrition={p.nutrition} />
                            </>
                          )}
                        </div>
                        <div className="col-span-1 flex flex-col gap-2">
                          <div className="text-xs text-gray-500">Allergens</div>
                          <div className="flex gap-2 flex-wrap">
                            {p.allergens?.contains?.length === 0 ? (
                              <span className="text-xs px-2 py-1 bg-green-50 rounded">No declared allergens</span>
                            ) : (
                              p.allergens?.contains?.map((a: string) => (
                                <span key={a} className="text-xs px-2 py-1 bg-red-50 rounded border text-red-700">{a}</span>
                              ))
                            )}
                            {p.allergens?.mayContain?.map((a: string) => (
                              <span key={a} className="text-xs px-2 py-1 bg-yellow-50 rounded border text-yellow-800">may contain: {a}</span>
                            ))}
                          </div>
                          <div className="mt-auto">
                            <div className="text-xs text-gray-500">Nutri composite</div>
                            <NutriBar score={p.nutriScore} />
                            <div className="text-xs text-gray-400 mt-1">Grade: {p.globalHealthGrade}</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button className="px-3 py-1 rounded-lg bg-red-500 text-white text-sm border" onClick={() => {
                          console.log('Details clicked for product (list view):', p);
                          if (selected) {
                            setSelected(null);
                          } else {
                            setSelected(p);
                          }
                        }}>
                          {selected && selected.id === p.id ? 'CLOSE' : 'Details'}
                        </button>
                        <button className="px-3 py-1 rounded-lg bg-gray-50 text-gray-700 text-sm border" onClick={() => navigator.clipboard?.writeText(JSON.stringify(p, null, 2))}>Copy JSON</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {filtered.length === 0 && !isLoading && (
              <div className="p-6 bg-white rounded-lg shadow-sm text-center text-gray-500">No products match your query.</div>
            )}
            {isLoading && products.length === SAMPLE_FALLBACK.length && (
              <div className="p-6 bg-white rounded-lg shadow-sm text-center text-gray-500 animate-pulse">Streaming products…</div>
            )}
          </div>

          <aside className="hidden md:block">
            <div className="sticky top-6 p-4 bg-white rounded-lg shadow-sm border">
              <h3 className="font-semibold mb-2">Summary</h3>
              <div className="text-sm text-gray-600 mb-3">Showing <strong>{filtered.length}</strong> products</div>
              {/* New summary metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-gray-500">Halal %</div>
                  <div className="font-medium">
                    {(() => { const h = filtered.filter(p => p.halalCheck?.status === 'halal').length; return filtered.length ? Math.round((h/filtered.length)*100) : 0; })()}%
                  </div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-gray-500">Vegan %</div>
                  <div className="font-medium">
                    {(() => { const v = filtered.filter(p => p.nutritionalTags?.vegan).length; return filtered.length ? Math.round((v/filtered.length)*100) : 0; })()}%
                  </div>
                </div>
                <div className="p-2 bg-gray-50 rounded col-span-2">
                  <div className="text-gray-500">Avg additives</div>
                  <div className="font-medium">
                    {(() => { const sum = filtered.reduce((s,p)=> s + (p.additiveInfo?.totalAdditives||0),0); return filtered.length ? (sum/filtered.length).toFixed(2) : '0.00'; })()}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500">Average kcal (visible)</div>
              <div className="text-lg font-medium mb-3">
                {Math.round(
                  (filtered.reduce((s, p) => s + (p.nutrition?.kcal || 0), 0) / Math.max(1, filtered.length))
                )} kcal
              </div>

              <div className="text-xs text-gray-500">Categories</div>
              <ul className="mt-2 text-sm space-y-1">
                {categoryStats
                  .map((c) => (
                    <li key={c.category} className="flex items-center justify-between">
                      <span>{c.category}</span>
                      <span className="text-gray-400 text-sm">{c.productCount}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </aside>
        </section>

        {selected && (
          <div className="fixed inset-0 bg-red-500 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg border-4 border-blue-500">
              <h2 className="text-xl font-bold">MODAL TEST</h2>
              <p>Selected Product: {selected.name}</p>
              <p>ID: {selected.id}</p>
              <button 
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
                onClick={() => setSelected(null)}
              >
                CLOSE MODAL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
