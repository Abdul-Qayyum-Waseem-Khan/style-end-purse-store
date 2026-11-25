import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../api/axios';
import { sessionCache } from '../../utils/sessionCache';
import { Button } from '../../app/components/ui/button';
import {
  Upload,
  Trash2,
  Edit,
  Monitor,
  Smartphone,
  Plus,
  CheckCircle2,
  EyeOff,
  Link2,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';

interface HeroSlideData {
  _id?: string;
  templateId?: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  imageUrl?: string;
  imageAlt: string;
  sortOrder: number;
  showTextOverlay: boolean;
  eyebrow: string;
  title: string;
  buttonText: string;
  buttonLink: string;
  buttonPosition: 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center';
  isActive: boolean;
}

const ADMIN_HERO_CACHE_KEY = 'admin_hero_banners';

const EMPTY_FORM: Omit<HeroSlideData, '_id'> = {
  templateId: 'responsive-carousel',
  desktopImageUrl: '',
  mobileImageUrl: '',
  imageAlt: 'Style End Purse Collection',
  sortOrder: 0,
  showTextOverlay: false,
  eyebrow: '',
  title: '',
  buttonText: '',
  buttonLink: '',
  buttonPosition: 'bottom-left',
  isActive: true,
};

const QUICK_LINKS = [
  { label: 'All Products', value: '/category/all' },
  { label: 'Handbags', value: '/category/handbags' },
  { label: 'Shoes & Heels', value: '/category/shoes' },
  { label: 'Pouches', value: '/category/pouches' },
  { label: '3-Piece Sets', value: '/category/sets' },
];

export function HeroBannerManager() {
  const [banners, setBanners] = useState<HeroSlideData[]>(() => {
    return sessionCache.get<HeroSlideData[]>(ADMIN_HERO_CACHE_KEY) || [];
  });
  const [loading, setLoading] = useState(() => !sessionCache.get<HeroSlideData[]>(ADMIN_HERO_CACHE_KEY));
  const [saving, setSaving] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<HeroSlideData, '_id'>>(EMPTY_FORM);

  const fetchBanners = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const { data } = await api.get('/api/hero-banner/all');
      const list = Array.isArray(data) ? data : [];
      setBanners(list);
      sessionCache.set(ADMIN_HERO_CACHE_KEY, list);
    } catch {
      toast.error('Failed to load hero slides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = sessionCache.get<HeroSlideData[]>(ADMIN_HERO_CACHE_KEY);
    if (cached) {
      setBanners(cached);
      setLoading(false);
      if (!sessionCache.isFresh(ADMIN_HERO_CACHE_KEY, 1000 * 60 * 5)) {
        fetchBanners(true);
      }
    } else {
      fetchBanners(false);
    }
  }, []);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'desktopImageUrl' | 'mobileImageUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setLoader = target === 'desktopImageUrl' ? setUploadingDesktop : setUploadingMobile;
    setLoader(true);
    const form = new FormData();
    form.append('image', file);

    try {
      const { data } = await api.post('/api/upload/banner-image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({
        ...prev,
        [target]: data.imageUrl,
        ...(target === 'desktopImageUrl' ? { imageUrl: data.imageUrl } : {}),
      }));
      toast.success(`${target === 'desktopImageUrl' ? 'Desktop' : 'Mobile'} image uploaded`);
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setLoader(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.desktopImageUrl.trim() && !formData.mobileImageUrl.trim()) {
      toast.error('Please upload at least a Desktop or Mobile banner image');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        templateId: 'responsive-carousel',
        imageUrl: formData.desktopImageUrl || formData.mobileImageUrl,
      };
      if (editingId) {
        await api.put(`/api/hero-banner/update/${editingId}`, payload);
        toast.success('Hero slide updated');
      } else {
        await api.post('/api/hero-banner/create', payload);
        toast.success('Hero slide created');
      }
      sessionCache.invalidate('admin_hero_banners');
      sessionCache.invalidate('hero_active_slides');
      setEditingId(null);
      setFormData(EMPTY_FORM);
      fetchBanners(false);
    } catch {
      toast.error('Failed to save hero slide');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await api.put(`/api/hero-banner/toggle/${id}`);
      sessionCache.invalidate('admin_hero_banners');
      sessionCache.invalidate('hero_active_slides');
      toast.success('Slide visibility updated');
      fetchBanners(true);
    } catch {
      toast.error('Failed to update slide status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hero slide?')) return;
    try {
      await api.delete(`/api/hero-banner/${id}`);
      sessionCache.invalidate('admin_hero_banners');
      sessionCache.invalidate('hero_active_slides');
      toast.success('Hero slide deleted');
      if (editingId === id) {
        setEditingId(null);
        setFormData(EMPTY_FORM);
      }
      fetchBanners(true);
    } catch {
      toast.error('Failed to delete slide');
    }
  };

  const editSlide = (slide: HeroSlideData) => {
    setEditingId(slide._id || null);
    setFormData({
      templateId: 'responsive-carousel',
      desktopImageUrl: slide.desktopImageUrl || slide.imageUrl || '',
      mobileImageUrl: slide.mobileImageUrl || '',
      imageUrl: slide.imageUrl || slide.desktopImageUrl || '',
      imageAlt: slide.imageAlt || 'Style End Purse Collection',
      sortOrder: slide.sortOrder ?? 0,
      showTextOverlay: Boolean(slide.showTextOverlay),
      eyebrow: slide.eyebrow || '',
      title: slide.title || '',
      buttonText: slide.buttonText || '',
      buttonLink: slide.buttonLink || '',
      buttonPosition: slide.buttonPosition || 'bottom-left',
      isActive: slide.isActive ?? true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCount = banners.filter((b) => b.isActive).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#A67C38]" />
            Hero Carousel &amp; Responsive Banners
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload separate Desktop &amp; Mobile images for crisp display. Multiple active slides automatically run as a smooth carousel.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-xs text-xs font-semibold text-[#111111] shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {activeCount} Live Carousel {activeCount === 1 ? 'Slide' : 'Slides'}
        </div>
      </div>

      {/* Recommended Resolution Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#C5A880]/30 flex items-start gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#111111] text-[#C5A880] flex items-center justify-center shrink-0">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111111]">Desktop Banner Resolution</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Recommended: <strong className="text-[#111111]">1920 × 700 px</strong> (Aspect Ratio <strong className="text-[#A67C38]">16:6</strong> Landscape)
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Shown on laptops &amp; desktop screens (md and above).</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#C5A880]/30 flex items-start gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#111111] text-[#C5A880] flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111111]">Mobile Banner Resolution</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Recommended: <strong className="text-[#111111]">800 × 1000 px</strong> (Aspect Ratio <strong className="text-[#A67C38]">4:5</strong> Portrait)
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Shown on mobile phones. Falls back to Desktop image if left empty.</p>
          </div>
        </div>
      </div>

      {/* Create / Edit Slide Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 sm:p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
            {editingId ? <Edit className="w-4 h-4 text-[#A67C38]" /> : <Plus className="w-4 h-4 text-[#A67C38]" />}
            {editingId ? 'Edit Hero Slide' : 'Add New Hero Carousel Slide'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setFormData(EMPTY_FORM); }}
              className="text-xs font-semibold text-gray-500 hover:text-black"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* Dual Image Uploaders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Desktop Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-[#A67C38]" />
                Desktop Image (1920 × 700 px)
              </label>
              <span className="text-[11px] font-mono text-gray-400">16:6 Ratio</span>
            </div>
            <div className="relative aspect-[16/6] w-full rounded-xl border-2 border-dashed border-gray-200 bg-[#FAF8F5] overflow-hidden flex items-center justify-center group">
              {formData.desktopImageUrl ? (
                <img src={formData.desktopImageUrl} alt="Desktop Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
                  <p className="text-xs text-gray-500 font-medium">Upload 1920 × 700 px image</p>
                </div>
              )}
              <label className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-semibold gap-2">
                <Upload className="w-4 h-4" />
                {uploadingDesktop ? 'Uploading...' : formData.desktopImageUrl ? 'Replace Desktop Image' : 'Upload Desktop Image'}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'desktopImageUrl')} disabled={uploadingDesktop} />
              </label>
            </div>
            <input
              type="text"
              placeholder="Or paste Desktop Image URL..."
              value={formData.desktopImageUrl}
              onChange={(e) => setFormData({ ...formData, desktopImageUrl: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#111111]"
            />
          </div>

          {/* Mobile Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#A67C38]" />
                Mobile Image (800 × 1000 px)
              </label>
              <span className="text-[11px] font-mono text-gray-400">4:5 Ratio</span>
            </div>
            <div className="flex justify-center bg-[#FAF8F5] rounded-xl border-2 border-dashed border-gray-200 p-2">
              <div className="relative w-36 aspect-[4/5] rounded-lg overflow-hidden bg-white border border-gray-200 flex items-center justify-center group">
                {formData.mobileImageUrl ? (
                  <img src={formData.mobileImageUrl} alt="Mobile Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2">
                    <ImageIcon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-400">800 × 1000 px</p>
                  </div>
                )}
                <label className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-[11px] font-semibold text-center p-2">
                  {uploadingMobile ? 'Uploading...' : 'Upload Mobile'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'mobileImageUrl')} disabled={uploadingMobile} />
                </label>
              </div>
            </div>
            <input
              type="text"
              placeholder="Or paste Mobile Image URL (optional)..."
              value={formData.mobileImageUrl}
              onChange={(e) => setFormData({ ...formData, mobileImageUrl: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#111111]"
            />
          </div>
        </div>

        {/* Optional Navigation Button */}
        <div className="bg-[#FAF8F5] rounded-xl p-4 border border-gray-200/80 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[#A67C38]" />
              Navigation Button <span className="text-gray-400 font-normal normal-case">(Optional — leave blank if you only want the image)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Button Text</label>
              <input
                type="text"
                placeholder="e.g. Shop Handbags"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#111111]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Button Link</label>
              <input
                type="text"
                placeholder="e.g. /category/handbags"
                value={formData.buttonLink}
                onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#111111]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Button Position</label>
              <select
                value={formData.buttonPosition}
                onChange={(e) => setFormData({ ...formData, buttonPosition: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#111111]"
              >
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="center">Center</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-gray-500 mr-1">Quick Links:</span>
            {QUICK_LINKS.map((q) => (
              <button
                key={q.value}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, buttonLink: q.value }))}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-gray-200 hover:border-[#111111] text-gray-700 transition-colors"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Slide Settings & Optional Text Overlay */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Slide Order (0 = First)</label>
            <input
              type="number"
              min={0}
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#111111]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Image Alt Text (SEO)</label>
            <input
              type="text"
              value={formData.imageAlt}
              onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#111111]"
            />
          </div>
          <div className="flex items-center gap-4 pb-2">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              Show in Carousel
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showTextOverlay}
                onChange={(e) => setFormData({ ...formData, showTextOverlay: e.target.checked })}
                className="rounded border-gray-300"
              />
              Text Overlay
            </label>
          </div>
        </div>

        {formData.showTextOverlay && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Eyebrow Label (Optional)</label>
              <input
                type="text"
                placeholder="e.g. NEW SEASON • ATELIER"
                value={formData.eyebrow}
                onChange={(e) => setFormData({ ...formData, eyebrow: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Heading Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Signature Leather Totes"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving || uploadingDesktop || uploadingMobile}
            className="bg-[#111111] hover:bg-black text-white px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider"
          >
            {saving ? 'Saving...' : editingId ? 'Update Slide' : 'Add Slide to Carousel'}
          </Button>
        </div>
      </form>

      {/* Saved Slides List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#111111]">All Carousel Slides ({banners.length})</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-white border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 text-sm text-gray-500">
            No hero slides yet. Upload your first Desktop &amp; Mobile banner above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {banners.map((slide) => (
              <div
                key={slide._id}
                className={`bg-white rounded-2xl border p-4 shadow-xs transition-all flex flex-col justify-between gap-4 ${
                  slide.isActive ? 'border-[#C5A880]/60' : 'border-gray-200 opacity-75'
                }`}
              >
                <div className="flex gap-3 items-start">
                  {/* Desktop Thumbnail */}
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-semibold uppercase text-gray-400 flex items-center gap-1">
                      <Monitor className="w-3 h-3" /> Desktop
                    </span>
                    <div className="aspect-[16/6] rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      {(slide.desktopImageUrl || slide.imageUrl) ? (
                        <img
                          src={slide.desktopImageUrl || slide.imageUrl}
                          alt={slide.imageAlt || 'Desktop'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                      )}
                    </div>
                  </div>

                  {/* Mobile Thumbnail */}
                  <div className="w-20 shrink-0 space-y-1">
                    <span className="text-[10px] font-semibold uppercase text-gray-400 flex items-center gap-1">
                      <Smartphone className="w-3 h-3" /> Mobile
                    </span>
                    <div className="aspect-[4/5] rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      {slide.mobileImageUrl ? (
                        <img src={slide.mobileImageUrl} alt={slide.imageAlt || 'Mobile'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400 text-center px-1">Uses Desktop</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        slide.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {slide.isActive ? <CheckCircle2 className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {slide.isActive ? 'Live in Carousel' : 'Hidden'}
                      </span>
                      <span className="text-[11px] text-gray-400">Order: {slide.sortOrder ?? 0}</span>
                    </div>
                    {slide.buttonText && (
                      <p className="text-[11px] text-gray-500">
                        Button: <strong>{slide.buttonText}</strong> &rarr; {slide.buttonLink}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => slide._id && handleToggleActive(slide._id)}
                      className="text-xs h-8"
                    >
                      {slide.isActive ? 'Hide' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editSlide(slide)}
                      className="text-xs h-8 px-2.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => slide._id && handleDelete(slide._id)}
                      className="text-xs h-8 px-2.5 text-red-600 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
