import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '../../api/axios';
import { useCategories } from '../../hooks/useCategories';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { ArrowLeft, UploadCloud, X, Plus, Trash2, Sparkles, Layers, Palette, ShieldCheck, Check } from 'lucide-react';
import { toast } from 'sonner';

// Predefined Luxury Color Palette
const LUXURY_PALETTE = [
  { name: 'Noir Obsidian', hex: '#111827' },
  { name: 'Champagne Gold', hex: '#B8924B' },
  { name: 'Cognac Saddle', hex: '#9A3412' },
  { name: 'Burgundy Velvet', hex: '#831843' },
  { name: 'Emerald Forest', hex: '#065F46' },
  { name: 'Pearl Ivory', hex: '#FDF8EE' },
  { name: 'Blush Rose', hex: '#FBCFE8' },
  { name: 'Midnight Navy', hex: '#1E1B4B' },
  { name: 'Slate Taupe', hex: '#4B5563' },
];

// Zod Schema for validation
const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  productType: z.enum(['single', 'bundle', 'set']).default('single'),
  shortDescription: z.string().max(250, 'Must be under 250 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  originalPrice: z.number().min(0, 'Original price must be a positive number'),
  discountPercentage: z.number().min(0, 'Cannot be negative').max(100, 'Cannot exceed 100%'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  SKU: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.string().optional(),
  material: z.string().optional(),
  hardware: z.string().optional(),
  lining: z.string().optional(),
  dimensions: z.object({
    length: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    strapDrop: z.string().optional(),
  }).optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  badges: z.object({
    authentic: z.object({
      title: z.string(),
      subtitle: z.string()
    }),
    delivery: z.object({
      title: z.string(),
      subtitle: z.string()
    })
  }),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ColorOption {
  name: string;
  hex: string;
  stock?: number;
}

interface SetOptionItem {
  name: string;
  price: number;
  comparePrice?: number;
  includedItems: string[];
  isDefault?: boolean;
}

export function ProductFormPage() {
  const { id } = useParams();
  const isEditMode = !!id && id !== 'new';
  const navigate = useNavigate();
  const { categories } = useCategories();
  
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [existingVideo, setExistingVideo] = useState<string | null>(null);
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

  // Dynamic Color Variants state
  const [colors, setColors] = useState<ColorOption[]>([
    { name: 'Noir Obsidian', hex: '#111827', stock: 10 },
    { name: 'Champagne Gold', hex: '#B8924B', stock: 10 },
  ]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#111827');

  // Dynamic Set / Bundle Options state
  const [setOptions, setSetOptions] = useState<SetOptionItem[]>([
    { name: 'Purse Only', price: 9500, comparePrice: 12000, includedItems: ['Luxury Handbag', 'Dust Bag'], isDefault: true },
    { name: 'Pouch Only', price: 3500, comparePrice: 4500, includedItems: ['Matching Zipper Pouch'], isDefault: false },
    { name: 'Complete 3-in-1 Set (Purse + Pouch + Wallet)', price: 14500, comparePrice: 18500, includedItems: ['Luxury Handbag', 'Matching Pouch', 'Artisan Card Wallet', 'Gold Chain Strap'], isDefault: false }
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      productType: 'single',
      description: '',
      shortDescription: '',
      SKU: '',
      category: '',
      tags: 'purse, handbag, luxury',
      material: 'Premium Italian Calfskin Leather',
      hardware: '24K Champagne Gold Plated Hardware',
      lining: 'Custom Monogram Silk Satin',
      dimensions: {
        length: '28 cm',
        width: '12 cm',
        height: '20 cm',
        strapDrop: '55 cm (Adjustable)'
      },
      isActive: true,
      isFeatured: false,
      originalPrice: 9500,
      discountPercentage: 15,
      stock: 25,
      badges: {
        authentic: { title: '100% Authentic', subtitle: 'Certified Artisan Leather' },
        delivery: { title: 'Express Delivery', subtitle: 'Cash on Delivery Available' }
      }
    }
  });

  const watchOriginalPrice = useWatch({ control, name: 'originalPrice', defaultValue: 9500 });
  const watchDiscountPercentage = useWatch({ control, name: 'discountPercentage', defaultValue: 15 });
  const calculatedPrice = watchOriginalPrice - (watchOriginalPrice * (watchDiscountPercentage || 0) / 100);

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await axiosInstance.get(`/api/v1/products/admin/all?id=${id}`);
      const product = data.data.find((p: any) => p._id === id || p.id === id);
      
      if (product) {
        const isDiscounted = product.comparePrice && product.comparePrice > product.price;
        const originalPrice = isDiscounted ? product.comparePrice : product.price;
        const discountPercentage = isDiscounted ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

        reset({
          name: product.name,
          productType: product.productType || 'single',
          shortDescription: product.shortDescription || '',
          description: product.description,
          originalPrice: originalPrice,
          discountPercentage: discountPercentage,
          stock: product.stock,
          SKU: product.SKU || '',
          category: product.category?._id || product.category,
          tags: product.tags?.join(', ') || '',
          material: product.material || 'Premium Italian Calfskin Leather',
          hardware: product.hardware || '24K Champagne Gold Plated Hardware',
          lining: product.lining || 'Custom Monogram Silk Satin',
          dimensions: {
            length: product.dimensions?.length || '',
            width: product.dimensions?.width || '',
            height: product.dimensions?.height || '',
            strapDrop: product.dimensions?.strapDrop || ''
          },
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          badges: {
            authentic: { 
              title: product.badges?.authentic?.title || '100% Authentic', 
              subtitle: product.badges?.authentic?.subtitle || 'Certified Artisan Leather' 
            },
            delivery: { 
              title: product.badges?.delivery?.title || 'Express Delivery', 
              subtitle: product.badges?.delivery?.subtitle || 'Cash on Delivery Available' 
            }
          }
        });

        if (product.colors && product.colors.length > 0) {
          setColors(product.colors);
        }
        if (product.setOptions && product.setOptions.length > 0) {
          setSetOptions(product.setOptions);
        }

        setExistingImages(product.images || []);
        setExistingVideo(product.video || null);
      }
    } catch (err) {
      toast.error('Failed to load luxury product');
    } finally {
      setIsLoading(false);
    }
  };

  // Color Variant Handlers
  const handleAddPaletteColor = (color: { name: string; hex: string }) => {
    if (colors.some(c => c.name.toLowerCase() === color.name.toLowerCase())) {
      toast.error(`${color.name} is already added.`);
      return;
    }
    setColors(prev => [...prev, { ...color, stock: 10 }]);
  };

  const handleAddCustomColor = () => {
    if (!newColorName.trim()) {
      toast.error('Please enter a color name');
      return;
    }
    setColors(prev => [...prev, { name: newColorName.trim(), hex: newColorHex, stock: 10 }]);
    setNewColorName('');
    setNewColorHex('#111827');
  };

  const handleRemoveColor = (index: number) => {
    setColors(prev => prev.filter((_, i) => i !== index));
  };

  // Set / Bundle Option Handlers
  const handleAddSetOption = () => {
    setSetOptions(prev => [
      ...prev,
      { name: 'New Set Option', price: 9500, comparePrice: 12000, includedItems: ['Handbag'], isDefault: false }
    ]);
  };

  const handleUpdateSetOption = (index: number, field: keyof SetOptionItem, value: any) => {
    setSetOptions(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      if (field === 'isDefault' && value === true) {
        return { ...item, isDefault: false };
      }
      return item;
    }));
  };

  const handleRemoveSetOption = (index: number) => {
    setSetOptions(prev => prev.filter((_, i) => i !== index));
  };

  // Image & File Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const totalImages = existingImages.length + newImageFiles.length + filesArray.length;
      
      if (totalImages > 8) {
        toast.error('You can upload up to 8 high-resolution images.');
        return;
      }

      setNewImageFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeVideo = () => {
    setNewVideoFile(null);
    setVideoPreviewUrl(null);
    setExistingVideo(null);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('productType', data.productType);
      formData.append('description', data.description);
      if (data.shortDescription) formData.append('shortDescription', data.shortDescription);
      
      const finalPrice = data.originalPrice - (data.originalPrice * (data.discountPercentage || 0) / 100);
      formData.append('price', finalPrice.toString());
      if (data.discountPercentage && data.discountPercentage > 0) {
        formData.append('comparePrice', data.originalPrice.toString());
      } else {
        formData.append('comparePrice', '');
      }
      
      formData.append('stock', data.stock.toString());
      if (data.SKU) formData.append('SKU', data.SKU);
      formData.append('category', data.category);
      if (data.tags) formData.append('tags', data.tags);
      if (data.material) formData.append('material', data.material);
      if (data.hardware) formData.append('hardware', data.hardware);
      if (data.lining) formData.append('lining', data.lining);
      
      if (data.dimensions) {
        formData.append('dimensions', JSON.stringify(data.dimensions));
      }

      formData.append('isActive', data.isActive.toString());
      formData.append('isFeatured', data.isFeatured.toString());
      
      if (data.badges) {
        formData.append('badges', JSON.stringify(data.badges));
      }

      // Append Colors & Set Options as JSON
      formData.append('colors', JSON.stringify(colors));
      formData.append('setOptions', JSON.stringify(setOptions));

      // Append existing and new images
      existingImages.forEach(img => {
        formData.append('existingImages', img);
      });

      if (existingImages.length === 0) {
        formData.append('existingImages', '');
      }

      newImageFiles.forEach(file => {
        formData.append('images', file);
      });

      if (existingVideo) {
        formData.append('video', existingVideo);
      }

      if (isEditMode) {
        await axiosInstance.put(`/api/v1/products/${id}`, formData);
        toast.success('Boutique masterpiece updated successfully!');
      } else {
        await axiosInstance.post('/api/v1/products', formData);
        toast.success('New luxury design created successfully!');
      }

      navigate('/admin/products');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to save luxury product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#B8924B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-[#F9FAFB] min-h-full pb-28 font-poppins text-gray-900">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Bar */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button 
              onClick={() => navigate('/admin/products')}
              className="flex items-center text-xs font-bold text-gray-500 hover:text-gray-900 mb-2 uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to Catalog
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {isEditMode ? 'Edit Luxury Design' : 'Create Luxury Creation'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Configure handbag silhouettes, color swatches, 3-in-1 combo sets, and atelier specifications.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* 1. Basic Information */}
          <Card className="border border-gray-200/80 rounded-2xl bg-white shadow-xs">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B8924B]" />
                <span>Basic Piece Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Design Name <span className="text-red-500">*</span></label>
                  <Input {...register('name')} placeholder="e.g. Monogram Quilted Leather Tote" className="h-10 text-xs rounded-xl" />
                  {errors.name && <p className="text-[11px] text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Category <span className="text-red-500">*</span></label>
                  <select 
                    {...register('category')}
                    className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs focus:ring-1 focus:ring-[#B8924B] focus:border-[#B8924B]"
                  >
                    <option value="">Select Boutique Category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-[11px] text-red-500">{errors.category.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Product Classification</label>
                  <select 
                    {...register('productType')}
                    className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs focus:ring-1 focus:ring-[#B8924B] focus:border-[#B8924B]"
                  >
                    <option value="single">Single Item (Purse / Pouch / Wallet)</option>
                    <option value="set">3-Piece Ensemble / Set (Purse + Pouch + Wallet)</option>
                    <option value="bundle">Curated Combo Capsule</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">SKU Code</label>
                  <Input {...register('SKU')} placeholder="SEP-PARIS-01" className="h-10 text-xs rounded-xl font-mono" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Short Editorial Subtitle</label>
                <Input {...register('shortDescription')} placeholder="e.g. Sculpted from Italian calfskin with 24K gold hardware accents." className="h-10 text-xs rounded-xl" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Atelier Story & Full Description <span className="text-red-500">*</span></label>
                <textarea 
                  {...register('description')} 
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-1 focus:ring-[#B8924B] focus:border-[#B8924B]"
                  placeholder="Detailed narrative regarding leather grain, construction, interior pockets, and styling versatility..."
                />
                {errors.description && <p className="text-[11px] text-red-500">{errors.description.message}</p>}
              </div>

            </CardContent>
          </Card>

          {/* 2. Color Variants & Swatches Manager */}
          <Card className="border border-gray-200/80 rounded-2xl bg-white shadow-xs">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#B8924B]" />
                  <span>Color Swatches & Options</span>
                </div>
                <span className="text-xs font-normal text-gray-500">
                  {colors.length} {colors.length === 1 ? 'Color' : 'Colors'} active
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              {/* Quick Palette Picker */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Quick Add Luxury Signature Colors:
                </p>
                <div className="flex flex-wrap gap-2">
                  {LUXURY_PALETTE.map((pal, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleAddPaletteColor(pal)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-[#B8924B] hover:shadow-xs transition-all text-xs text-gray-700 font-medium"
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-xs" style={{ backgroundColor: pal.hex }} />
                      <span>{pal.name}</span>
                      <Plus className="w-3 h-3 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Input */}
              <div className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200/80">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input 
                    type="color" 
                    value={newColorHex} 
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-gray-300" 
                  />
                  <Input 
                    placeholder="Custom Color Name (e.g. Bordeaux Wine)" 
                    value={newColorName} 
                    onChange={(e) => setNewColorName(e.target.value)} 
                    className="h-9 text-xs rounded-xl bg-white flex-1"
                  />
                </div>
                <Button 
                  type="button" 
                  onClick={handleAddCustomColor}
                  className="w-full sm:w-auto bg-[#111827] text-white text-xs font-bold uppercase tracking-wider h-9 px-4 rounded-xl"
                >
                  Add Custom Color
                </Button>
              </div>

              {/* Active Colors List */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
                  Active Swatches for this Product:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {colors.map((color, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white shadow-xs hover:border-[#B8924B] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span 
                          className="w-5 h-5 rounded-full border border-gray-300 shadow-xs shrink-0" 
                          style={{ backgroundColor: color.hex }} 
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900">{color.name}</p>
                          <span className="text-[10px] text-gray-400 font-mono">{color.hex}</span>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveColor(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Set & Bundle Pricing Matrix */}
          <Card className="border border-gray-200/80 rounded-2xl bg-white shadow-xs">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#B8924B]" />
                  <span>Set & Bundle Options (Purse, Pouch, Wallet Combos)</span>
                </div>
                <Button 
                  type="button" 
                  onClick={handleAddSetOption} 
                  variant="outline"
                  className="h-8 text-xs font-bold uppercase tracking-wider text-[#B8924B] border-[#B8924B]/40 rounded-full"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Option Tier
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <p className="text-xs text-gray-500">
                Allow customers to purchase either individual pieces (*Purse Only*, *Pouch Only*, *Wallet Only*) or complete 3-in-1 combo sets with special bundled pricing.
              </p>

              <div className="space-y-4">
                {setOptions.map((opt, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Option Tier Title</label>
                        <Input 
                          value={opt.name} 
                          onChange={(e) => handleUpdateSetOption(idx, 'name', e.target.value)}
                          placeholder="e.g. Complete 3-in-1 Set (Purse + Pouch + Wallet)"
                          className="h-9 text-xs font-bold rounded-xl bg-white"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSetOption(idx)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 mt-4"
                        title="Remove tier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-500">Selling Price (PKR)</label>
                        <Input 
                          type="number"
                          value={opt.price} 
                          onChange={(e) => handleUpdateSetOption(idx, 'price', Number(e.target.value))}
                          placeholder="9500"
                          className="h-9 text-xs rounded-xl bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-500">Compare Price (PKR)</label>
                        <Input 
                          type="number"
                          value={opt.comparePrice || ''} 
                          onChange={(e) => handleUpdateSetOption(idx, 'comparePrice', Number(e.target.value))}
                          placeholder="12000"
                          className="h-9 text-xs rounded-xl bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-500">Included Items (Comma separated)</label>
                        <Input 
                          value={opt.includedItems.join(', ')} 
                          onChange={(e) => handleUpdateSetOption(idx, 'includedItems', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                          placeholder="Handbag, Pouch, Card Wallet"
                          className="h-9 text-xs rounded-xl bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input 
                        type="checkbox"
                        id={`default-${idx}`}
                        checked={opt.isDefault || false}
                        onChange={(e) => handleUpdateSetOption(idx, 'isDefault', e.target.checked)}
                        className="w-4 h-4 rounded text-[#B8924B]"
                      />
                      <label htmlFor={`default-${idx}`} className="text-xs text-gray-700 font-medium cursor-pointer">
                        Set as Default pre-selected tier on Product Page
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4. Atelier Craftsmanship & Dimensions */}
          <Card className="border border-gray-200/80 rounded-2xl bg-white shadow-xs">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#B8924B]" />
                <span>Atelier Materials & Dimensions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Primary Material</label>
                  <Input {...register('material')} placeholder="Italian Calfskin Leather" className="h-10 text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Hardware Plating</label>
                  <Input {...register('hardware')} placeholder="24K Champagne Gold Plated" className="h-10 text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Interior Lining</label>
                  <Input {...register('lining')} placeholder="Custom Monogram Silk Satin" className="h-10 text-xs rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Length</label>
                  <Input {...register('dimensions.length')} placeholder="28 cm" className="h-9 text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Width</label>
                  <Input {...register('dimensions.width')} placeholder="12 cm" className="h-9 text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Height</label>
                  <Input {...register('dimensions.height')} placeholder="20 cm" className="h-9 text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Strap Drop</label>
                  <Input {...register('dimensions.strapDrop')} placeholder="55 cm (Adj.)" className="h-9 text-xs rounded-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Pricing & Stock Backup */}
          <Card className="border border-gray-200/80 rounded-2xl bg-white shadow-xs">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Base Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Base Catalog Price (PKR) <span className="text-red-500">*</span></label>
                  <Input type="number" {...register('originalPrice', { valueAsNumber: true })} className="h-10 text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Discount Percentage (%)</label>
                  <Input type="number" {...register('discountPercentage', { valueAsNumber: true })} className="h-10 text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Total Stock Units <span className="text-red-500">*</span></label>
                  <Input type="number" {...register('stock', { valueAsNumber: true })} className="h-10 text-xs rounded-xl" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FDF8EE] border border-[#B8924B]/30 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900">Calculated Default Base Price</p>
                  <p className="text-[11px] text-gray-500">Displayed when no specific set tier is active.</p>
                </div>
                <span className="text-lg font-extrabold text-[#B8924B]">
                  PKR {calculatedPrice.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 6. Product Photography */}
          <Card className="border border-gray-200/80 rounded-2xl bg-white shadow-xs">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Product Photography & Visuals</CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div 
                className="border-2 border-dashed border-gray-300 hover:border-[#B8924B] rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50/50 cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="w-10 h-10 text-[#B8924B] mb-3" />
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Click or drag images to upload</p>
                <p className="text-[11px] text-gray-500 mt-1">High-resolution JPG, PNG or WEBP (aspect 3:4 recommended)</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  multiple 
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleFileChange}
                />
              </div>

              {(existingImages.length > 0 || newImageFiles.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                  {existingImages.map((img, index) => (
                    <div key={`existing-${index}`} className="relative aspect-[3/4] rounded-xl border border-gray-200 overflow-hidden group">
                      <img src={img} alt="Product view" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  
                  {newImageFiles.map((file, index) => (
                    <div key={`new-${index}`} className="relative aspect-[3/4] rounded-xl border border-[#B8924B] overflow-hidden group">
                      <img src={URL.createObjectURL(file)} alt="New preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 7. Publishing Controls */}
          <Card className="border border-gray-200/80 rounded-2xl bg-white shadow-xs">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Publishing & Curation Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register('isActive')} className="w-4 h-4 rounded text-[#111827]" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Active (Live in Boutique)</p>
                    <p className="text-[11px] text-gray-500">Design will be publicly visible and purchasable.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register('isFeatured')} className="w-4 h-4 rounded text-[#B8924B]" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Featured in Hero / Top Curation</p>
                    <p className="text-[11px] text-gray-500">Showcase this design on the homepage.</p>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/products')}
              className="rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#111827] hover:bg-gray-800 text-white rounded-full px-8 py-3 text-xs font-bold uppercase tracking-wider shadow-sm"
            >
              {isSubmitting ? 'Saving Masterpiece...' : (isEditMode ? 'Save Changes' : 'Publish to Boutique')}
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
}
