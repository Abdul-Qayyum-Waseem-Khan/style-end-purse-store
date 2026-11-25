import { useState } from 'react';
import { useBlogs } from '../../hooks/useBlogs';
import { Button } from '../../app/components/ui/button';
import { Badge } from '../../app/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { formatDate } from '../../utils/format';

export function BlogsPage() {
  const { blogs, isLoading, deleteBlog } = useBlogs({ admin: true });

  const handleDelete = async (slug: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      await deleteBlog(slug);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
        <Link to="/admin/blogs/new">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Post</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : blogs.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center">No blog posts found.</td></tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={blog.coverImage || 'https://via.placeholder.com/150'} 
                          alt={blog.title} 
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{blog.title}</p>
                          <p className="text-sm text-gray-500">/{blog.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(blog.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={blog.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                        {blog.isActive ? 'Active' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link to={`/admin/blogs/${blog.slug}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(blog.slug)}>
                          <Trash2 className="w-4 h-4" />
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
