import { useState } from 'react';
import { useBanners, Banner } from '../../hooks/useBanners';
import { useProducts } from '../../hooks/useProducts';
import { Button } from '../../app/components/ui/button';
import { Badge } from '../../app/components/ui/badge';
import { Plus, Edit, Trash2, Image as ImageIcon, Flame, Clock, Sparkles, Eye, Check, ArrowRight, Package, Gift, Layout, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';
import { LuxuryCardFlashAd } from '../../components/flashAds/LuxuryCardFlashAd';
import { StickyTimerBar } from '../../components/flashAds/StickyTimerBar';
import { GlassFloatingFlashBadge } from '../../components/flashAds/GlassFloatingFlashBadge';
import { TickerBarAd } from '../../components/flashAds/TickerBarAd';

const TEMPLATES = [
  {
    id: 'luxury_card',
    name: 'Luxury Split Card',
    description: 'High-impact showcase with live countdown, stock progress bar, product image, and price badges.',
    badge: 'Homepage Spotlight',
  },
  {
    id: 'sticky_bar',
    name: 'Sticky Countdown Bar',
    description: 'Header urgency banner with pulsing live dot, synchronized countdown boxes, and quick CTA.',
    badge: 'Top Urgency Bar',
  },
  {
    id: 'glass_floating',
    name: 'Floating Gift Box Widget',
    description: 'Animated wobbling mystery gift box in the corner that unboxes on click.',
    badge: 'Corner Gift Box',
  },
  {
    id: 'ticker_bar',
    name: 'Editorial Ticker Bar',
    description: 'Sleek luxury marquee ticker with announcement copy and live hours/mins ticker.',
    badge: 'Announcement Marquee',
  },
];

const THEMES = [
  { id: 'gold-noir', name: 'Gold & Noir', bg: 'bg-neutral-900 border-amber-500/40 text-amber-300' },
  { id: 'rose-gold', name: 'Rose Atelier', bg: 'bg-[#201518] border-rose-400/40 text-rose-300' },
  { id: 'emerald-chic', name: 'Royal Emerald', bg: 'bg-[#0b1a15] border-emerald-500/40 text-emerald-300' },
  { id: 'obsidian', name: 'Obsidian Minimal', bg: 'bg-black border-white/30 text-white' },
];

const PLACEMENT_OPTIONS = [
  {
    id: 'top_header',
    label: 'Top Header Bar',
    description: 'Urgency countdown bar or announcement ticker at top of page',
    icon: Layout,
  },
  {
    id: 'mid_page',
    label: 'Mid-Page Spotlight Card',
    description: 'High-converting luxury split flash sale card in homepage flow',
    icon: Flame,
  },
  {
    id: 'gift_box',
    label: 'Floating Mystery Gift Box',
    description: 'Interactive shaking 3D gift box in bottom corner that unboxes on tap',
    icon: Gift,
  },
];

export function BannersPage() {
  const { banners, isLoading, createBanner, updateBanner, deleteBanner } = useBanners({ admin: true });
  const { products } = useProducts({ limit: 100 });

  const [isEditing, setIsEditing] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Partial<Banner> | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);

  const handleEdit = (banner: Banner) => {
    setCurrentBanner({
      ...banner,
      placements: banner.placements && banner.placements.length > 0 
        ? banner.placements 
        : ['top_header', 'mid_page', 'gift_box']
    });
    setNewImageFile(null);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this ad/banner?')) {
      await deleteBanner(id);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    await updateBanner(banner._id, { isActive: !banner.isActive });
  };

  const setQuickExpiry = (hoursFromNow: number) => {
    const target = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
    setCurrentBanner(prev => ({
      ...prev,
      endDate: target.toISOString().slice(0, 16)
    }));
  };

  const togglePlacement = (placementId: string) => {
    if (!currentBanner) return;
    const currentPlacements = currentBanner.placements || ['top_header', 'mid_page', 'gift_box'];
    let updated: string[];
    if (currentPlacements.includes(placementId)) {
      updated = currentPlacements.filter(p => p !== placementId);
    } else {
      updated = [...currentPlacements, placementId];
    }
    setCurrentBanner({ ...currentBanner, placements: updated });
  };

  const handleSelectProduct = (productId: string) => {
    if (!productId) return;
    const prod = products.find(p => (p.id || (p as any)._id) === productId);
    if (!prod) return;

    const originalVal = prod.price || 0;
    const saleVal = Math.round(originalVal * 0.65); // 35% off default calculation
    const imgUrl = prod.images?.[0]?.url || prod.images?.[0] || '';

    setCurrentBanner(prev => ({
      ...prev,
      productId: prod.id || (prod as any)._id,
      title: prod.name,
      subtitle: (prod as any).shortDescription || prod.description?.slice(0, 95) || 'Handcrafted luxury piece with signature hardware and complimentary shipping.',
      image: imgUrl,
      link: `/product/${prod.slug}`,
      originalPrice: `PKR ${originalVal.toLocaleString()}`,
      salePrice: `PKR ${saleVal.toLocaleString()}`,
      discountOffer: 'FLAT 35% OFF',
      buttonText: 'Claim Special Deal',
      badgeText: 'EXCLUSIVE PROMOTION',
      stockPercent: 84
    }));

    toast.success(`Loaded product "${prod.name}" into Special Ad!`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    
    if (newImageFile && newImageFile.size > 4.5 * 1024 * 1024) {
      toast.error('Image is too large. Maximum size allowed is 4.5MB.');
      return;
    }
    
    setIsSaving(true);
    const formData = new FormData();
    if (newImageFile) formData.append('image', newImageFile);
    if (currentBanner?.title) formData.append('title', currentBanner.title);
    if (currentBanner?.subtitle) formData.append('subtitle', currentBanner.subtitle);
    if (currentBanner?.buttonText) formData.append('buttonText', currentBanner.buttonText);
    if (currentBanner?.link) formData.append('link', currentBanner.link);
    if (currentBanner?.badgeText) formData.append('badgeText', currentBanner.badgeText);
    if (currentBanner?.discountOffer) formData.append('discountOffer', currentBanner.discountOffer);
    if (currentBanner?.originalPrice) formData.append('originalPrice', currentBanner.originalPrice);
    if (currentBanner?.salePrice) formData.append('salePrice', currentBanner.salePrice);
    if (currentBanner?.stockPercent !== undefined) formData.append('stockPercent', String(currentBanner.stockPercent));
    if (currentBanner?.type) formData.append('type', currentBanner.type);
    if (currentBanner?.templateDesign) formData.append('templateDesign', currentBanner.templateDesign);
    if (currentBanner?.colorTheme) formData.append('colorTheme', currentBanner.colorTheme);
    if (currentBanner?.endDate) formData.append('endDate', currentBanner.endDate);
    if (currentBanner?.colorGradient) formData.append('colorGradient', currentBanner.colorGradient);
    if (currentBanner?.productId) formData.append('productId', currentBanner.productId);
    
    const placementsToSave = currentBanner?.placements || ['top_header', 'mid_page', 'gift_box'];
    formData.append('placements', JSON.stringify(placementsToSave));

    formData.append('isActive', String(currentBanner?.isActive || false));
    formData.append('order', String(currentBanner?.order || 0));

    let success = false;
    if (currentBanner?._id) {
      success = await updateBanner(currentBanner._id, formData);
    } else {
      success = await createBanner(formData);
    }

    if (success) {
      setIsEditing(false);
      setCurrentBanner(null);
      setNewImageFile(null);
    }
    setIsSaving(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white p-6 rounded-3xl border border-amber-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              SPECIAL ADS & PRODUCT PROMOTIONS ENGINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-normal text-white">
            Flash Ads & Placement Studio
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Select products from inventory, configure countdown timers, and choose exactly where to display the ad: <strong>Top Header Bar</strong>, <strong>Mid-Page Card</strong>, and <strong>Animated Gift Box</strong>.
          </p>
        </div>

        <Button 
          className="bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-amber-500/20"
          onClick={() => {
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
            setCurrentBanner({ 
              type: 'flash_sale', 
              templateDesign: 'luxury_card',
              colorTheme: 'gold-noir',
              badgeText: 'FLASH DROP • 24 HOURS ONLY',
              title: 'Midnight Atelier Flash Drop',
              subtitle: 'Exclusive luxury handbag pairs with complimentary doorstep inspection',
              discountOffer: 'FLAT 40% OFF',
              originalPrice: 'PKR 8,500',
              salePrice: 'PKR 4,950',
              stockPercent: 82,
              endDate: tomorrow,
              buttonText: 'Claim Flash Deal',
              link: '/category/handbags',
              placements: ['top_header', 'mid_page', 'gift_box'],
              isActive: true, 
              order: 0, 
              image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80' 
            });
            setNewImageFile(null);
            setIsEditing(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Special Ad
        </Button>
      </div>

      {/* Editor & Live Preview Modal/Section */}
      {isEditing && currentBanner ? (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          
          <div className="bg-gray-50/80 px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-base font-bold text-gray-900 font-serif-luxury">
                {currentBanner._id ? 'Edit Special Ad & Placements' : 'Create New Special Ad Campaign'}
              </h2>
            </div>
            
            <button
              type="button"
              onClick={() => setShowLivePreview(!showLivePreview)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white px-3 py-1.5 rounded-xl border shadow-xs hover:bg-gray-100"
            >
              <Eye className="w-3.5 h-3.5" />
              {showLivePreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>

          {/* Live Preview Box */}
          {showLivePreview && (
            <div className="bg-[#0c0c0c] p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-widest text-amber-400/80 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Live Component Preview
                </span>
                <span className="text-[11px] text-gray-400">
                  Template: <span className="text-white font-mono">{currentBanner.templateDesign || 'luxury_card'}</span>
                </span>
              </div>

              <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40 p-2">
                {currentBanner.templateDesign === 'sticky_bar' ? (
                  <StickyTimerBar banner={currentBanner as Banner} />
                ) : currentBanner.templateDesign === 'ticker_bar' ? (
                  <TickerBarAd banner={currentBanner as Banner} />
                ) : currentBanner.templateDesign === 'glass_floating' ? (
                  <div className="relative h-64 flex items-center justify-center">
                    <p className="text-xs text-gray-400 absolute top-2 left-2">Animated Gift Box Preview (Anchored at corner on storefront):</p>
                    <GlassFloatingFlashBadge banner={currentBanner as Banner} />
                  </div>
                ) : (
                  <LuxuryCardFlashAd banner={currentBanner as Banner} />
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSave} className="p-6 lg:p-8 space-y-7">
            
            {/* STEP 1: SELECT PRODUCT FROM STORE INVENTORY */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50/70 via-amber-50/40 to-transparent border border-amber-200/80">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-amber-700" />
                <label className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Step 1: Pick Product from Store Inventory (Auto-Fills Details)
                </label>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Select any product to instantly populate its title, image, price, and direct product link:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <select
                    className="w-full px-4 py-2.5 border rounded-xl bg-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500 shadow-xs"
                    value={currentBanner.productId || ''}
                    onChange={(e) => handleSelectProduct(e.target.value)}
                  >
                    <option value="">-- Choose a Product from Catalog ({products.length} available) --</option>
                    {products.map((prod) => (
                      <option key={prod.id || (prod as any)._id} value={prod.id || (prod as any)._id}>
                        {prod.name} — PKR {(prod.price || 0).toLocaleString()} ({typeof prod.category === 'object' ? prod.category?.name : prod.category || 'Collection'})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="sm:col-span-4 flex items-center">
                  <span className="text-xs text-amber-800 font-semibold">
                    {currentBanner.productId ? '✅ Product Linked' : '💡 Or fill manually below'}
                  </span>
                </div>
              </div>
            </div>

            {/* STEP 2: CHOOSE DISPLAY PLACEMENTS */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Layout className="w-4 h-4 text-gray-700" />
                <label className="text-xs font-bold uppercase tracking-wider text-gray-800">
                  Step 2: Choose Where to Display This Special Ad
                </label>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                The ad will automatically render across all selected placements simultaneously:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PLACEMENT_OPTIONS.map((placement) => {
                  const isChecked = (currentBanner.placements || ['top_header', 'mid_page', 'gift_box']).includes(placement.id);
                  const Icon = placement.icon;
                  return (
                    <button
                      type="button"
                      key={placement.id}
                      onClick={() => togglePlacement(placement.id)}
                      className={`text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 relative cursor-pointer ${
                        isChecked 
                          ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-2 ring-amber-500/20' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className={`mt-0.5 p-1.5 rounded-lg ${isChecked ? 'bg-amber-500 text-black' : 'bg-gray-100 text-gray-500'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-gray-900">{placement.label}</h4>
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-amber-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-300 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{placement.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: TEMPLATE DESIGN & THEME */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Step 3: Primary Template Archetype
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {TEMPLATES.map((tmpl) => {
                    const isSelected = (currentBanner.templateDesign || 'luxury_card') === tmpl.id;
                    return (
                      <button
                        type="button"
                        key={tmpl.id}
                        onClick={() => {
                          const newType = tmpl.id === 'ticker_bar' ? 'top_bar' : 'flash_sale';
                          setCurrentBanner({ ...currentBanner, templateDesign: tmpl.id, type: newType });
                        }}
                        className={`text-left p-3 rounded-xl border transition-all relative ${
                          isSelected 
                            ? 'border-amber-500 bg-amber-50/40 shadow-xs font-semibold' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <span className="text-[9.5px] font-bold uppercase text-amber-700 block mb-0.5">
                          {tmpl.badge}
                        </span>
                        <h5 className="text-xs font-bold text-gray-900">{tmpl.name}</h5>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Step 4: Luxury Theme Palette
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {THEMES.map((th) => {
                    const isSelected = (currentBanner.colorTheme || 'gold-noir') === th.id;
                    return (
                      <button
                        type="button"
                        key={th.id}
                        onClick={() => setCurrentBanner({ ...currentBanner, colorTheme: th.id })}
                        className={`p-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${th.bg} ${
                          isSelected ? 'ring-2 ring-offset-2 ring-black scale-102 shadow-md' : 'opacity-85 hover:opacity-100'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-current" />
                        <span className="truncate">{th.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* STEP 4: AD COPY & PRICING DETAILS */}
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Step 5: Copywriting & Urgency Controls
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Badge Eyebrow Text</label>
                  <input 
                    type="text" 
                    className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 text-sm"
                    placeholder="e.g. FLASH DROP • 24 HOURS ONLY"
                    value={currentBanner.badgeText || ''}
                    onChange={(e) => setCurrentBanner({ ...currentBanner, badgeText: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Tag</label>
                  <input 
                    type="text" 
                    className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 text-sm"
                    placeholder="e.g. FLAT 40% OFF"
                    value={currentBanner.discountOffer || ''}
                    onChange={(e) => setCurrentBanner({ ...currentBanner, discountOffer: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Promotion Title *</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 text-sm font-medium"
                    placeholder="e.g. Midnight Atelier Flash Drop: Pearl Clutch"
                    value={currentBanner.title || ''}
                    onChange={(e) => setCurrentBanner({ ...currentBanner, title: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Subtitle / Offer Description</label>
                  <textarea 
                    rows={2}
                    className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 text-sm"
                    placeholder="e.g. Handcrafted designer leather purse with complimentary doorstep inspection..."
                    value={currentBanner.subtitle || ''}
                    onChange={(e) => setCurrentBanner({ ...currentBanner, subtitle: e.target.value })}
                  />
                </div>
              </div>

              {/* Pricing & Expiry Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Special Flash Price</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono font-bold"
                    placeholder="PKR 4,950"
                    value={currentBanner.salePrice || ''}
                    onChange={(e) => setCurrentBanner({ ...currentBanner, salePrice: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Original Price</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                    placeholder="PKR 8,500"
                    value={currentBanner.originalPrice || ''}
                    onChange={(e) => setCurrentBanner({ ...currentBanner, originalPrice: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Stock Allocation ({currentBanner.stockPercent || 80}%)
                  </label>
                  <input 
                    type="range" 
                    min="0"
                    max="100"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
                    value={currentBanner.stockPercent || 80}
                    onChange={(e) => setCurrentBanner({ ...currentBanner, stockPercent: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Offer End Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    value={currentBanner.endDate ? new Date(currentBanner.endDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setCurrentBanner({ ...currentBanner, endDate: e.target.value })}
                  />
                  <div className="flex gap-1.5 mt-1.5">
                    <button type="button" onClick={() => setQuickExpiry(24)} className="text-[10px] bg-white border px-1.5 py-0.5 rounded hover:bg-gray-100 font-mono">+24h</button>
                    <button type="button" onClick={() => setQuickExpiry(72)} className="text-[10px] bg-white border px-1.5 py-0.5 rounded hover:bg-gray-100 font-mono">+3d</button>
                    <button type="button" onClick={() => setQuickExpiry(168)} className="text-[10px] bg-white border px-1.5 py-0.5 rounded hover:bg-gray-100 font-mono">+7d</button>
                  </div>
                </div>
              </div>

              {/* Image & CTA Link */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Product Visual Image</label>
                  <div className="flex items-center gap-3">
                    {(newImageFile || currentBanner.image) && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border bg-gray-100 shrink-0">
                        <img 
                          src={newImageFile ? URL.createObjectURL(newImageFile) : currentBanner.image} 
                          alt="Ad visual" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewImageFile(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Button Text & Target Link</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                      placeholder="Claim Deal Now"
                      value={currentBanner.buttonText || ''}
                      onChange={(e) => setCurrentBanner({ ...currentBanner, buttonText: e.target.value })}
                    />
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                      placeholder="/product/example-bag"
                      value={currentBanner.link || ''}
                      onChange={(e) => setCurrentBanner({ ...currentBanner, link: e.target.value })}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={currentBanner.isActive}
                  onChange={(e) => setCurrentBanner({ ...currentBanner, isActive: e.target.checked })}
                  className="w-5 h-5 text-amber-500 rounded focus:ring-amber-400 accent-amber-500"
                />
                <span className="text-sm font-bold text-gray-900">
                  Active (Broadcast live on selected storefront placements)
                </span>
              </label>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={isSaving} 
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentBanner(null);
                    setNewImageFile(null);
                  }}
                  className="w-full sm:w-auto text-xs rounded-xl"
                >
                  Cancel
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={isSaving} 
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-xs px-6 rounded-xl shadow-md"
                >
                  {isSaving ? 'Saving...' : 'Save & Publish Special Ad'}
                </Button>
              </div>
            </div>

          </form>

        </div>
      ) : null}

      {/* Ads List Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="p-5 bg-gray-50/50 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-gray-900">Configured Special Ads ({banners.length})</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-3.5">Promoted Product / Ad</th>
                <th className="px-6 py-3.5">Active Placements</th>
                <th className="px-6 py-3.5">Offer & Prices</th>
                <th className="px-6 py-3.5">Timer Status</th>
                <th className="px-6 py-3.5">Broadcast</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading special ads...</td></tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Flame className="w-8 h-8 text-amber-400/50 mx-auto mb-2" />
                    <p className="font-semibold text-sm">No special ads configured</p>
                    <p className="text-xs text-gray-400 mt-1">Select a product from inventory and choose where to broadcast it.</p>
                  </td>
                </tr>
              ) : (
                banners.map((banner) => {
                  const placements = banner.placements || ['top_header', 'mid_page', 'gift_box'];
                  return (
                    <tr key={banner._id} className="hover:bg-amber-50/20 transition-colors">
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-900 border border-gray-200 shrink-0 flex items-center justify-center">
                            {banner.image ? (
                              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                            ) : (
                              <Flame className="w-5 h-5 text-amber-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 line-clamp-1">{banner.title || 'Untitled Ad'}</p>
                            <p className="text-[11px] text-gray-500 truncate max-w-xs">{banner.subtitle || banner.link}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {placements.includes('top_header') && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              Top Header
                            </span>
                          )}
                          {placements.includes('mid_page') && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              Mid Page
                            </span>
                          )}
                          {placements.includes('gift_box') && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                              Gift Box
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                            {banner.discountOffer || 'Special Deal'}
                          </span>
                          {(banner.salePrice || banner.originalPrice) && (
                            <p className="font-mono text-[11px] text-gray-700 mt-1 font-semibold">
                              {banner.salePrice} <span className="text-gray-400 line-through text-[10px]">{banner.originalPrice}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {banner.endDate ? (
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-600">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>{new Date(banner.endDate).toLocaleDateString()} {new Date(banner.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No expiration</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(banner)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                            banner.isActive 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-gray-100 text-gray-500 border border-gray-300'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${banner.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                          {banner.isActive ? 'Live' : 'Paused'}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(banner)}
                            className="h-8 w-8 p-0 text-gray-600 hover:text-black"
                            title="Edit Ad"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(banner._id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete Ad"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
