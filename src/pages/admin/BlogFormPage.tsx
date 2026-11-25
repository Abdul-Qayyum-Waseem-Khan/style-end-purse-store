import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useBlogs, Blog } from '../../hooks/useBlogs';
import { Button } from '../../app/components/ui/button';
import { Badge } from '../../app/components/ui/badge';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export function BlogFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getBlogBySlug, createBlog, updateBlog } = useBlogs();
  
  const isEdit = slug && slug !== 'new';
  
  const [formData, setFormData] = useState<Partial<Blog>>({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    gallery: [],
    tags: [],
    isActive: true,
  });
  const [tagInput, setTagInput] = useState('');
  const [galleryInput, setGalleryInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(isEdit);

  useEffect(() => {
    if (isEdit && slug) {
      setIsLoadingData(true);
      getBlogBySlug(slug).then((data) => {
        if (data) {
          setFormData({
            title: data.title || '',
            content: data.content || '',
            excerpt: data.excerpt || '',
            coverImage: data.coverImage || '',
            gallery: Array.isArray(data.gallery) ? data.gallery : [],
            tags: Array.isArray(data.tags) ? data.tags : [],
            isActive: data.isActive !== undefined ? data.isActive : true,
          });
          if (data.coverImage) {
            setCoverImagePreview(data.coverImage);
          }
        }
      }).finally(() => {
        setIsLoadingData(false);
      });
    }
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }
    
    setIsSaving(true);
    let success = false;
    
    // Create FormData
    const submissionData = new FormData();
    submissionData.append('title', formData.title);
    submissionData.append('content', formData.content);
    if (formData.excerpt) submissionData.append('excerpt', formData.excerpt);
    if (formData.isActive !== undefined) submissionData.append('isActive', formData.isActive.toString());
    
    if (formData.tags && formData.tags.length > 0) {
      submissionData.append('tags', formData.tags.join(','));
    }
    
    if (formData.gallery && formData.gallery.length > 0) {
      // Send gallery as JSON string or multiple fields depending on backend
      submissionData.append('gallery', JSON.stringify(formData.gallery));
    }
    
    // If a new file is selected, append it
    if (coverImageFile) {
      submissionData.append('coverImage', coverImageFile);
    } else if (formData.coverImage && typeof formData.coverImage === 'string') {
      // Otherwise keep the existing URL
      submissionData.append('coverImage', formData.coverImage);
    }

    if (isEdit && slug) {
      success = await updateBlog(slug, submissionData);
    } else {
      success = await createBlog(submissionData);
    }
    
    setIsSaving(false);
    if (success) {
      navigate('/admin/blogs');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...(formData.tags || []), tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter(tag => tag !== tagToRemove) });
  };

  const handleAddGalleryImage = () => {
    if (galleryInput.trim() && !formData.gallery?.includes(galleryInput.trim())) {
      setFormData({ ...formData, gallery: [...(formData.gallery || []), galleryInput.trim()] });
      setGalleryInput('');
    }
  };

  const handleRemoveGalleryImage = (imgToRemove: string) => {
    setFormData({ ...formData, gallery: formData.gallery?.filter(img => img !== imgToRemove) });
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-xl font-medium text-gray-500">Loading blog data...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/blogs')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Blog Post' : 'Create Blog Post'}
          </h1>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isSaving}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Post'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Excerpt</label>
              <textarea 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                rows={3}
                value={formData.excerpt || ''}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="A short summary of the post..."
              />
            </div>
            <div className="mb-12 pb-6">
              <label className="block text-sm font-medium mb-1">Content *</label>
              <div className="h-[500px]">
                <ReactQuill 
                  theme="snow" 
                  value={formData.content || ''} 
                  onChange={(val) => setFormData({ ...formData, content: val })} 
                  style={{ height: '450px' }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Image Gallery</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Image URL"
                value={galleryInput}
                onChange={(e) => setGalleryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGalleryImage())}
              />
              <Button type="button" variant="outline" onClick={handleAddGalleryImage}>Add</Button>
            </div>
            {formData.gallery && formData.gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {formData.gallery.map((img, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden border">
                    <img src={img} alt="Gallery item" className="w-full h-24 object-cover" />
                    <button 
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveGalleryImage(img)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Settings</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Cover Image</label>
              <input 
                type="file" 
                accept="image/*"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 bg-gray-50"
                onChange={handleImageChange}
              />
              <p className="text-xs text-gray-500 mt-1">Images are automatically compressed and resized to save space before uploading.</p>
              
              {(coverImagePreview || formData.coverImage) && (
                <div className="mt-4 rounded-lg overflow-hidden border h-40 relative group">
                  <img 
                    src={coverImagePreview || formData.coverImage} 
                    alt="Cover Preview" 
                    className="w-full h-full object-cover" 
                  />
                  {coverImagePreview && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-medium">New Selection</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="pt-2">
              <label className="block text-sm font-medium mb-1">Tags</label>
              <div className="flex gap-2 mb-2">
                <input 
                  type="text" 
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="px-2 py-1 flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <span className="font-medium text-gray-900">Publish Post</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
