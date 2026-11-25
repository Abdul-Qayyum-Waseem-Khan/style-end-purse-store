import { useState } from 'react';
import { Plus, Pencil, Trash2, Tag, Gift, Percent } from 'lucide-react';
import { Button } from '../../app/components/ui/button';
import { useCoupons, Coupon } from '../../hooks/useCoupons';
import { toast } from 'sonner';

export function CouponsPage() {
  const { coupons, isLoading, addCoupon, updateCoupon, deleteCoupon } = useCoupons();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  
  // Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed' | 'free_gift'>('percentage');
  const [value, setValue] = useState('');
  const [giftDescription, setGiftDescription] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [applicableToFirstOrderOnly, setApplicableToFirstOrderOnly] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingCoupon(null);
    setCode('');
    setType('percentage');
    setValue('');
    setGiftDescription('');
    setMinOrderAmount('');
    setUsageLimit('');
    setExpiryDate('');
    setIsActive(true);
    setApplicableToFirstOrderOnly(false);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setType(coupon.type);
    setValue(coupon.value?.toString() || '');
    setGiftDescription(coupon.giftDescription || '');
    setMinOrderAmount(coupon.minOrderAmount?.toString() || '');
    setUsageLimit(coupon.usageLimit?.toString() || '');
    setExpiryDate(coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '');
    setIsActive(coupon.isActive);
    setApplicableToFirstOrderOnly(coupon.applicableToFirstOrderOnly);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const couponData: Partial<Coupon> = {
        code: code.toUpperCase(),
        type,
        isActive,
        applicableToFirstOrderOnly,
      };

      if (type !== 'free_gift') couponData.value = Number(value);
      if (type === 'free_gift') couponData.giftDescription = giftDescription;
      if (minOrderAmount) couponData.minOrderAmount = Number(minOrderAmount);
      if (usageLimit) couponData.usageLimit = Number(usageLimit);
      if (expiryDate) couponData.expiryDate = expiryDate;

      if (editingCoupon) {
        await updateCoupon(editingCoupon._id, couponData);
        toast.success('Coupon updated successfully');
      } else {
        await addCoupon(couponData);
        toast.success('Coupon created successfully');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(id);
        toast.success('Coupon deleted');
      } catch (err) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading coupons...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons & Offers</h1>
          <p className="text-gray-500">Manage discount codes and free gifts</p>
        </div>
        <Button onClick={openAddModal} className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Coupon
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type/Value</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">{coupon.code}</span>
                      {coupon.applicableToFirstOrderOnly && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">First Order</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      {coupon.type === 'percentage' && <Percent className="w-4 h-4 text-green-600" />}
                      {coupon.type === 'fixed' && <Tag className="w-4 h-4 text-blue-600" />}
                      {coupon.type === 'free_gift' && <Gift className="w-4 h-4 text-orange-600" />}
                      <span className="font-medium">
                        {coupon.type === 'percentage' ? `${coupon.value}% OFF` : 
                         coupon.type === 'fixed' ? `Rs. ${coupon.value} OFF` : 
                         coupon.giftDescription}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'used'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {coupon.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(coupon)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon._id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No coupons found. Create one to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono uppercase"
                    placeholder="e.g. WELCOME10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Rs.)</option>
                    <option value="free_gift">Free Gift</option>
                  </select>
                </div>
              </div>

              {type !== 'free_gift' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value {type === 'percentage' ? '(%)' : '(Rs.)'}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gift Description</label>
                  <input
                    type="text"
                    required
                    value={giftDescription}
                    onChange={(e) => setGiftDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. Free Leather Keychain"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min. Order Amount (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex flex-col gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={applicableToFirstOrderOnly}
                    onChange={(e) => setApplicableToFirstOrderOnly(e.target.checked)}
                    className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">First Purchase Only</div>
                    <div className="text-sm text-gray-500">Only valid for users with 0 previous orders.</div>
                  </div>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                  />
                  <div className="font-medium text-gray-900">Active Status</div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700 text-white">
                  {isSubmitting ? 'Saving...' : 'Save Coupon'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
