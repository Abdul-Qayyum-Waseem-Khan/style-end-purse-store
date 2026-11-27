import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Camera, 
  Loader2, 
  Package, 
  MapPin, 
  Truck, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Lock, 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../app/components/ui/button';
import { Badge } from '../../app/components/ui/badge';
import { useAuth } from '../../hooks/useAuth';
import axiosInstance from '../../api/axios';
import { Link } from 'react-router';
import { format } from 'date-fns';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address'),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required to set a new password",
  path: ["currentPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { user, fetchCurrentUser } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, delivered: 0 });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const { data } = await axiosInstance.get('/api/v1/orders/my-orders');
        const orders = data.data || [];
        setRecentOrders(orders.slice(0, 3));
        
        const pending = orders.filter((o: any) => ['pending', 'in_progress', 'dispatched', 'at_delivery'].includes(o.orderStatus)).length;
        const delivered = orders.filter((o: any) => o.orderStatus === 'delivered').length;
        setOrderStats({
          total: orders.length,
          pending,
          delivered
        });
      } catch (error) {
        console.error('Failed to fetch account overview data', error);
      }
    };
    fetchAccountData();
  }, []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  // Keep form updated with user data
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user, reset]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('name', data.name.trim());
      
      if (data.phone) formData.append('phone', data.phone.trim());
      
      if (data.email && data.email.toLowerCase().trim() !== user?.email) {
        formData.append('email', data.email.toLowerCase().trim());
        if (data.currentPassword) formData.append('currentPassword', data.currentPassword);
      }

      if (data.newPassword) {
        formData.append('newPassword', data.newPassword);
        formData.append('currentPassword', data.currentPassword || '');
      }

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await axiosInstance.put('/api/v1/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        await fetchCurrentUser();
        toast.success('Account profile updated successfully!');
        reset({
          name: res.data.data.name,
          email: res.data.data.email,
          phone: res.data.data.phone || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setAvatarFile(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">Order Placed</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">Processing</Badge>;
      case 'dispatched':
      case 'at_delivery':
        return <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">On The Way</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Clean Minimal Welcome Header */}
      <div className="border-b border-gray-100 pb-5">
        <h1 className="text-xl sm:text-2xl font-serif-luxury font-bold text-[#111111]">
          Welcome, {user?.name || 'Customer'}
        </h1>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/account/orders"
          className="bg-[#FAF8F5] hover:bg-white p-4 rounded-lg border border-gray-200/80 transition-all hover:border-[#111111] group"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="w-9 h-9 rounded-md bg-[#111111] text-[#C5A880] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#111111] group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#111111]">{orderStats.total}</div>
          <div className="text-xs font-medium text-gray-500 mt-0.5">Total Orders</div>
        </Link>

        <Link
          to="/account/orders"
          className="bg-[#FAF8F5] hover:bg-white p-4 rounded-lg border border-gray-200/80 transition-all hover:border-[#111111] group"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="w-9 h-9 rounded-md bg-[#111111] text-[#C5A880] flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#111111] group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#111111]">{orderStats.pending}</div>
          <div className="text-xs font-medium text-gray-500 mt-0.5">Active Deliveries</div>
        </Link>

        <Link
          to="/account/wishlist"
          className="bg-[#FAF8F5] hover:bg-white p-4 rounded-lg border border-gray-200/80 transition-all hover:border-[#111111] group"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="w-9 h-9 rounded-md bg-[#111111] text-[#C5A880] flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#111111] group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#111111]">{user?.wishlist?.length || 0}</div>
          <div className="text-xs font-medium text-gray-500 mt-0.5">Wishlist Items</div>
        </Link>

        <Link
          to="/account/addresses"
          className="bg-[#FAF8F5] hover:bg-white p-4 rounded-lg border border-gray-200/80 transition-all hover:border-[#111111] group"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="w-9 h-9 rounded-md bg-[#111111] text-[#C5A880] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#111111] group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#111111]">{user?.addresses?.length || 0}</div>
          <div className="text-xs font-medium text-gray-500 mt-0.5">Saved Addresses</div>
        </Link>

      </div>

      {/* Recent Orders Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-serif-luxury">Recent Purchases & Delivery Status</h2>
            <p className="text-xs text-gray-500">Track and view your latest luxury bag & purse orders</p>
          </div>
          <Link 
            to="/account/orders" 
            className="text-xs font-semibold text-black hover:text-amber-800 inline-flex items-center gap-1 transition-colors"
          >
            View All ({orderStats.total}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-[#FAFAFA] rounded-lg p-8 text-center border border-dashed border-gray-200 space-y-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-xs text-gray-400">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">No orders placed yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Explore our boutique collection of handbags, clutches, totes, and matching shoes.
            </p>
            <Button asChild className="bg-[#111111] hover:bg-black text-white text-xs font-semibold rounded-full px-6 py-2">
              <Link to="/">Explore Collection</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const orderId = (order._id || order.id || '').toString().substring(16).toUpperCase();
              const dateStr = order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : 'Recent';
              const itemsCount = (order.items || []).reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
              
              return (
                <div 
                  key={order._id}
                  className="bg-white rounded-lg p-4 sm:p-5 border border-gray-200/80 hover:border-black/40 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200/60 overflow-hidden">
                      {order.items?.[0]?.product?.images?.[0]?.url ? (
                        <img 
                          src={order.items[0].product.images[0].url} 
                          alt="Product" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs sm:text-sm text-gray-900">#{orderId}</span>
                        {getStatusBadge(order.orderStatus)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {dateStr} • {itemsCount} {itemsCount === 1 ? 'item' : 'items'} • PKR {(order.totalAmount || order.total || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    <Button 
                      asChild 
                      variant="outline" 
                      className="h-9 px-4 text-xs font-semibold rounded-xl border-gray-200 hover:bg-gray-50"
                    >
                      <Link to="/account/orders">Track & Details</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="h-px bg-gray-100 my-8" />

      {/* Account Details & Security Form */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-serif-luxury">Account Profile & Security</h2>
          <p className="text-xs text-gray-500">Update your contact credentials, avatar photo, and account password</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Avatar Upload */}
          <div className="flex items-center gap-5 p-4 rounded-lg bg-[#FAFAFA] border border-gray-200/80">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-lg bg-[#111111] text-[#C5A880] border-2 border-[#C5A880]/50 overflow-hidden flex items-center justify-center font-serif text-2xl font-bold shadow-sm">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              <label 
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity backdrop-blur-xs"
              >
                <Camera className="w-6 h-6 text-white" />
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                className="hidden" 
              />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Profile Photo</h3>
              <p className="text-xs text-gray-500 mt-0.5">Click photo to upload PNG, JPG, or WEBP (Max 5MB)</p>
              <label 
                htmlFor="avatar-upload" 
                className="inline-block text-xs font-semibold text-black underline mt-2 cursor-pointer hover:text-amber-800"
              >
                Upload New Image
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" /> Full Name
              </label>
              <input 
                type="text" 
                {...register('name')}
                placeholder="Ayesha Khan"
                className="w-full h-11 px-3.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-black focus:ring-1 focus:ring-black bg-white"
              />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone Number (For Courier)
              </label>
              <input 
                type="tel" 
                {...register('phone')}
                placeholder="0300 1234567"
                className="w-full h-11 px-3.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-black focus:ring-1 focus:ring-black bg-white"
              />
              {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input 
                type="email" 
                {...register('email')}
                placeholder="name@example.com"
                className="w-full h-11 px-3.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-black focus:ring-1 focus:ring-black bg-white"
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>
          </div>

          {/* Password Change Box */}
          <div className="p-5 rounded-lg bg-gray-50 border border-gray-200/80 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Change Password (Optional)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Leave blank if you do not wish to change your password.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-600">Current Password</label>
                <div className="relative">
                  <input 
                    type={showCurrentPassword ? 'text' : 'password'} 
                    {...register('currentPassword')}
                    placeholder="••••••••"
                    className="w-full h-10 px-3 pr-9 text-xs rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:border-black"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.currentPassword && <p className="text-xs text-red-600">{errors.currentPassword.message}</p>}
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-600">New Password</label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? 'text' : 'password'} 
                    {...register('newPassword')}
                    placeholder="Min 6 chars"
                    className="w-full h-10 px-3 pr-9 text-xs rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:border-black"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-xs text-red-600">{errors.newPassword.message}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-600">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    {...register('confirmPassword')}
                    placeholder="Re-type password"
                    className="w-full h-10 px-3 pr-9 text-xs rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:border-black"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>}
              </div>

            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              disabled={isSaving}
              className="bg-[#111111] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-8 rounded-full shadow-xs transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                'Save Profile Updates'
              )}
            </Button>
          </div>

        </form>
      </div>

    </div>
  );
}
