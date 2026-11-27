import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '../../app/components/ui/button';
import axiosInstance from '../../api/axios';
import { toast } from 'sonner';

export function ReturnRequestPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [step, setStep] = useState(1);

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  useEffect(() => {
    // Fetch order to verify it's delivered
    axiosInstance.get(`/api/v1/orders/${orderId}`)
      .then(res => setOrder(res.data.data))
      .catch(err => {
        toast.error('Order not found or access denied');
        navigate('/account/orders');
      });
  }, [orderId, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray]);

      const previews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...previews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please select a reason for return');
      return;
    }
    if (images.length === 0) {
      toast.error('Please upload at least one proof image');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      images.forEach(image => {
        formData.append('images', image);
      });
      formData.append('orderId', orderId || '');
      formData.append('reason', reason);
      formData.append('details', details);

      // Submit return request with images
      const { data } = await axiosInstance.post('/api/v1/returns', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Return request submitted successfully!');
      navigate(`/account/orders`);

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to submit return request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) return <div className="p-8 text-center text-gray-500">Loading order details...</div>;
  if (order.status !== 'delivered') {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-10">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Cannot Request Return</h2>
        <p className="text-gray-600 mb-6">Returns can only be requested for delivered orders.</p>
        <Button onClick={() => navigate('/account/orders')} className="w-full">Back to Orders</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Request a Return</h2>
        <p className="text-gray-500 mt-2">Follow the steps below to request a return for Order <strong>#{orderId?.substring(16).toUpperCase()}</strong>.</p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 relative px-4">
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded-full z-0"></div>
        <div 
          className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-[#A67C38] rounded-full z-0 transition-all duration-300"
          style={{ width: `calc(${((step - 1) / 2) * 100}% - ${step === 1 ? '1rem' : step === 3 ? '1rem' : '0px'})` }}
        ></div>
        
        {[1, 2, 3].map((num) => (
          <div key={num} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
            step >= num ? 'bg-[#111111] text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {step > num ? <span className="text-white">✓</span> : num}
          </div>
        ))}
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
        
        {/* STEP 1: POLICIES */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Policies</h2>
            <div className="prose prose-sm text-gray-600 bg-gray-50 p-6 rounded-xl border border-gray-100">
              <ul className="space-y-3 list-disc pl-4">
                <li><strong>Time Window:</strong> Returns must be requested within 14 days of delivery.</li>
                <li><strong>Condition:</strong> Products must be unopened, sealed, and in their original packaging to be eligible for a full refund.</li>
                <li><strong>Process:</strong> Once your request is approved, you will receive a printable 3-page PDF document.</li>
                <li><strong>Shipping:</strong> The customer is responsible for dropping the package off at the designated courier center.</li>
                <li><strong>Refunds:</strong> Refunds are processed within 5-7 business days after we receive and inspect the returned item.</li>
              </ul>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  By clicking "I Accept", you acknowledge that if the returned items do not meet the condition requirements upon inspection, the return may be rejected without refund.
                </p>
              </div>
            </div>
            <div className="flex justify-between pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => navigate('/account/orders')}>Cancel</Button>
              <Button onClick={handleNext} className="bg-[#111111] hover:bg-black text-white px-8">
                I Accept Policies
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: GUIDE */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">How it Works</h2>
            
            <div className="grid gap-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xl">1</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Submit Request</h3>
                  <p className="text-gray-600 text-sm mt-1">Fill out the form in the next step. Upload clear pictures. Our team will review your request within 24-48 hours.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-[#111111] text-[#C5A880] flex items-center justify-center shrink-0 font-bold text-xl">2</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Download Documents</h3>
                  <p className="text-gray-600 text-sm mt-1">If approved, you'll receive a professional 3-page PDF. Print all pages. Place Page 1 INSIDE the return package.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 font-bold text-xl">3</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Drop off & Track</h3>
                  <p className="text-gray-600 text-sm mt-1">Attach Page 2 to the outside of the box for the courier. Keep Page 3 safe as your official proof of return.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <Button variant="outline" onClick={handlePrev}>Back</Button>
              <Button onClick={handleNext} className="bg-[#111111] hover:bg-black text-white px-8">
                Continue to Form
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: FORM */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Return <span className="text-red-500">*</span></label>
              <select 
                className="w-full border-gray-300 rounded-xl focus:ring-[#111111] focus:border-[#A67C38]"
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
              >
                <option value="">Select a reason</option>
                <option value="Damaged/Defective Product">Damaged or Defective Product</option>
                <option value="Wrong Item Received">Wrong Item Received</option>
                <option value="Missing Parts/Accessories">Missing Parts or Accessories</option>
                <option value="Not as Described">Not as Described</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details</label>
              <textarea 
                rows={4}
                className="w-full border-gray-300 rounded-xl focus:ring-[#111111] focus:border-[#A67C38]"
                placeholder="Please provide more details about the issue..."
                value={details}
                onChange={e => setDetails(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Proof Images <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-4">Please upload clear photos showing the issue with the product.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                    <img src={preview} alt="Proof" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-white/80 rounded-full text-red-500 hover:bg-white hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-[#A67C38] hover:text-[#A67C38] transition-colors cursor-pointer bg-gray-50">
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-xs font-medium">Add Photo</span>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between gap-4">
              <Button type="button" variant="outline" className="rounded-xl px-8" onClick={handlePrev} disabled={isSubmitting}>
                Back
              </Button>
              <Button type="submit" className="rounded-xl bg-[#111111] hover:bg-black px-8" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
