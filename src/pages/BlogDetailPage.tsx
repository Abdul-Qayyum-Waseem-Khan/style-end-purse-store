import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { useBlogs, Blog } from '../hooks/useBlogs';
import { Badge } from '../app/components/ui/badge';
import { formatDate } from '../utils/format';
import { ArrowLeft, Clock, Calendar, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import DOMPurify from 'dompurify';
import { SEO } from '../app/components/SEO';

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getBlogBySlug } = useBlogs();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      setIsLoading(true);
      getBlogBySlug(slug).then((data) => {
        setBlog(data);
        setIsLoading(false);
      });
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-32 pb-20 items-center justify-center">
        <div className="h-12 w-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-32 pb-20 items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/blogs" className="text-brand-600 font-medium hover:underline flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
        </Link>
      </div>
    );
  }

  // Clean up non-breaking spaces that cause overflow, then sanitize
  const cleanedContent = blog.content.replace(/&nbsp;/g, ' ');
  const sanitizedContent = DOMPurify.sanitize(cleanedContent, {
    ADD_TAGS: ['img', 'iframe', 'video', 'table', 'th', 'tr', 'td', 'tbody', 'thead', 'tfoot', 'ul', 'ol', 'li', 'em', 'strong', 'u', 's', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'a', 'span', 'div'],
    ADD_ATTR: ['src', 'alt', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder', 'scrolling', 'href', 'target', 'rel', 'class', 'style', 'title'],
  });

  return (
    <article className="min-h-screen bg-white pt-24 pb-20 overflow-x-hidden">
      <SEO 
        title={`${blog.title} | Style End Purse Journal`} 
        description={blog.excerpt || blog.content.substring(0, 150)} 
        keywords={blog.tags?.join(', ') || 'luxury handbags, fashion journal, style end purse'}
        image={blog.coverImage}
        url={`https://styleendpurse.com/blogs/${blog.slug}`}
        type="article"
        schema={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": blog.title,
          "image": blog.coverImage ? [blog.coverImage] : [],
          "datePublished": blog.createdAt,
          "dateModified": blog.updatedAt || blog.createdAt,
          "author": [{
              "@type": "Person",
              "name": blog.author?.name || "Admin",
          }]
        }}
      />
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/blogs" className="inline-flex items-center text-xs uppercase tracking-wider text-gray-500 hover:text-[#111111] transition-colors mb-8 font-semibold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Journal
        </Link>

        {/* Header */}
        <header className="mb-10 animate-slide-up">
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {blog.tags.map(tag => (
                <Badge key={tag} className="bg-[#FAF8F5] text-[#A67C38] border border-[#C5A880]/40 rounded-sm px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <h1 className="text-3xl md:text-5xl font-bold text-[#111111] leading-tight mb-5 tracking-tight font-serif-luxury">
            {blog.title}
          </h1>
          
          {blog.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              {blog.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 py-6 border-y border-gray-100">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-bold text-gray-900">{blog.author?.name || 'Admin'}</p>
                <p className="text-sm text-gray-500">Author</p>
              </div>
            </div>
            
            <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {formatDate(blog.createdAt)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                {Math.max(1, Math.ceil(blog.content.length / 1000))} min read
              </div>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {blog.coverImage && (
          <div className="mb-12 overflow-hidden shadow-sm animate-slide-up" style={{ animationDelay: '100ms' }}>
            <img 
              src={blog.coverImage} 
              alt={blog.title} 
              className="w-full max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-12 animate-slide-up" style={{ animationDelay: '200ms' }}>
          
          <div className="lg:w-16 shrink-0 pt-2 flex lg:flex-col gap-4 order-2 lg:order-1 items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden lg:block rotate-180" style={{ writingMode: 'vertical-rl' }}>Share</span>
            <div className="h-px lg:h-12 w-12 lg:w-px bg-gray-200 hidden lg:block"></div>
            <button className="w-10 h-10 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors">
              <Facebook className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:text-sky-500 hover:border-sky-200 hover:bg-sky-50 transition-colors">
              <Twitter className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <Linkedin className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-100 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 min-w-0 order-1 lg:order-2 w-full max-w-3xl">
            <div 
              className="prose prose-base md:prose-lg prose-neutral text-gray-700 whitespace-normal
                prose-headings:text-[#111111] prose-headings:font-bold prose-headings:font-serif-luxury
                prose-a:text-[#A67C38] prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-lg prose-img:shadow-sm
                prose-blockquote:border-l-[#A67C38] prose-blockquote:bg-[#FAF8F5] prose-blockquote:py-1 prose-blockquote:px-4"
              style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />

            {/* Gallery Section */}
            {blog.gallery && blog.gallery.length > 0 && (
              <div className="mt-14 border-t border-gray-100 pt-10">
                <h3 className="text-xl font-bold text-[#111111] mb-5 font-serif-luxury">Article Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {blog.gallery.map((img, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
                      <img src={img} alt={`${blog.title} gallery ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
