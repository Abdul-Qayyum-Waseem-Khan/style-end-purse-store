import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit2, Trash2, Tag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../app/components/ui/dialog';
import { Badge } from '../../app/components/ui/badge';
import axiosInstance from '../../api/axios';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  image: z.string().optional().nullable(),
  parentCategory: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '', image: '', parentCategory: '', isActive: true }
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await axiosInstance.get('/api/v1/categories/admin/all');
      setCategories(data.data || []);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: any) => {
    setEditingId(category._id);
    reset({
      name: category.name,
      description: category.description,
      image: category.image || '',
      parentCategory: category.parentCategory?._id || category.parentCategory || '',
      isActive: category.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    reset({ name: '', description: '', image: '', parentCategory: '', isActive: true });
  };

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setIsSaving(true);
      // Empty string parentCategory means null (top-level)
      if (!data.parentCategory) {
        data.parentCategory = null;
      }
      
      if (editingId) {
        await axiosInstance.put(`/api/v1/categories/${editingId}`, data);
        toast.success('Category updated');
      } else {
        await axiosInstance.post('/api/v1/categories', data);
        toast.success('Category created');
      }
      handleClose();
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Products linked to it might lose their association.')) return;
    try {
      await axiosInstance.delete(`/api/v1/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete category');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product categories and hierarchy.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleClose()}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category Name</label>
                <Input {...register('name')} placeholder="e.g. Health & Wellness" className={errors.name ? 'border-red-500' : ''} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  {...register('description')} 
                  className={`w-full h-24 rounded-md border p-3 text-sm focus:ring-2 focus:ring-orange-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Brief description..."
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL</label>
                <Input {...register('image')} placeholder="https://.../image.jpg" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Parent Category (Optional)</label>
                <select 
                  {...register('parentCategory')}
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">-- None (Top Level) --</option>
                  {categories.map(c => (
                    // Prevent self-selection as parent
                    c._id !== editingId && (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    )
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" {...register('isActive')} id="isActive" className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active (Visible)</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                <Button type="submit" disabled={isSaving} className="bg-orange-600 hover:bg-orange-700 min-w-[100px]">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Parent Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    No categories found. Create one to get started.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-10 h-10 rounded-full object-cover border" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 border flex items-center justify-center">
                          <Tag className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{category.name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{category.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {category.parentCategory ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs">
                          {category.parentCategory.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Top Level</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {category.isActive ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(category._id)}>
                          <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
