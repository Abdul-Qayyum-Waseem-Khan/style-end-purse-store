import { useState, useEffect } from 'react';
import { Instagram } from 'lucide-react';
import { Button } from './ui/button';
import axiosInstance from '../../api/axios';

export function InstagramFeed() {
  const [handle, setHandle] = useState('roots.nutratech');
  const [profileUrl, setProfileUrl] = useState('https://instagram.com/roots.nutratech');
  const [posts, setPosts] = useState<string[]>([
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=300&fit=crop"
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInstagramSettings = async () => {
      try {
        const { data } = await axiosInstance.get('/api/v1/settings');
        if (data.success && data.data) {
          if (data.data.instagramHandle) {
            let cleanHandle = data.data.instagramHandle;
            if (cleanHandle.includes('instagram.com/')) {
              try {
                const urlObj = new URL(cleanHandle.startsWith('http') ? cleanHandle : `https://${cleanHandle}`);
                cleanHandle = urlObj.pathname.split('/').filter(Boolean)[0] || cleanHandle;
              } catch (e) {
                // Ignore errors
              }
            }
            cleanHandle = cleanHandle.replace('@', '').split('?')[0].trim();
            
            setHandle(cleanHandle);
            setProfileUrl(`https://instagram.com/${cleanHandle}`);
          }
          
          if (data.data.instagramPostUrls) {
            // Split by newline or comma and filter empty strings
            const urls = data.data.instagramPostUrls
              .split(/[\n,]+/)
              .map((url: string) => url.trim())
              .filter((url: string) => url.length > 0);
              
            if (urls.length > 0) {
              setPosts(urls);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load Instagram settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstagramSettings();
  }, []);

  if (isLoading) return null;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Instagram className="w-12 h-12 mx-auto mb-4 text-pink-600" />
          <h2 className="text-4xl text-gray-900 mb-4">Join Our Community</h2>
          <p className="text-lg text-gray-600">Follow us on Instagram for daily style inspiration and new arrivals</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {posts.map((url, i) => {
            // If the URL is an Instagram embed URL, we might want to handle it differently.
            // For now, if it's an image URL, we display it as an image.
            // If it's a standard Instagram post link (e.g. https://instagram.com/p/XXX), 
            // we could either embed it or use it as an ahref link over a placeholder.
            // For simplicity in this iteration, we check if it's an image.
            const isImage = url.match(/\.(jpeg|jpg|gif|png)/i) != null || url.includes('unsplash.com');
            
            return (
              <a href={url} target="_blank" rel="noopener noreferrer" key={i} className="group relative aspect-square overflow-hidden rounded-2xl cursor-pointer block">
                {isImage ? (
                  <img
                    src={url}
                    alt={`Instagram Post ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <iframe 
                    src={(() => {
                      try {
                        const urlObj = new URL(url);
                        urlObj.search = '';
                        let path = urlObj.pathname;
                        if (!path.endsWith('/')) path += '/';
                        return `https://www.instagram.com${path}embed/`;
                      } catch (e) {
                        return url;
                      }
                    })()} 
                    className="w-full h-full border-0 pointer-events-none" 
                    scrolling="no" 
                    allowTransparency={true}
                  ></iframe>
                )}
                {isImage && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Instagram className="w-8 h-8 text-white" />
                  </div>
                )}
              </a>
            );
          })}
        </div>
        <div className="text-center mt-10">
          <a href={profileUrl} target="_blank" rel="noopener noreferrer">
            <Button className="bg-gradient-to-r from-accent-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white shadow-xl hover:shadow-2xl transition-all px-8 py-6 text-lg">
              <Instagram className="w-5 h-5 mr-2" />
              Follow @{handle}
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
