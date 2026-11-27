import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ProductCard } from './ProductCard';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useBlogs } from '../../hooks/useBlogs';
import { useSettingsStore } from '../../store/settingsStore';
import { SEO } from './SEO';
import { StoreReviewsSection } from './StoreReviewsSection';

import { HeroSection } from '../../components/HeroSection';
import { TopStickyFlashAds, MidPageFlashAd, FloatingFlashAd } from '../../components/flashAds/FlashTimerAds';

export function HomePage() {
  const { products, isLoading } = useProducts({ limit: 12 });
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { blogs } = useBlogs({ limit: 3 });
  const { brandPillars, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');

  const displayCategories = categories;

  // Filter products by selected category
  const filteredProducts = products.filter(p => {
    if (selectedCategoryTab === 'all') return true;
    if (selectedCategoryTab === 'sets') return p.productType === 'set' || p.name.toLowerCase().includes('set');
    
    // Match by category slug or ID
    const catSlug = typeof p.category === 'object' ? p.category?.slug : p.category;
    if (catSlug && catSlug.toLowerCase() === selectedCategoryTab.toLowerCase()) return true;
    
    // Match by name keyword
    if (selectedCategoryTab === 'handbags') return p.name.toLowerCase().includes('bag') || p.name.toLowerCase().includes('tote') || p.name.toLowerCase().includes('purse');
    if (selectedCategoryTab === 'shoes') return p.name.toLowerCase().includes('heel') || p.name.toLowerCase().includes('shoe') || p.name.toLowerCase().includes('stiletto');
    if (selectedCategoryTab === 'pouches') return p.name.toLowerCase().includes('pouch') || p.name.toLowerCase().includes('wallet');
    return true;
  });

  return (
    <div className="bg-white min-h-screen font-sans text-[#111111]">
      <SEO 
        title="Style End Purse | Handbags, Footwear & Accessories" 
        description="Shop stylish bags, shoes, and matching sets at Style End Purse. High quality leather, fast delivery, and Cash on Delivery available."
      />

      {/* 0. Dynamic Top Urgency & Ticker Flash Ad */}
      <TopStickyFlashAds />

      {/* 1. Dynamic Luxury Hero Section */}
      <HeroSection />

      {/* 2. Shop by Category (Only shows real dynamic categories or loading skeleton) */}
      {(categoriesLoading || displayCategories.length > 0) && (
        <section className="py-10 container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#111111] font-serif-luxury">
              Shop by Category
            </h2>
            <Link to="/category/all" className="text-xs font-semibold text-gray-500 hover:text-black">
              View All &rarr;
            </Link>
          </div>

          {categoriesLoading && displayCategories.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {displayCategories.slice(0, 4).map((cat) => (
                <Link
                  key={cat._id}
                  to={`/category/${cat.slug}`}
                  className="group block"
                >
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 mb-2 border border-gray-100">
                    {cat.image && (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-[#111111] group-hover:underline">
                    {cat.name}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 3. Featured Products Grid */}
      <section className="py-12 bg-[#FAFAFA] border-y border-gray-100">
        <div className="container mx-auto px-4 md:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#111111]">
              Featured Products
            </h2>

            {/* Filter Tabs */}
            <div className="flex items-center gap-5 overflow-x-auto pb-1 scrollbar-hide text-xs font-semibold uppercase tracking-wider">
              <button
                onClick={() => setSelectedCategoryTab('all')}
                className={`pb-1 whitespace-nowrap transition-colors ${
                  selectedCategoryTab === 'all'
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                All
              </button>

              {displayCategories.slice(0, 3).map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategoryTab(cat.slug)}
                  className={`pb-1 whitespace-nowrap transition-colors ${
                    selectedCategoryTab === cat.slug
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}

              <button
                onClick={() => setSelectedCategoryTab('sets')}
                className={`pb-1 whitespace-nowrap transition-colors ${
                  selectedCategoryTab === 'sets'
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                3-Piece Sets
              </button>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-200 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.slice(0, 8).map(prod => (
                <ProductCard 
                  key={prod.id || prod._id} 
                  product={prod}
                  badge={prod.isOnSale ? "Sale" : undefined}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/category/all">
              <button className="bg-white hover:bg-black hover:text-white text-[#111111] border border-gray-300 text-xs font-semibold uppercase tracking-wider px-7 py-3 rounded-full transition-all">
                View All Products ({products.length})
              </button>
            </Link>
          </div>

        </div>
      </section>

      {/* 4. Dynamic Mid-Page Luxury Flash / Timer Ad */}
      <MidPageFlashAd />

      {/* 5. Client Testimonials (Store Reviews) */}
      <StoreReviewsSection />

      {/* 6. Fashion Journal / Blogs Preview */}
      {blogs.length > 0 && (
        <section className="py-14 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-[#111111] font-serif-luxury">
                From The Journal
              </h2>
              <Link
                to="/blogs"
                className="inline-flex items-center gap-1.5 bg-[#111111] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-md transition-colors"
              >
                View More &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogs.slice(0, 3).map((blog) => (
                <Link
                  key={blog._id}
                  to={`/blogs/${blog.slug}`}
                  className="group flex flex-col bg-white rounded-lg overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-md transition-all luxury-card-hover"
                >
                  <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                    <img
                      src={blog.coverImage || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-base font-bold text-[#111111] group-hover:text-[#A67C38] transition-colors line-clamp-2 font-serif-luxury mb-2">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 flex-grow">
                      {blog.excerpt || blog.content.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Dynamic Brand Pillars (Managed from Admin Settings) */}
      {brandPillars.length > 0 && (
        <section className="py-10 border-t border-gray-100 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
              {brandPillars.map((pillar, idx) => (
                <div key={idx} className="space-y-1 p-5 rounded-lg border border-gray-100 bg-[#FAF8F5]/60">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">{pillar.title}</h4>
                  {pillar.description && (
                    <p className="text-xs text-gray-500 leading-relaxed">{pillar.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Floating Urgency Flash Deal Drawer */}
      <FloatingFlashAd />

    </div>
  );
}
