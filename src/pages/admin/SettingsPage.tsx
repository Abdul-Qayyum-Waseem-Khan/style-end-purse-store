import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Save, Store, Truck, CreditCard, Gift, Shield, Sparkles } from 'lucide-react';
import { sessionCache } from '../../utils/sessionCache';

export function SettingsPage() {
  const [settings, setSettings] = useState({
    storeName: '',
    contactEmail: '',
    topBar: {
      enabled: true,
      leftText: 'Cash on Delivery Across Pakistan',
      centerText: 'Free shipping on orders above PKR 5,000',
      rightText: 'PKR (Rs.)',
    },
    brandPillars: [
      { title: 'Genuine Leather', description: 'Crafted from soft, durable leather built for everyday elegance.' },
      { title: 'Gold Hardware', description: 'Rust-resistant clasps and zippers with lasting finish.' },
      { title: 'Handcrafted Finish', description: 'Clean stitching and quality inspection on every piece.' },
    ],
    deliveryConfig: {
      isOverallFree: false,
      defaultRate: 200,
      ranges: [
        { min: 0, max: 2000, rate: 200 },
        { min: 2001, max: 99999999, rate: 0 }
      ]
    },
    taxPercentage: 0,
    showCustomerCount: true,
    instagramHandle: '',
    instagramPostUrls: '',
    facebookLink: '',
    instagramLink: '',
    linkedinLink: '',
    newsletterOfferTitle: 'Get 10% OFF Your First Order!',
    newsletterOfferSubtitle: 'Subscribe for exclusive offers and new collection updates.',
    newsletterDiscountCode: '',
    trustBadges: [
      { icon: 'Shield', title: '100% Authentic', subtitle: 'Quality checked handcrafted pieces' },
      { icon: 'Truck', title: 'Fast Delivery', subtitle: 'Nationwide delivery across Pakistan' },
      { icon: 'Gift', title: 'Complimentary Dust Bag', subtitle: 'Protective packaging with every handbag' }
    ],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get('/api/v1/admin/settings');
      // Merge fetched settings with default structure
      setSettings(prev => ({
        ...prev,
        ...data.data
      }));
    } catch (error) {
      console.error('Failed to fetch settings', error);
      toast.error('Failed to load global settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await axiosInstance.put('/api/v1/admin/settings', settings);
      sessionCache.invalidate('public_store_settings');
      toast.success('Global settings updated successfully!');
    } catch (error) {
      console.error('Failed to update settings', error);
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 bg-gray-50 min-h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-gray-700" />
            Global Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage your store's configuration and rules</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-orange-600 hover:bg-orange-700 shadow-sm"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Store Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2 font-semibold text-gray-900">
            <Store className="w-5 h-5 text-gray-500" />
            General Information
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                name="storeName"
                value={settings.storeName}
                onChange={handleChange}
                placeholder="e.g., Style End Purse"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={handleChange}
                placeholder="styleendpurse@gmail.com"
              />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="space-y-0.5">
                <Label htmlFor="showCustomerCount" className="text-base">Show Official Customer Count</Label>
                <p className="text-sm text-gray-500">
                  Display the total number of registered customers on the homepage
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="showCustomerCount"
                  name="showCustomerCount"
                  className="sr-only peer"
                  checked={settings.showCustomerCount}
                  onChange={handleChange}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Shipping & Tax */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2 font-semibold text-gray-900">
            <Truck className="w-5 h-5 text-gray-500" />
            Shipping & Tax Rules
          </div>
          <div className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-0.5">
                  <Label htmlFor="isOverallFree" className="text-base">Overall Free Delivery</Label>
                  <p className="text-sm text-gray-500">Enable this to apply free delivery across the entire store immediately.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="isOverallFree"
                    className="sr-only peer"
                    checked={settings.deliveryConfig?.isOverallFree || false}
                    onChange={(e) => setSettings(prev => ({ ...prev, deliveryConfig: { ...prev.deliveryConfig, isOverallFree: e.target.checked } }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-100">
                <Label>Delivery Ranges</Label>
                <p className="text-xs text-gray-500 mb-2">Define delivery charges based on cart subtotal ranges. (e.g. 0 to 2000 = Rs 200)</p>
                
                {settings.deliveryConfig?.ranges?.map((range: any, index: number) => (
                  <div key={index} className="flex flex-col sm:flex-row items-end gap-2 mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Min (Rs)</Label>
                      <Input 
                        type="number" min="0" value={range.min} 
                        onChange={(e) => {
                          const newRanges = [...settings.deliveryConfig.ranges];
                          newRanges[index].min = Number(e.target.value);
                          setSettings(prev => ({ ...prev, deliveryConfig: { ...prev.deliveryConfig, ranges: newRanges } }));
                        }} 
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Max (Rs)</Label>
                      <Input 
                        type="number" min="0" value={range.max} 
                        onChange={(e) => {
                          const newRanges = [...settings.deliveryConfig.ranges];
                          newRanges[index].max = Number(e.target.value);
                          setSettings(prev => ({ ...prev, deliveryConfig: { ...prev.deliveryConfig, ranges: newRanges } }));
                        }} 
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Fee (Rs)</Label>
                      <Input 
                        type="number" min="0" value={range.rate} 
                        onChange={(e) => {
                          const newRanges = [...settings.deliveryConfig.ranges];
                          newRanges[index].rate = Number(e.target.value);
                          setSettings(prev => ({ ...prev, deliveryConfig: { ...prev.deliveryConfig, ranges: newRanges } }));
                        }} 
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => {
                        const newRanges = settings.deliveryConfig.ranges.filter((_, i) => i !== index);
                        setSettings(prev => ({ ...prev, deliveryConfig: { ...prev.deliveryConfig, ranges: newRanges } }));
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    const newRanges = [...(settings.deliveryConfig?.ranges || []), { min: 0, max: 0, rate: 0 }];
                    setSettings(prev => ({ ...prev, deliveryConfig: { ...prev.deliveryConfig, ranges: newRanges } }));
                  }}
                  className="w-full mt-2 border-dashed"
                >
                  + Add Range
                </Button>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-100">
                <Label htmlFor="defaultRate">Default Delivery Fee (Rs)</Label>
                <Input
                  id="defaultRate"
                  type="number"
                  min="0"
                  value={settings.deliveryConfig?.defaultRate || 0}
                  onChange={(e) => setSettings(prev => ({ ...prev, deliveryConfig: { ...prev.deliveryConfig, defaultRate: Number(e.target.value) } }))}
                />
                <p className="text-xs text-gray-500">Fallback fee if cart doesn't match any range above.</p>
              </div>

              <div className="space-y-2 pt-6 border-t border-gray-100">
                <Label htmlFor="taxPercentage">Tax Percentage (%)</Label>
              <div className="relative">
                <Input
                  id="taxPercentage"
                  name="taxPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.taxPercentage}
                  onChange={handleChange}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Instagram Integration */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2 font-semibold text-gray-900">
            <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
            </svg>
            Instagram Integration
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="instagramHandle">Profile Handle</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                  <Input
                    id="instagramHandle"
                    name="instagramHandle"
                    value={settings.instagramHandle}
                    onChange={handleChange}
                    placeholder="styleendpurse"
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-gray-500">Your Instagram username without the @ symbol.</p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-100">
              <Label htmlFor="instagramPostUrls">Featured Post Embed Links or URLs</Label>
              <textarea
                id="instagramPostUrls"
                name="instagramPostUrls"
                value={settings.instagramPostUrls}
                onChange={handleChange}
                placeholder="https://www.instagram.com/p/XXXXX/&#10;https://www.instagram.com/p/YYYYY/"
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all resize-y text-sm"
              />
              <p className="text-xs text-gray-500">
                Paste the full URLs to the Instagram posts you want to showcase on the home page. Put each URL on a new line.
              </p>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2 font-semibold text-gray-900">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Social Links
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="facebookLink">Facebook Link</Label>
                <Input
                  id="facebookLink"
                  name="facebookLink"
                  value={settings.facebookLink}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagramLink">Instagram Link</Label>
                <Input
                  id="instagramLink"
                  name="instagramLink"
                  value={settings.instagramLink}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinLink">LinkedIn Link</Label>
                <Input
                  id="linkedinLink"
                  name="linkedinLink"
                  value={settings.linkedinLink}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Offer */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2 font-semibold text-gray-900">
            <Gift className="w-5 h-5 text-brand-600" />
            Newsletter Offer Section
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="newsletterOfferTitle">Offer Title</Label>
                <Input
                  id="newsletterOfferTitle"
                  name="newsletterOfferTitle"
                  value={settings.newsletterOfferTitle}
                  onChange={handleChange}
                  placeholder="e.g., Get 10% OFF Your First Order!"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newsletterDiscountCode">Discount Code (Sent to new subscribers)</Label>
                <Input
                  id="newsletterDiscountCode"
                  name="newsletterDiscountCode"
                  value={settings.newsletterDiscountCode}
                  onChange={handleChange}
                  placeholder="e.g., WELCOME10"
                />
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-100">
              <Label htmlFor="newsletterOfferSubtitle">Offer Subtitle</Label>
              <textarea
                id="newsletterOfferSubtitle"
                name="newsletterOfferSubtitle"
                value={settings.newsletterOfferSubtitle}
                onChange={handleChange}
                placeholder="Subscribe to our newsletter..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all resize-y text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Trust Badges */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2 font-semibold text-gray-900">
            <Shield className="w-5 h-5 text-brand-600" />
            Trust Badges (Homepage)
          </div>
          <div className="p-6 space-y-6">
            <p className="text-sm text-gray-500 mb-2">Manage the trust badges displayed on the homepage. You can use standard icon names (e.g., Shield, Truck, Users, Gift, Star, Zap, CheckCircle).</p>
            {settings.trustBadges?.map((badge, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-end gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1 space-y-2 w-full">
                  <Label>Icon Name</Label>
                  <Input 
                    value={badge.icon} 
                    onChange={(e) => {
                      const newBadges = [...(settings.trustBadges || [])];
                      newBadges[index].icon = e.target.value;
                      setSettings(prev => ({ ...prev, trustBadges: newBadges }));
                    }} 
                    placeholder="e.g. Shield"
                  />
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <Label>Title</Label>
                  <Input 
                    value={badge.title} 
                    onChange={(e) => {
                      const newBadges = [...(settings.trustBadges || [])];
                      newBadges[index].title = e.target.value;
                      setSettings(prev => ({ ...prev, trustBadges: newBadges }));
                    }} 
                    placeholder="e.g. Fast Delivery"
                  />
                </div>
                <div className="flex-[2] space-y-2 w-full">
                  <Label>Subtitle</Label>
                  <Input 
                    value={badge.subtitle} 
                    onChange={(e) => {
                      const newBadges = [...(settings.trustBadges || [])];
                      newBadges[index].subtitle = e.target.value;
                      setSettings(prev => ({ ...prev, trustBadges: newBadges }));
                    }} 
                    placeholder="Short description"
                  />
                </div>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => {
                    const newBadges = settings.trustBadges.filter((_, i) => i !== index);
                    setSettings(prev => ({ ...prev, trustBadges: newBadges }));
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200 w-full sm:w-auto"
                >
                  Remove
                </Button>
              </div>
            ))}
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                const newBadges = [...(settings.trustBadges || []), { icon: 'Star', title: 'New Badge', subtitle: 'Description' }];
                setSettings(prev => ({ ...prev, trustBadges: newBadges }));
              }}
              className="w-full mt-2 border-dashed"
            >
              + Add Trust Badge
            </Button>
          </div>
        </div>

        {/* Top Announcement Bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-[#111111]">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Top Announcement Bar</h2>
              <p className="text-sm text-gray-500">Manage the thin top bar above the navigation header</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.topBar?.enabled ?? true}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    topBar: { ...prev.topBar, enabled: e.target.checked },
                  }))
                }
                className="rounded border-gray-300"
              />
              Show Top Announcement Bar
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Left Text (Desktop)</Label>
                <Input
                  value={settings.topBar?.leftText || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      topBar: { ...prev.topBar, leftText: e.target.value },
                    }))
                  }
                  placeholder="Cash on Delivery Across Pakistan"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Center Text</Label>
                <Input
                  value={settings.topBar?.centerText || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      topBar: { ...prev.topBar, centerText: e.target.value },
                    }))
                  }
                  placeholder="Free shipping on orders above PKR 5,000"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Right Text (Desktop)</Label>
                <Input
                  value={settings.topBar?.rightText || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      topBar: { ...prev.topBar, rightText: e.target.value },
                    }))
                  }
                  placeholder="PKR (Rs.)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Homepage Brand Pillars */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-[#A67C38]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Homepage Brand Pillars</h2>
              <p className="text-sm text-gray-500">Manage the quality/brand cards shown on the storefront homepage</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {(settings.brandPillars || []).map((pillar, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1 space-y-1.5 w-full">
                  <Label>Heading</Label>
                  <Input
                    value={pillar.title}
                    onChange={(e) => {
                      const next = [...(settings.brandPillars || [])];
                      next[index] = { ...next[index], title: e.target.value };
                      setSettings((prev) => ({ ...prev, brandPillars: next }));
                    }}
                    placeholder="e.g. Genuine Leather"
                  />
                </div>
                <div className="flex-[2] space-y-1.5 w-full">
                  <Label>Short Note (Optional)</Label>
                  <Input
                    value={pillar.description}
                    onChange={(e) => {
                      const next = [...(settings.brandPillars || [])];
                      next[index] = { ...next[index], description: e.target.value };
                      setSettings((prev) => ({ ...prev, brandPillars: next }));
                    }}
                    placeholder="Short 1-line note"
                  />
                </div>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    const next = (settings.brandPillars || []).filter((_, i) => i !== index);
                    setSettings((prev) => ({ ...prev, brandPillars: next }));
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200 w-full sm:w-auto"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const next = [...(settings.brandPillars || []), { title: '', description: '' }];
                setSettings((prev) => ({ ...prev, brandPillars: next }));
              }}
              className="w-full border-dashed"
            >
              + Add Brand Pillar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
