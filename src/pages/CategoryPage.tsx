import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router';
import { Filter, SlidersHorizontal, ChevronRight, X } from 'lucide-react';
import { useProducts, Product } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { ProductCard } from '../app/components/ProductCard';
import { Button } from '../app/components/ui/button';
import { Label } from '../app/components/ui/label';
import { Input } from '../app/components/ui/input';
import { SEO } from '../app/components/SEO';

const COLOR_FILTERS = [
  { name: 'Noir Black', hex: '#111827' },
  { name: 'Champagne Gold', hex: '#B8924B' },
  { name: 'Cognac Tan', hex: '#9A3412' },
  { name: 'Burgundy', hex: '#831843' },
  { name: 'Emerald', hex: '#065F46' },
  { name: 'Ivory Pearl', hex: '#FDF8EE' },
];

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const sortParam = searchParams.get('sort') || 'newest';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const searchQueryParam = searchParams.get('search') || searchParams.get('q') || '';
  const categoriesParam = searchParams.get('categories') || '';

  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [searchInput, setSearchInput] = useState(searchQueryParam);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => 
    categoriesParam ? categoriesParam.split(',') : (slug && slug !== 'all' ? [slug] : [])
  );

  // Synchronize when route slug changes
  useEffect(() => {
    if (categoriesParam) {
      setSelectedCategories(categoriesParam.split(','));
    } else if (slug && slug !== 'all') {
      setSelectedCategories([slug]);
    } else {
      setSelectedCategories([]);
    }
  }, [slug, categoriesParam]);

  const { categories } = useCategories();

  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const { products, pagination, isLoading, error } = useProducts({
    categories: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
    search: searchQueryParam,
    sort: sortParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
    limit: 12,
    page: page
  });

  useEffect(() => {
    setPage(1);
    setAllProducts([]);
  }, [selectedCategories, searchQueryParam, sortParam, minPriceParam, maxPriceParam]);

  useEffect(() => {
    if (page === 1) {
      setAllProducts(products);
    } else if (products.length > 0) {
      setAllProducts(prev => {
        const newProducts = products.filter(p => !prev.some(existing => (existing.id || existing._id) === (p.id || p._id)));
        return [...prev, ...newProducts];
      });
    }
  }, [products, page]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams);
    
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
      params.delete('q');
    } else {
      params.delete('search');
      params.delete('q');
    }

    if (selectedCategories.length > 0) {
      params.set('categories', selectedCategories.join(','));
    } else {
      params.delete('categories');
    }

    setSearchParams(params);
    setIsMobileFilterOpen(false);
  };

  const handleCategoryToggle = (catSlug: string) => {
    setSelectedCategories(prev => 
      prev.includes(catSlug) 
        ? prev.filter(c => c !== catSlug)
        : [...prev, catSlug]
    );
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', e.target.value);
    setSearchParams(params);
  };

  const getCategoryTitle = () => {
    if (searchQueryParam) return `Search: “${searchQueryParam}”`;
    if (!slug || slug === 'all' || slug === 'new-arrivals') return 'All Collections & New Arrivals';
    if (slug === 'sets' || slug === '3-piece-sets') return '3-Piece Matching Sets';
    if (slug === 'shoes' || slug === 'shoes-heels') return 'Shoes & Heels';
    if (slug === 'pouches' || slug === 'pouches-wallets') return 'Pouches & Wallets';
    if (slug === 'handbags' || slug === 'handbags-totes') return 'Handbags & Purses';
    return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const categoryName = getCategoryTitle();

  return (
    <div className="bg-white min-h-screen pb-24 font-sans text-[#111111]">
      <SEO 
        title={`${categoryName} | Style End Purse`} 
        description={`Explore handcrafted designer handbags, footwear, and 3-piece sets in ${categoryName}.`} 
      />
      
      {/* 1. Clean Category Header */}
      <div className="border-b border-gray-100 py-10 bg-[#FAFAFA]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Link to="/" className="hover:text-black">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-black font-medium">{categoryName}</span>
          </div>

          <h1 className="font-serif-luxury text-3xl md:text-4xl font-normal text-[#111111]">
            {categoryName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {allProducts.length} items available
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8">
        
        {/* 2. Top Toolbar */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-gray-100 mb-8">
          
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-800"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <div className="hidden lg:block text-xs text-gray-500">
            Showing {allProducts.length} results
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 hidden sm:inline">Sort by:</span>
            <select 
              className="bg-transparent font-medium text-gray-900 focus:outline-none cursor-pointer text-xs border border-gray-200 rounded-md px-2.5 py-1.5"
              value={sortParam}
              onChange={handleSortChange}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* 3. Clean Desktop Sidebar */}
          <div className="hidden lg:block w-64 shrink-0 space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-900">Filters</span>
              {(minPrice || maxPrice || searchInput || selectedCategories.length > 0) && (
                <button 
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                    setSearchInput('');
                    setSelectedCategories([]);
                    setSearchParams({});
                  }}
                  className="text-xs text-gray-400 hover:text-black underline"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-700">Search</Label>
              <Input 
                type="text" 
                placeholder="Search items..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-9 text-xs rounded-md"
              />
            </div>

            {/* Categories */}
            <div className="space-y-2.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-700">Categories</Label>
              <div className="space-y-2 text-xs">
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-3.5 h-3.5 rounded text-black border-gray-300"
                      checked={selectedCategories.includes(cat.slug)}
                      onChange={() => handleCategoryToggle(cat.slug)}
                    />
                    <span className="text-gray-700 hover:text-black">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Swatch Filters */}
            <div className="space-y-2.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-700">Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_FILTERS.map((col, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchInput(col.name);
                      handleApplyFilters();
                    }}
                    className="w-5 h-5 rounded-full border border-gray-300 transition-transform hover:scale-110"
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  />
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2.5 pt-2 border-t border-gray-100">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-700">Price Range (PKR)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-8 text-xs rounded-md"
                />
                <span className="text-gray-400">-</span>
                <Input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-8 text-xs rounded-md"
                />
              </div>
              <Button 
                onClick={handleApplyFilters}
                className="w-full bg-black hover:bg-gray-800 text-white rounded-md text-xs font-semibold h-9 mt-2"
              >
                Apply
              </Button>
            </div>

          </div>

          {/* 4. Product Gallery */}
          <div className="flex-1">
            
            {isLoading && page === 1 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 text-gray-500">
                {error}
              </div>
            ) : allProducts.length === 0 && !isLoading ? (
              <div className="text-center py-20 bg-gray-50 rounded-xl p-8 space-y-3">
                <h3 className="font-serif-luxury text-xl font-medium text-gray-900">No items found</h3>
                <p className="text-xs text-gray-500">
                  Try adjusting your filters or search keywords.
                </p>
                <Button 
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                    setSearchInput('');
                    setSelectedCategories([]);
                    setSearchParams({});
                  }}
                  className="bg-black text-white rounded-full px-6 text-xs"
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {allProducts.map((product) => (
                    <ProductCard 
                      key={product.id || product._id}
                      product={product}
                      badge={product.isOnSale ? "Sale" : undefined}
                    />
                  ))}
                </div>
                
                {pagination?.hasNextPage && (
                  <div className="mt-12 text-center">
                    <Button 
                      onClick={() => setPage(prev => prev + 1)}
                      variant="outline"
                      className="border border-gray-300 text-black hover:bg-black hover:text-white px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-wider"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}
              </>
            )}

          </div>

        </div>

      </div>

      {/* 5. Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-900">Filter Products</span>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700">Search</Label>
                <Input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-9 text-xs rounded-md"
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-gray-700">Categories</Label>
                <div className="space-y-2 text-xs">
                  {categories.map((cat) => (
                    <label key={cat._id} className="flex items-center gap-2.5">
                      <input 
                        type="checkbox" 
                        className="w-3.5 h-3.5 text-black rounded"
                        checked={selectedCategories.includes(cat.slug)}
                        onChange={() => handleCategoryToggle(cat.slug)}
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-gray-700">Price Range (PKR)</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-8 text-xs rounded-md"
                  />
                  <span>-</span>
                  <Input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-8 text-xs rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <Button 
                onClick={handleApplyFilters}
                className="w-full bg-black text-white rounded-full text-xs font-semibold py-3"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
