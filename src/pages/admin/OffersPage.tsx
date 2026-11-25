import { useState } from 'react';
import axiosInstance from '../../api/axios';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { toast } from 'sonner';
import { Percent, Tag, Zap, AlertTriangle } from 'lucide-react';

export function OffersPage() {
  const [discountPercentage, setDiscountPercentage] = useState<number | ''>('');
  const [isApplying, setIsApplying] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleApplyDiscount = async () => {
    if (discountPercentage === '' || discountPercentage <= 0 || discountPercentage > 100) {
      toast.error('Please enter a valid discount percentage (1-100)');
      return;
    }

    try {
      setIsApplying(true);
      const { data } = await axiosInstance.post('/api/v1/admin/offers/apply-discount', {
        discountPercentage: Number(discountPercentage)
      });
      toast.success(data.message);
      setDiscountPercentage('');
    } catch (error) {
      console.error('Failed to apply discount', error);
      toast.error('Failed to apply global discount');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveDiscount = async () => {
    if (!window.confirm('Are you sure you want to remove all store-wide discounts and reset products to their original prices?')) {
      return;
    }

    try {
      setIsRemoving(true);
      const { data } = await axiosInstance.post('/api/v1/admin/offers/apply-discount', {
        discountPercentage: 0
      });
      toast.success('All global discounts have been removed.');
    } catch (error) {
      console.error('Failed to remove discount', error);
      toast.error('Failed to remove global discount');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Percent className="w-6 h-6 text-gray-700" />
            Offers & Store-wide Discounts
          </h1>
          <p className="text-gray-600 mt-1">Apply or remove bulk discounts across all store products</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Flash Sale Creator */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2 font-semibold text-gray-900">
            <Zap className="w-5 h-5 text-orange-500" />
            Apply Flash Sale Discount
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-orange-50 p-3 rounded-lg border border-orange-100">
                <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
                <p>Applying a discount here will immediately update the prices of <strong>ALL</strong> products in your store. The original price will be saved as the "compare price" to show a markdown.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
                <div className="relative max-w-xs">
                  <Input
                    id="discountPercentage"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g. 15"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value ? Number(e.target.value) : '')}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleApplyDiscount} 
              disabled={isApplying || isRemoving}
              className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
            >
              <Tag className="w-4 h-4 mr-2" />
              {isApplying ? 'Applying Discount...' : 'Apply Discount to All Products'}
            </Button>
          </div>
        </div>

        {/* Remove Discounts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2 font-semibold text-gray-900">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Reset Prices
          </div>
          <div className="p-6 space-y-6">
            <p className="text-gray-600 text-sm">
              Use this action to end a store-wide sale. It will revert all products back to their original prices (removing the compare price markdowns).
            </p>

            <Button 
              onClick={handleRemoveDiscount} 
              disabled={isApplying || isRemoving}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              {isRemoving ? 'Removing Discounts...' : 'End Sale & Reset All Prices'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
