import { Mail, MapPin, Phone, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';
import { Link } from 'react-router';
import { Logo } from './Logo';
import { useState } from 'react';
import axiosInstance from '../../api/axios';
import { toast } from 'sonner';

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsSubscribing(true);
    try {
      await axiosInstance.post('/api/v1/newsletter/subscribe', { email: newsletterEmail });
      toast.success('Thank you for subscribing to Style End Purse.');
      setNewsletterEmail('');
    } catch (err) {
      toast.success('Thank you for subscribing.');
      setNewsletterEmail('');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-[#111111] text-white font-sans mt-20">
      
      {/* 1. Value Pillars */}
      <div className="border-b border-gray-800 py-10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Genuine Leather</h4>
                <p className="text-[11px] text-gray-400">High quality durable material</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <Truck className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Free Delivery</h4>
                <p className="text-[11px] text-gray-400">On all orders over PKR 5,000</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <RefreshCw className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Doorstep Inspection</h4>
                <p className="text-[11px] text-gray-400">Cash on Delivery available</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <Award className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Quality Craftsmanship</h4>
                <p className="text-[11px] text-gray-400">Handcrafted with care</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Columns */}
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 pr-0 lg:pr-8">
            <Logo light className="h-8 w-auto mb-4" />
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm mb-6 font-normal">
              Style End Purse offers stylish handbags, shoes, and matching accessories made with quality leather and modern design.
            </p>

            <form onSubmit={handleSubscribe} className="max-w-md">
              <label className="text-xs font-semibold uppercase tracking-wider text-white block mb-2">
                Newsletter
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-800 rounded-md px-3.5 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-white"
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="bg-white text-black font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/category/handbags" className="hover:text-white transition-colors">Handbags & Totes</Link></li>
              <li><Link to="/category/shoes" className="hover:text-white transition-colors">Shoes & Heels</Link></li>
              <li><Link to="/category/pouches" className="hover:text-white transition-colors">Pouches & Wallets</Link></li>
              <li><Link to="/category/sets" className="hover:text-white transition-colors">3-Piece Sets</Link></li>
              <li><Link to="/category/all" className="hover:text-white transition-colors">All Products</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/track-order" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/returns" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/blogs" className="hover:text-white transition-colors">Fashion Journal</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <span>Gulberg III, Lahore, Pakistan</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <a href="tel:+923069291569" className="hover:text-white transition-colors">+923069291569</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <a href="mailto:styleendpurse@gmail.com" className="hover:text-white transition-colors">styleendpurse@gmail.com</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal & Copyright */}
        <div className="mt-14 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} Style End Purse. All rights reserved by{' '}
            <a
              href="https://mustaqeemfarms.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white underline underline-offset-2 transition-colors"
            >
              Mustaqeem Farms &amp; Tech Pvt Ltd
            </a>.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-gray-300">Privacy</Link>
            <Link to="/returns" className="hover:text-gray-300">Returns</Link>
            <Link to="/contact" className="hover:text-gray-300">Support</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
