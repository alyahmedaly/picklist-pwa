import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';

export function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">Picklist Product Transformer</h1>
          <p className="text-muted-foreground">
            CSV → JSONL Product Transformer with nutrition-focused design system
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Category Tree Card */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Category Tree</CardTitle>
              <CardDescription>
                Browse 24k+ Dutch products across 3k+ categories hierarchically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Explore the complete Albert Heijn product category hierarchy with features like:
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Interactive tree navigation (up to 6 levels deep)</li>
                  <li>• Real-time search and filtering</li>
                  <li>• Product count aggregation</li>
                  <li>• Breadcrumb navigation</li>
                  <li>• Tree and list view modes</li>
                  <li>• Dutch category names (Drogisterij, Bakkerij, etc.)</li>
                </ul>
                <Link to="/category-tree">
                  <Button className="w-full">
                    Open Category Tree
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Category Index Card */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Category Index</CardTitle>
              <CardDescription>
                Ali-optimized category browsing with nutrition metrics and filtering
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Browse categories with Ali-specific metrics for CrossFit nutrition:
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Halal compliance filtering and scoring</li>
                  <li>• Protein density optimization</li>
                  <li>• Price efficiency calculations</li>
                  <li>• Dutch language search support</li>
                  <li>• Virtual scrolling for performance</li>
                  <li>• Context-aware recommendations</li>
                </ul>
                <Link to="/category-index">
                  <Button className="w-full">
                    Open Category Index
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>VFS SQLite Test</CardTitle>
              <CardDescription>
                Test VFS-based SQLite with your 43MB products.db file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Load and query real Dutch product database using OPFS/IDB storage.
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Loads 30k+ products from products.db</li>
                  <li>• Uses OPFS or IndexedDB for persistence</li>
                  <li>• Requires Chrome 102+ for best performance</li>
                </ul>
                <Link to="/vfs-sqlite-test">
                  <Button className="w-full">
                    Test Real Database
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardHeader>
              <CardTitle>Design System</CardTitle>
              <CardDescription>
                Nutrition-focused UI components with Storybook docs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Interactive component documentation and examples.
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Category Directory page card */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Category Directory</CardTitle>
              <CardDescription>
                Browse products by category with hierarchical navigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Navigate through the nested product category structure:
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Hierarchical directory browsing</li>
                  <li>• Ali-specific metrics (halal compliance, protein)</li>
                  <li>• Direct access to product lists</li>
                  <li>• Breadcrumb navigation</li>
                  <li>• Real-time product counts</li>
                </ul>
                <Link to="/category-directory">
                  <Button className="w-full">
                    Browse Categories
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* ProductListVisualizer page card */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Product List Visualizer</CardTitle>
              <CardDescription>
                Virtualized product list with advanced filtering and sorting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Explore a high-performance product list with features like:
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Virtualized rendering for large datasets</li>
                  <li>• Advanced filtering (e.g., halal status)</li>
                  <li>• Sorting by various criteria</li>
                  <li>• Responsive design</li>
                </ul>
                <Link to="/product-list">
                  <Button className="w-full">
                    Open Product List Visualizer
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project info */}
        <div className="mt-12 text-center">
          <h2 className="text-lg font-semibold mb-4">About This Project</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A deterministic CSV → JSONL product transformer with comprehensive nutrition analysis,
            halal compliance checking, and Dutch language support. Built with React 19, TypeScript,
            and TailwindCSS following constitutional principles for performance and maintainability.
          </p>
        </div>
      </main>
    </div>
  );
}