import { SEO } from '../app/components/SEO';
import { Badge } from '../app/components/ui/badge';
import { ShieldCheck, Sparkles, CheckCircle2, ShoppingBag, Award, Heart } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-20 font-sans">
      <SEO 
        title="About Us | Style End Purse" 
        description="Welcome to Style End Purse—your destination for handcrafted luxury handbags, footwear, and timeless accessories." 
      />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 max-w-4xl text-center mb-16 animate-slide-up">
        <Badge className="mb-4 bg-brand-100 text-brand-700 hover:bg-brand-200 border-0 px-4 py-1 uppercase tracking-wider font-semibold">
          About Style End Purse
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
          Crafted for <span className="text-brand-600">Timeless Elegance</span>
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-6">
          We believe that true style is an effortless balance of craftsmanship, quality materials, and modern design. Every handbag, heel, and accessory at Style End Purse is curated to elevate your everyday wardrobe.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
          From structured everyday totes and evening clutches to coordinated 3-piece ensemble sets, Style End Purse brings contemporary luxury and enduring comfort together for women across Pakistan.
        </p>
      </section>

      {/* The Collection Section */}
      <section className="bg-gray-50 py-16 mb-16 rounded-3xl container mx-auto px-4 max-w-5xl animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">The Style End Purse Standard</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Every piece in our collection is thoughtfully designed with attention to detail, durability, and refined aesthetics:
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <ShoppingBag className="w-12 h-12 text-brand-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">Signature Handbags & Sets</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Our handbags, pouches, and 3-piece sets are crafted from premium leather and fine hardware, offering versatile silhouettes that transition seamlessly from daytime errands to evening occasions.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <Sparkles className="w-12 h-12 text-brand-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">Footwear & Coordinated Styling</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Pair your favorite bag with our curated collection of heels, flats, and everyday footwear—designed for all-day comfort without compromising on silhouette or finish.
            </p>
          </div>
        </div>
      </section>

      {/* Core Commitments Section */}
      <section className="bg-brand-900 text-white py-20 mb-16 animate-slide-up rounded-3xl container mx-auto" style={{ animationDelay: '200ms' }}>
        <div className="px-4 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <ShieldCheck className="w-12 h-12 text-brand-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Our Core Commitments</h2>
            <p className="text-brand-100 max-w-2xl mx-auto">
              Everything we do is built on four fundamental pillars of excellence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
              <h4 className="font-bold text-xl text-white mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-brand-400"/> Premium Craftsmanship</h4>
              <p className="text-brand-100 text-sm leading-relaxed">Every handbag and pair of shoes at Style End Purse undergoes strict quality checks for stitching, hardware, and finish.</p>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
              <h4 className="font-bold text-xl text-white mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-brand-400"/> Contemporary Design</h4>
              <p className="text-brand-100 text-sm leading-relaxed">We blend classic silhouettes with modern seasonal palettes so your pieces stay stylish year after year.</p>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
              <h4 className="font-bold text-xl text-white mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-brand-400"/> Seamless Shopping Experience</h4>
              <p className="text-brand-100 text-sm leading-relaxed">From browsing collections to doorstep delivery and easy order tracking, our platform is built to be fast, secure, and effortless.</p>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
              <h4 className="font-bold text-xl text-white mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-brand-400"/> Dedicated Client Care</h4>
              <p className="text-brand-100 text-sm leading-relaxed">Our team is always ready to assist you with sizing, styling, and order support via WhatsApp, phone, or email.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="container mx-auto px-4 max-w-4xl text-center mb-20 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <Award className="w-12 h-12 text-brand-500 mx-auto mb-6 opacity-80" />
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision & Mission</h2>
        <p className="text-xl text-gray-700 leading-relaxed mb-8 max-w-3xl mx-auto">
          <strong>Our Vision:</strong> To be Pakistan's most trusted destination for luxury handbags, footwear, and coordinated accessories.
        </p>
        <blockquote className="text-xl font-medium text-gray-600 italic leading-relaxed mb-10 border-l-4 border-brand-500 pl-6 text-left">
          "At Style End Purse, our mission is to empower every woman to step out with confidence—carrying pieces crafted with care, elegance, and lasting quality."
        </blockquote>
        <a href="/contact" className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-10 rounded-full transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
          Contact Our Concierge
        </a>
      </section>

    </div>
  );
}
