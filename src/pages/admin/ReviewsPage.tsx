import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { Button } from '../../app/components/ui/button';
import { Card, CardContent } from '../../app/components/ui/card';
import { MessageSquare, CheckCircle, XCircle, Trash2, Star, Edit, Package } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<'store' | 'product'>('store');
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // Edit Modal State
  const [editingReview, setEditingReview] = useState<any>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [filter, activeTab]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const endpoint = activeTab === 'store' 
        ? `/api/v1/store-reviews/admin?status=${filter === 'all' ? '' : filter}`
        : `/api/v1/reviews/admin?status=${filter === 'all' ? '' : filter}`;
        
      const { data } = await axiosInstance.get(endpoint);
      setReviews(data.data);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to load ${activeTab} reviews`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleApproval = async (id: string) => {
    try {
      const endpoint = activeTab === 'store' 
        ? `/api/v1/store-reviews/admin/${id}/toggle-approval`
        : `/api/v1/reviews/admin/${id}/toggle-approval`;
        
      const { data } = await axiosInstance.put(endpoint);
      setReviews(reviews.map(r => r._id === id ? { ...r, isApproved: data.data.isApproved } : r));
      toast.success(data.data.isApproved ? 'Review enabled/approved' : 'Review disabled');
    } catch (error) {
      toast.error('Failed to update review status');
    }
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const endpoint = activeTab === 'store'
        ? `/api/v1/store-reviews/admin/${id}`
        : `/api/v1/reviews/admin/${id}`;
        
      await axiosInstance.delete(endpoint);
      setReviews(reviews.filter(r => r._id !== id));
      toast.success('Review deleted');
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const openEditModal = (review: any) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    
    try {
      const endpoint = activeTab === 'store'
        ? `/api/v1/store-reviews/admin/${editingReview._id}`
        : `/api/v1/reviews/admin/${editingReview._id}`;
        
      const { data } = await axiosInstance.put(endpoint, {
        rating: editRating,
        comment: editComment
      });
      
      setReviews(reviews.map(r => r._id === editingReview._id ? { ...r, rating: data.data.rating, comment: data.data.comment } : r));
      setEditingReview(null);
      toast.success('Review updated successfully');
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-full pb-20">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-6 h-6 text-brand-600" />
              Reviews Manager
            </h1>
            <p className="text-gray-600 mt-1">Manage all store and product reviews</p>
          </div>
          
          <div className="flex bg-white rounded-lg p-1 border border-gray-200">
            {['all', 'pending', 'approved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                  filter === f 
                    ? 'bg-brand-50 text-brand-700 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => { setActiveTab('store'); setFilter('all'); }}
            className={`pb-4 px-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'store' ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Store Reviews
          </button>
          <button
            onClick={() => { setActiveTab('product'); setFilter('all'); }}
            className={`pb-4 px-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'product' ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Product Reviews
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No reviews found</h3>
            <p className="text-gray-500">There are no {activeTab} reviews matching this filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review._id} className={`overflow-hidden transition-all ${!review.isApproved ? 'border-orange-200 bg-orange-50/10' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      {activeTab === 'product' && review.product && (
                        <div className="flex items-center gap-2 mb-3 bg-gray-50 p-2 rounded-lg w-fit border border-gray-100">
                          <Package className="w-4 h-4 text-gray-500" />
                          <span className="text-xs font-medium text-gray-700">{review.product.name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {review.createdAt ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) : ''}
                        </span>
                        {!review.isApproved && (
                          <span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                            Disabled / Pending
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-800 font-medium mb-4">"{review.comment}"</p>
                      
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold uppercase shrink-0">
                          {review.user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{review.user?.name || 'Unknown User'}</span>
                        <span className="text-xs text-gray-500">({review.user?.email})</span>
                      </div>
                    </div>
                    
                    <div className="flex md:flex-col gap-2 shrink-0 md:border-l md:border-gray-100 md:pl-6 justify-center flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(review)}
                        className="flex-1 md:flex-none text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </Button>
                      
                      <Button
                        variant={review.isApproved ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleApproval(review._id)}
                        className={`flex-1 md:flex-none ${review.isApproved ? "text-orange-600 border-orange-200 hover:bg-orange-50" : "bg-green-600 hover:bg-green-700"}`}
                      >
                        {review.isApproved ? (
                          <><XCircle className="w-4 h-4 mr-2" /> Disable</>
                        ) : (
                          <><CheckCircle className="w-4 h-4 mr-2" /> Enable</>
                        )}
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteReview(review._id)}
                        className="flex-1 md:flex-none"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Edit Review</h3>
              <button 
                onClick={() => setEditingReview(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      className="p-1"
                    >
                      <Star className={`w-8 h-8 ${star <= editRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Comment</label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="outline" type="button" onClick={() => setEditingReview(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
