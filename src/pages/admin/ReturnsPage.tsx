import { useState, useEffect } from 'react';
import { Package, Search, ChevronRight, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../app/components/ui/button';
import { Card, CardContent } from '../../app/components/ui/card';
import { Badge } from '../../app/components/ui/badge';
import axiosInstance from '../../api/axios';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ImageWithFallback } from '../../app/components/figma/ImageWithFallback';
import { generateReturnPDF } from '../../utils/pdf/ReturnPDFGenerator';
import { FileDown, RefreshCw } from 'lucide-react';

export function ReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const { data } = await axiosInstance.get('/api/v1/returns');
      setReturns(data.data || []);
    } catch (error) {
      toast.error('Failed to load return requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (returnId: string, status: string) => {
    setIsUpdating(true);
    try {
      await axiosInstance.put(`/api/v1/returns/${returnId}/status`, { status });
      toast.success(`Return request ${status}`);
      setSelectedReturn(null);
      fetchReturns();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Return Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer return and refund requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left List */}
        <div className="lg:col-span-1 border border-gray-200 rounded-xl bg-white overflow-hidden flex flex-col h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search returns..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : returns.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <Package className="w-12 h-12 text-gray-300 mb-2" />
                <p>No return requests found.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {returns.map((req) => (
                  <button
                    key={req._id}
                    onClick={() => setSelectedReturn(req)}
                    className={`w-full text-left p-4 hover:bg-orange-50 transition-colors flex items-center justify-between ${selectedReturn?._id === req._id ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''}`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">#{req._id.substring(16).toUpperCase()}</span>
                        <Badge variant="outline" className={getStatusBadgeClass(req.status)}>
                          {req.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{req.reason}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{format(new Date(req.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Details Pane */}
        <div className="lg:col-span-2 h-[calc(100vh-200px)] overflow-y-auto">
          {selectedReturn ? (
            <div className="space-y-6">
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        Return #{selectedReturn._id.substring(16).toUpperCase()}
                        <Badge variant="outline" className={getStatusBadgeClass(selectedReturn.status)}>
                          {selectedReturn.status.toUpperCase()}
                        </Badge>
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Requested on {format(new Date(selectedReturn.createdAt), 'PPpp')}
                      </p>
                    </div>
                    {selectedReturn.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleUpdateStatus(selectedReturn._id, 'rejected')}
                          disabled={isUpdating}
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                        <Button 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleUpdateStatus(selectedReturn._id, 'approved')}
                          disabled={isUpdating}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Approve
                        </Button>
                      </div>
                    )}
                    {selectedReturn.status === 'approved' && (
                      <div className="flex gap-2">
                        <Button 
                          className="bg-brand-600 hover:bg-brand-700 text-white"
                          onClick={() => generateReturnPDF(selectedReturn)}
                        >
                          <FileDown className="w-4 h-4 mr-2" /> Generate PDF Documents
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleUpdateStatus(selectedReturn._id, 'completed')}
                          disabled={isUpdating}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Mark Completed
                        </Button>
                      </div>
                    )}
                    {selectedReturn.status === 'rejected' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => handleUpdateStatus(selectedReturn._id, 'pending')}
                          disabled={isUpdating}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" /> Move to Review
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Reason</p>
                      <p className="text-sm text-gray-900 font-medium">{selectedReturn.reason}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Original Order</p>
                      <a href={`/admin/orders/${selectedReturn.order?._id}`} className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1">
                        <Eye className="w-4 h-4" /> View Order
                      </a>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Customer Details</p>
                      <p className="text-sm text-gray-700">{selectedReturn.details || 'No additional details provided by the customer.'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Customer Proof Images</h3>
                  {selectedReturn.proofImages && selectedReturn.proofImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedReturn.proofImages.map((img: string, i: number) => (
                        <button 
                          key={i} 
                          onClick={() => setZoomedImage(img)}
                          className="block aspect-square rounded-xl overflow-hidden border border-gray-200 hover:border-brand-500 transition-colors"
                        >
                          <ImageWithFallback src={img} alt={`Proof ${i+1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No proof images provided.</p>
                  )}
                </CardContent>
              </Card>

            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50/50">
              <div className="text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Select a return request from the list</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-full flex items-center justify-center">
            <button 
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
              onClick={() => setZoomedImage(null)}
            >
              <XCircle className="w-8 h-8" />
            </button>
            <img 
              src={zoomedImage} 
              alt="Zoomed Proof" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
