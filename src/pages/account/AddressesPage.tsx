import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Plus, Trash2, Edit2, Loader2, Star, Home, Building2, Map, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../app/components/ui/dialog';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  addressLine1: z.string().min(5, 'Street address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/Province is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  isDefault: z.boolean().default(false),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export function AddressesPage() {
  const { fetchCurrentUser } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      isDefault: false,
    }
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const { data } = await axiosInstance.get('/api/v1/users/addresses');
      setAddresses(data.data || []);
    } catch (error) {
      console.error('Failed to fetch addresses', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (address: any) => {
    setEditingId(address._id);
    reset({
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    });
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    reset({
      fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', isDefault: false
    });
  };

  const onSubmit = async (data: AddressFormValues) => {
    try {
      setIsSaving(true);
      if (editingId) {
        await axiosInstance.put(`/api/v1/users/addresses/${editingId}`, data);
        toast.success('Address updated successfully');
      } else {
        await axiosInstance.post('/api/v1/users/addresses', data);
        toast.success('Address added successfully');
      }
      handleClose();
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this delivery address?')) return;
    try {
      await axiosInstance.delete(`/api/v1/users/addresses/${id}`);
      toast.success('Address deleted');
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (address: any) => {
    if (address.isDefault) return;
    try {
      await axiosInstance.put(`/api/v1/users/addresses/${address._id}`, { ...address, isDefault: true });
      toast.success('Default delivery address updated');
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to set default address');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Loading Addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif-luxury">Saved Shipping Addresses</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage your delivery locations for fast 1-click checkout</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleClose()}>
          <DialogTrigger asChild>
            <Button className="bg-[#111111] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-full px-6 py-2.5 shadow-xs shrink-0 self-start sm:self-auto">
              <Plus className="w-4 h-4 mr-2 text-[#C5A880]" />
              Add New Address
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[540px] rounded-lg p-0 overflow-hidden border border-gray-100 bg-white shadow-2xl">
            <div className="px-6 py-5 bg-[#111111] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 text-[#C5A880] flex items-center justify-center">
                  <Map className="w-4 h-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-serif font-bold text-white">
                    {editingId ? 'Edit Delivery Location' : 'Add New Delivery Address'}
                  </DialogTitle>
                  <p className="text-[11px] text-gray-300">Enter accurate details for courier doorstep inspection</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Recipient Name */}
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">Recipient Name</label>
                  <input
                    type="text"
                    {...register('fullName')}
                    className="w-full h-11 px-3.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black focus:border-black focus:bg-white outline-hidden transition-all"
                    placeholder="Ayesha Khan"
                  />
                  {errors.fullName && <p className="text-red-600 text-xs">{errors.fullName.message}</p>}
                </div>

                {/* Phone Number */}
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full h-11 px-3.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black focus:border-black focus:bg-white outline-hidden transition-all"
                    placeholder="0300 1234567"
                  />
                  {errors.phone && <p className="text-red-600 text-xs">{errors.phone.message}</p>}
                </div>

                {/* Street Address */}
                <div className="col-span-2 space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">Street Address</label>
                  <input
                    type="text"
                    {...register('addressLine1')}
                    className="w-full h-11 px-3.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black focus:border-black focus:bg-white outline-hidden transition-all"
                    placeholder="House/Apartment #, Street, Phase / Sector"
                  />
                  {errors.addressLine1 && <p className="text-red-600 text-xs">{errors.addressLine1.message}</p>}
                </div>

                {/* Additional Info */}
                <div className="col-span-2 space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">Nearby Landmark (Optional)</label>
                  <input
                    type="text"
                    {...register('addressLine2')}
                    className="w-full h-11 px-3.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black focus:border-black focus:bg-white outline-hidden transition-all"
                    placeholder="Near City Mall, Opposite Park, etc."
                  />
                </div>

                {/* City */}
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">City</label>
                  <input
                    type="text"
                    {...register('city')}
                    placeholder="Lahore, Karachi, Islamabad..."
                    className="w-full h-11 px-3.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black focus:border-black focus:bg-white outline-hidden transition-all"
                  />
                  {errors.city && <p className="text-red-600 text-xs">{errors.city.message}</p>}
                </div>

                {/* State */}
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">State / Province</label>
                  <input
                    type="text"
                    {...register('state')}
                    placeholder="Punjab, Sindh, KPK..."
                    className="w-full h-11 px-3.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black focus:border-black focus:bg-white outline-hidden transition-all"
                  />
                  {errors.state && <p className="text-red-600 text-xs">{errors.state.message}</p>}
                </div>

                {/* Postal Code */}
                <div className="col-span-2 space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">Postal Code</label>
                  <input
                    type="text"
                    {...register('postalCode')}
                    placeholder="54000"
                    className="w-full h-11 px-3.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black focus:border-black focus:bg-white outline-hidden transition-all"
                  />
                  {errors.postalCode && <p className="text-red-600 text-xs">{errors.postalCode.message}</p>}
                </div>

                {/* Default checkbox */}
                <div className="col-span-2 flex items-center p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    id="isDefault"
                    {...register('isDefault')}
                    className="w-4 h-4 text-black border-gray-300 rounded-sm focus:ring-black accent-black cursor-pointer"
                  />
                  <label htmlFor="isDefault" className="ml-3 text-xs font-semibold text-gray-800 cursor-pointer select-none">
                    Set as default shipping address for future orders
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 gap-2.5 border-t border-gray-100">
                <Button type="button" variant="ghost" onClick={handleClose} className="rounded-full text-xs">Cancel</Button>
                <Button 
                  type="submit" 
                  className="bg-[#111111] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider px-6 rounded-full shadow-xs" 
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Address'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-16 bg-[#FAFAFA] rounded-lg border border-dashed border-gray-200 space-y-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-xs text-gray-400">
            <MapPin className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">No saved addresses found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Add your delivery address to speed up your checkout on your next luxury purchase.
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-[#111111] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-full px-8 py-3 shadow-xs">
            Add Your Delivery Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((address) => (
            <div 
              key={address._id} 
              className={`relative bg-white rounded-lg p-6 transition-all duration-200 border ${
                address.isDefault 
                  ? 'border-black shadow-md ring-1 ring-black/10' 
                  : 'border-gray-200 hover:border-gray-400 shadow-xs'
              }`}
            >
              {address.isDefault && (
                <div className="absolute -top-3 right-4 bg-[#111111] text-[#C5A880] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1 border border-[#C5A880]/30">
                  <Star className="w-3 h-3 fill-current" /> Default Address
                </div>
              )}
              
              <div className="flex items-start gap-4 mb-5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  address.isDefault ? 'bg-black text-[#C5A880]' : 'bg-gray-100 text-gray-600'
                }`}>
                  {address.addressLine2?.toLowerCase().includes('apt') || address.addressLine2?.toLowerCase().includes('building') ? (
                    <Building2 className="w-5 h-5" />
                  ) : (
                    <Home className="w-5 h-5" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-base truncate font-serif-luxury">{address.fullName}</h4>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">{address.phone}</p>
                  
                  <div className="mt-3 space-y-0.5 text-xs text-gray-700 leading-relaxed">
                    <p className="font-medium text-gray-900">{address.addressLine1}</p>
                    {address.addressLine2 && <p className="text-gray-500">{address.addressLine2}</p>}
                    <p className="text-gray-600 font-semibold">{address.city}, {address.state} {address.postalCode}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full text-xs font-semibold h-8 border-gray-200 text-gray-700 hover:bg-gray-50" 
                  onClick={() => handleEdit(address)}
                >
                  <Edit2 className="w-3 h-3 mr-1.5" /> Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full text-xs font-semibold h-8 border-gray-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-100" 
                  onClick={() => handleDelete(address._id)}
                >
                  <Trash2 className="w-3 h-3 mr-1.5" /> Delete
                </Button>
                {!address.isDefault && (
                  <button 
                    className="ml-auto text-xs font-bold text-black hover:text-amber-800 uppercase tracking-wider transition-colors underline"
                    onClick={() => handleSetDefault(address)}
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
