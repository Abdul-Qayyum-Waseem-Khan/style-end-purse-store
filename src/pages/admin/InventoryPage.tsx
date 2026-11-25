import { useState, useEffect } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Badge } from '../../app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../app/components/ui/table';
import { ImageWithFallback } from '../../app/components/figma/ImageWithFallback';
import { Search, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function InventoryPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const { categories } = useCategories();
  
  const { products, pagination, isLoading, error, bulkUpdateProducts } = useProducts({
    page,
    limit: 50, // Higher limit for bulk editing
    search: debouncedSearch,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    isAdmin: true
  });

  const [edits, setEdits] = useState<{ [key: string]: { price?: number; comparePrice?: number | null; stock?: number } }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleEditChange = (id: string, field: 'price' | 'comparePrice' | 'stock', value: string) => {
    setEdits(prev => {
      const currentEdits = prev[id] || {};
      return {
        ...prev,
        [id]: {
          ...currentEdits,
          [field]: value === '' ? null : Number(value)
        }
      };
    });
  };

  const getEditedValue = (id: string, field: 'price' | 'comparePrice' | 'stock', originalValue: any) => {
    if (edits[id] && edits[id][field] !== undefined) {
      return edits[id][field];
    }
    return originalValue;
  };

  const hasChanges = Object.keys(edits).length > 0;

  const handleBulkSave = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    
    const updates = Object.entries(edits).map(([id, data]) => {
      // Map comparePrice null back to 'null' string if needed by backend, though backend uses mongo directly.
      // Wait, our backend bulkWrite uses $set, so passing null works directly for mongo!
      return {
        id,
        data
      };
    });

    const result = await bulkUpdateProducts(updates);
    setIsSaving(false);

    if (result.success) {
      toast.success(`Successfully updated ${updates.length} products`);
      setEdits({}); // Clear edits on success
    } else {
      toast.error(result.error || 'Failed to update products');
    }
  };

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-full pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory & Pricing</h1>
          <p className="text-gray-600 mt-1">Bulk manage your product pricing, discounts, and stock levels</p>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]" 
          onClick={handleBulkSave}
          disabled={!hasChanges || isSaving}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : `Save Changes ${hasChanges ? `(${Object.keys(edits).length})` : ''}`}
        </Button>
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
            <option key={c._id || c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>

        {hasChanges && (
          <div className="flex items-center text-orange-600 text-sm font-medium bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
            <AlertCircle className="w-4 h-4 mr-2" />
            Unsaved changes
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-20">Image</TableHead>
                <TableHead className="min-w-[200px]">Product</TableHead>
                <TableHead className="w-32">Price (PKR)</TableHead>
                <TableHead className="w-32">Compare at</TableHead>
                <TableHead className="w-32">Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                    No products found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const isPriceEdited = edits[product.id] && edits[product.id].price !== undefined;
                  const isComparePriceEdited = edits[product.id] && edits[product.id].comparePrice !== undefined;
                  const isStockEdited = edits[product.id] && edits[product.id].stock !== undefined;

                  return (
                    <TableRow key={product.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                          <ImageWithFallback src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <Badge variant="secondary" className="font-normal text-xs bg-gray-100 text-gray-700 mt-1">
                            {product.category?.name || 'Uncategorized'}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      {/* Price Input */}
                      <TableCell>
                        <div className="space-y-1 relative">
                          <Input 
                            type="number" 
                            className={`h-9 ${isPriceEdited ? 'border-orange-500 bg-orange-50' : ''}`}
                            value={getEditedValue(product.id, 'price', product.price) || ''}
                            onChange={(e) => handleEditChange(product.id, 'price', e.target.value)}
                          />
                          {isPriceEdited && (
                            <span className="text-[10px] text-gray-400 absolute -bottom-4 right-0">was {product.price}</span>
                          )}
                        </div>
                      </TableCell>
                      
                      {/* Compare Price Input */}
                      <TableCell>
                        <div className="space-y-1 relative">
                          <Input 
                            type="number" 
                            placeholder="None"
                            className={`h-9 ${isComparePriceEdited ? 'border-orange-500 bg-orange-50' : ''}`}
                            value={getEditedValue(product.id, 'comparePrice', product.comparePrice) || ''}
                            onChange={(e) => handleEditChange(product.id, 'comparePrice', e.target.value)}
                          />
                          {isComparePriceEdited && product.comparePrice && (
                            <span className="text-[10px] text-gray-400 absolute -bottom-4 right-0 line-through">was {product.comparePrice}</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Stock Input */}
                      <TableCell>
                        <div className="space-y-1 relative">
                          <Input 
                            type="number" 
                            className={`h-9 ${isStockEdited ? 'border-orange-500 bg-orange-50' : ''}`}
                            value={getEditedValue(product.id, 'stock', product.stock) || ''}
                            onChange={(e) => handleEditChange(product.id, 'stock', e.target.value)}
                          />
                          {isStockEdited && (
                            <span className="text-[10px] text-gray-400 absolute -bottom-4 right-0">was {product.stock}</span>
                          )}
                        </div>
                      </TableCell>

                    </TableRow>
                  );
                })
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
                onClick={() => {
                  if (hasChanges) {
                    if (!window.confirm('You have unsaved changes. Are you sure you want to change pages?')) return;
                  }
                  setEdits({});
                  setPage(p => p - 1);
                }}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!pagination.hasNextPage}
                onClick={() => {
                  if (hasChanges) {
                    if (!window.confirm('You have unsaved changes. Are you sure you want to change pages?')) return;
                  }
                  setEdits({});
                  setPage(p => p + 1);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
