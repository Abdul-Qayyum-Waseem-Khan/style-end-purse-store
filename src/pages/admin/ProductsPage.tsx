import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Badge } from '../../app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../app/components/ui/table';
import { ImageWithFallback } from '../../app/components/figma/ImageWithFallback';
import { Search, Plus, Edit, Trash2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function ProductsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { categories } = useCategories();
  
  const [isQuickEditMode, setIsQuickEditMode] = useState(false);
  const [quickEdits, setQuickEdits] = useState<{ [key: string]: { price: number; comparePrice: number | null } }>({});
  const [isSavingQuickEdit, setIsSavingQuickEdit] = useState<string | null>(null);

  const { products, pagination, isLoading, error, deleteProduct, toggleProductStatus, updateProductPartial } = useProducts({
    page,
    limit: 20,
    search: debouncedSearch,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    isAdmin: true
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDelete = async (id: string) => {
    const result = await deleteProduct(id);
    if (result.success) {
      toast.success('Product deleted successfully');
      setDeleteConfirmId(null);
    } else {
      toast.error(result.error || 'Failed to delete product');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await toggleProductStatus(id, currentStatus);
    if (result.success) {
      toast.success(`Product marked as ${!currentStatus ? 'Active' : 'Draft'}`);
    } else {
      toast.error(result.error || 'Failed to update status');
    }
  };

  const toggleQuickEditMode = () => {
    if (!isQuickEditMode) {
      // Initialize quick edits state
      const initialEdits: any = {};
      products.forEach(p => {
        initialEdits[p.id] = { price: p.price, comparePrice: p.comparePrice || null };
      });
      setQuickEdits(initialEdits);
    }
    setIsQuickEditMode(!isQuickEditMode);
  };

  const handleQuickEditChange = (id: string, field: 'price' | 'comparePrice', value: string) => {
    setQuickEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value === '' ? null : Number(value)
      }
    }));
  };

  const handleQuickSave = async (id: string) => {
    setIsSavingQuickEdit(id);
    const dataToSave = quickEdits[id];
    
    // We send comparePrice as 'null' to backend to unset it, or the number
    const payload: any = {
      price: dataToSave.price,
      comparePrice: dataToSave.comparePrice === null ? 'null' : dataToSave.comparePrice
    };

    const result = await updateProductPartial(id, payload);
    
    setIsSavingQuickEdit(null);
    if (result.success) {
      toast.success('Price updated');
    } else {
      toast.error(result.error || 'Failed to update price');
    }
  };

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-full pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your store inventory and pricing</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant={isQuickEditMode ? "secondary" : "outline"} 
            className={isQuickEditMode ? "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200" : ""}
            onClick={toggleQuickEditMode}
          >
            {isQuickEditMode ? 'Exit Quick Edit' : 'Quick Edit Prices'}
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => navigate('/admin/products/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search products by name..." 
            className="pl-9 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select 
          className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 w-full md:w-48"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c._id} value={c.slug}>{c.name}</option>
          ))}
        </select>

        <select 
          className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 w-full md:w-48"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-20">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    No products found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                        <ImageWithFallback src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        {product.SKU && <p className="text-xs text-gray-500">SKU: {product.SKU}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal text-xs bg-gray-100 text-gray-700">
                        {product.category?.name || 'Uncategorized'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isQuickEditMode && quickEdits[product.id] ? (
                        <div className="flex flex-col gap-2 min-w-[120px]">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 w-8">Price:</span>
                            <Input 
                              type="number" 
                              className="h-7 text-sm py-1 px-2"
                              value={quickEdits[product.id].price || ''}
                              onChange={(e) => handleQuickEditChange(product.id, 'price', e.target.value)}
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 w-8">Sale:</span>
                            <Input 
                              type="number" 
                              className="h-7 text-sm py-1 px-2"
                              placeholder="None"
                              value={quickEdits[product.id].comparePrice || ''}
                              onChange={(e) => handleQuickEditChange(product.id, 'comparePrice', e.target.value)}
                            />
                          </div>
                          <Button 
                            size="sm" 
                            className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white mt-1"
                            onClick={() => handleQuickSave(product.id)}
                            disabled={isSavingQuickEdit === product.id}
                          >
                            {isSavingQuickEdit === product.id ? '...' : 'Save Price'}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">PKR {product.price.toLocaleString()}</span>
                          {product.comparePrice && (
                            <span className="text-xs text-gray-500 line-through">PKR {product.comparePrice.toLocaleString()}</span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                        <span className={product.stock === 0 ? 'text-red-600 font-medium' : 'text-gray-700'}>
                          {product.stock}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => handleToggleStatus(product.id, product.isActive)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {product.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {product.isActive ? 'Active' : 'Draft'}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700" onClick={() => navigate(`/admin/products/${product.id}`)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleteConfirmId(product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="border-t border-gray-200 p-4 flex items-center justify-between bg-gray-50">
            <span className="text-sm text-gray-500">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalDocs} total products)
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!pagination.hasNextPage}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Product</h2>
              <p className="text-gray-500 text-sm">
                Are you sure you want to delete this product? This action cannot be undone and will permanently remove the product from your store.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDelete(deleteConfirmId)}>
                Yes, Delete Product
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
