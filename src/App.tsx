import { Link, Route, Routes, useNavigate, useParams } from 'react-router';
import './App.css';
import { Button } from './components/ui/button';
import { CategoryDirectoryPage } from './pages/CategoryDirectoryPage';
import { CategoryProductsPage } from './pages/CategoryProductsPage';

function CategoryDirectoryPageWrapper() {
  const { path } = useParams();
  const navigate = useNavigate();

  const handleNavigateToDirectory = (dirPath: string) => {
    navigate(`/category-directory/${encodeURIComponent(dirPath)}`);
  };

  const handleNavigateToProducts = (productsPath: string) => {
    navigate(`/category-products/${encodeURIComponent(productsPath)}`);
  };

  const handleNavigateBack = () => {
    navigate(-1); // Go back in browser history
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Category Browser</h1>
          <Link to="/">
            <Button variant="ghost">← Back to Home</Button>
          </Link>
        </div>
      </header>
      <CategoryDirectoryPage
        directoryPath={path ? decodeURIComponent(path) : ''}
        onNavigateToDirectory={handleNavigateToDirectory}
        onNavigateToProducts={handleNavigateToProducts}
        onNavigateBack={handleNavigateBack}
      />
    </div>
  );
}

function CategoryProductsPageWrapper() {
  const { path } = useParams();
  const navigate = useNavigate();

  const handleNavigateBack = () => {
    navigate(-1); // Go back in browser history
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Products</h1>
          <Link to="/">
            <Button variant="ghost">← Back to Home</Button>
          </Link>
        </div>
      </header>
      <CategoryProductsPage
        categoryPath={path ? decodeURIComponent(path) : ''}
        onNavigateBack={handleNavigateBack}
      />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<CategoryDirectoryPageWrapper />} />
      <Route path="/category-directory" element={<CategoryDirectoryPageWrapper />} />
      <Route path="/category-directory/:path" element={<CategoryDirectoryPageWrapper />} />
      <Route path="/category-products/:path" element={<CategoryProductsPageWrapper />} />
    </Routes>
  );
}

export default App;
