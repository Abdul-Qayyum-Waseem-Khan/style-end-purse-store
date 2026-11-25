import { Link } from 'react-router';
import { useBlogs } from '../hooks/useBlogs';
import { formatDate } from '../utils/format';
import { ArrowRight, Clock } from 'lucide-react';
import { ImageWithFallback } from '../app/components/figma/ImageWithFallback';
import { SEO } from '../app/components/SEO';

export function BlogListPage() {
  const { blogs, isLoading } = useBlogs({ limit: 12 });

  if (isLoading && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col pt-28 pb-20 items-center justify-center">
        <div className="h-10 w-10 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs uppercase tracking-widest text-gray-500 font-medium">Loading Journal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-16 pb-20">
      <SEO 
        title="The Journal | Style End Purse" 
        description="Read the latest fashion stories, handbag styling guides, leather care tips, and seasonal lookbooks from Style End Purse." 
      />
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 animate-slide-up">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#A67C38] mb-3">
            Style End Purse Editorial
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-[#111111] mb-4 font-serif-luxury tracking-tight">
            The Fashion Journal
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Styling notes, leather care guides, and stories behind our signature handbags and footwear.
          </p>
        </div>

        {blogs.length === 0 && !isLoading ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200/80 max-w-xl mx-auto">
            <h3 className="text-xl font-bold text-[#111111] mb-2 font-serif-luxury">No articles published yet</h3>
            <p className="text-sm text-gray-500">Check back soon for our latest style guides and collection stories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, index) => (
              <Link 
                key={blog._id} 
                to={`/blogs/${blog.slug}`}
                className="group flex flex-col bg-white rounded-lg overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-300 luxury-card-hover animate-slide-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                  <ImageWithFallback 
                    src={blog.coverImage || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-block bg-[#111111]/85 text-[#C5A880] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-sm backdrop-blur-xs">
                        {blog.tags[0]}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col flex-grow p-5">
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-2.5 font-medium uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(blog.createdAt)}
                    </span>
                  </div>
                  
                  <h2 className="text-lg font-bold text-[#111111] mb-2 group-hover:text-[#A67C38] transition-colors line-clamp-2 font-serif-luxury">
                    {blog.title}
                  </h2>
                  
                  <p className="text-xs sm:text-sm text-gray-600 mb-5 line-clamp-3 flex-grow leading-relaxed">
                    {blog.excerpt || blog.content.replace(/<[^>]*>?/gm, '').substring(0, 140) + '...'}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-3.5 border-t border-gray-100">
                    <span className="text-xs font-medium text-gray-500">By {blog.author?.name || 'Editorial Team'}</span>
                    <span className="text-[#111111] group-hover:text-[#A67C38] font-semibold flex items-center text-xs uppercase tracking-wider transition-colors">
                      Read <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
