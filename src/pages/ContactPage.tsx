import { useState, useEffect } from 'react';
import { usePages, PageData } from '../hooks/usePages';
import { useContacts } from '../hooks/useContacts';
import DOMPurify from 'dompurify';
import { Badge } from '../app/components/ui/badge';
import { Button } from '../app/components/ui/button';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import { InstagramFeed } from '../app/components/InstagramFeed';
import { SEO } from '../app/components/SEO';

export function ContactPage() {
  const { getPageBySlug } = usePages();
  const { submitContactForm } = useContacts();
  const [page, setPage] = useState<PageData | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    disease: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getPageBySlug('contact').then((data) => {
      setPage(data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await submitContactForm(formData);
    setIsSubmitting(false);
    if (success) {
      setFormData({ name: '', email: '', phone: '', age: '', disease: '', message: '' });
    }
  };

  const sanitizedContent = page ? DOMPurify.sanitize(page.content) : '';

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <SEO 
        title="Contact Us | Style End Purse" 
        description="Get in touch with Style End Purse. We are here to assist you with orders, bespoke inquiries, and styling advice." 
      />
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16 animate-slide-up">
          <Badge className="mb-4 bg-brand-100 text-brand-700 hover:bg-brand-200 border-0 px-4 py-1">
            Client Concierge
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight mb-4">
            {page?.title || 'Get in Touch'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have a question about our handbags, footwear, or an existing order? Fill out the form below and our concierge team will assist you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
          
          {/* Contact Info & Dynamic Content */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Our Location</h4>
                    <p className="text-gray-600">Style End Purse<br />Gulberg III, Lahore, Pakistan</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Phone</h4>
                    <p className="text-gray-600">+923069291569<br />Mon-Sat from 9am to 8pm</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Email</h4>
                    <p className="text-gray-600">styleendpurse@gmail.com<br />We'll respond within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {page && page.isActive && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div 
                  className="prose prose-orange max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
                />
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Request Consultation</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 transition-colors"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 transition-colors"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    className="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 transition-colors"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+92 3XX XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Age</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 transition-colors"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    placeholder="e.g. 35"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Disease / Condition / Goal</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 transition-colors"
                  value={formData.disease}
                  onChange={(e) => setFormData({...formData, disease: e.target.value})}
                  placeholder="e.g. Weight loss, Diabetes, PCOS"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Message</label>
                <textarea 
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 transition-colors resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Tell us a little about your query..."
                ></textarea>
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white py-4 rounded-xl shadow-lg hover:shadow-brand-500/25 transition-all"
              >
                {isSubmitting ? 'Sending Request...' : 'Request Appointment'}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>

        </div>
      </div>
      <div className="mt-20">
        <InstagramFeed />
      </div>
    </div>
  );
}
