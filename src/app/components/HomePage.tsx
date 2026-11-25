import { useState } from 'react';
import { Link } from 'react-router';
import { ProductCard } from './ProductCard';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useBlogs } from '../../hooks/useBlogs';
import { SEO } from './SEO';
import { StoreReviewsSection } from './StoreReviewsSection';

import { HeroSection } from '../../components/HeroSection';
import { TopStickyFlashAds, MidPageFlashAd, FloatingFlashAd } from '../../components/flashAds/FlashTimerAds';

export function HomePage() {
  const { products, isLoading } = useProducts({ limit: 12 });
  const { categories } = useCategories();
  const { blogs } = useBlogs({ limit: 3 });

  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');

  // Fallback categories if database has none yet
  const fallbackCategories = [
    { _id: '1', name: 'Handbags & Totes', slug: 'handbags', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80' },
    { _id: '2', name: 'Shoes & Heels', slug: 'shoes', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80' },
    { _id: '3', name: 'Pouches & Wallets', slug: 'pouches', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80' },
    { _id: '4', name: '3-Piece Sets', slug: 'sets', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80' },
  ];

  const displayCategories = categories.length > 0 ? categories : fallbackCategories;

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

      {/* 2. Shop by Category */}
      <section className="py-12 container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
            Shop by Category
          </h2>
          <Link to="/category/all" className="text-xs font-semibold text-gray-500 hover:text-black">
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayCategories.slice(0, 4).map((cat) => (
            <Link 
              key={cat._id} 
              to={`/category/${cat.slug}`} 
              className="group block"
            >
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-2.5 border border-gray-100">
                <img 
                  src={cat.image || "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80"} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-[#111111] group-hover:underline">
                {cat.name}
              </h3>
              <p className="text-[11px] text-gray-500">Shop Now &rarr;</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Products Grid */}
      <section className="py-12 bg-[#FAFAFA] border-y border-gray-100">
        <div className="container mx-auto px-4 md:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                New In Store
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-normal text-[#111111]">
                Featured Products
              </h2>
            </div>

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
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A67C38] block mb-1">
                  Editorial
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#111111] font-serif-luxury">
                  From The Journal
                </h2>
              </div>
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

      {/* 7. Quality & Trust Pillars */}
      <section className="py-12 border-t border-gray-100 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="space-y-1.5 p-5 rounded-lg border border-gray-100 bg-[#FAF8F5]/60">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">Genuine Premium Leather</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Made from high quality soft leather that is durable, comfortable to carry, and built to last.
              </p>
            </div>

            <div className="space-y-1.5 p-5 rounded-lg border border-gray-100 bg-[#FAF8F5]/60">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">Durable Gold Hardware</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Rust-resistant zippers, buckles, and clasps in gold finish that maintain their clean shine.
              </p>
            </div>

            <div className="space-y-1.5 p-5 rounded-lg border border-gray-100 bg-[#FAF8F5]/60">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">Careful Handcrafting</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Every piece is cleanly stitched and inspected to ensure great fit, finish, and durability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Urgency Flash Deal Drawer */}
      <FloatingFlashAd />

    </div>
  );
}
