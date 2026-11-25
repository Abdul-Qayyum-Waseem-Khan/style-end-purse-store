import { useState, useEffect } from 'react';
import { Mail, Search, FileDown, Plus, Send, Phone as Whatsapp, Trash2, Edit3, X } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { SEO } from '../../app/components/SEO';
import { toast } from 'sonner';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';

interface Subscriber {
  _id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
}

interface Campaign {
  _id: string;
  title: string;
  subject: string;
  content: string;
  status: 'draft' | 'sent';
  sentAt?: string;
  sentCount: number;
  createdAt: string;
}

export function NewsletterPage() {
  const [activeTab, setActiveTab] = useState<'subscribers' | 'campaigns'>('subscribers');

  // Subscribers State
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Campaigns State
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ title: '', subject: '', content: '' });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchSubscribers();
    fetchCampaigns();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setIsLoadingSubscribers(true);
      const { data } = await axiosInstance.get('/api/v1/newsletter');
      setSubscribers(data.data || []);
    } catch (err: any) {
      console.error('Error fetching subscribers:', err);
      toast.error('Failed to load subscribers');
    } finally {
      setIsLoadingSubscribers(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setIsLoadingCampaigns(true);
      const { data } = await axiosInstance.get('/api/v1/campaigns');
      setCampaigns(data.data || []);
    } catch (err: any) {
      console.error('Error fetching campaigns:', err);
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  // --- Subscribers Logic ---
  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Email', 'Status', 'Subscribed At'];
    const csvContent = [
      headers.join(','),
      ...filteredSubscribers.map(s => [
        s.email,
        s.isActive ? 'Active' : 'Unsubscribed',
        new Date(s.subscribedAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'subscribers.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Campaigns Logic ---
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.title || !newCampaign.subject || !newCampaign.content) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsCreating(true);
    try {
      await axiosInstance.post('/api/v1/campaigns', newCampaign);
      toast.success('Campaign created successfully');
      setNewCampaign({ title: '', subject: '', content: '' });
      setIsModalOpen(false);
      fetchCampaigns();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create campaign');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendCampaign = async (id: string) => {
    if (!window.confirm('Are you sure you want to send this email to ALL active subscribers?')) return;
    try {
      await axiosInstance.post(`/api/v1/campaigns/${id}/send`);
      toast.success('Campaign emails are being sent!');
      fetchCampaigns();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send campaign');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await axiosInstance.delete(`/api/v1/campaigns/${id}`);
      toast.success('Campaign deleted');
      fetchCampaigns();
    } catch (err: any) {
      toast.error('Failed to delete campaign');
    }
  };

  const generateWhatsappLink = (campaign: Campaign) => {
    const text = encodeURIComponent(`*${campaign.title}*\n\n${campaign.content.replace(/<[^>]*>?/gm, '')}\n\nShop now at: ${window.location.origin}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <SEO title="Newsletter & Campaigns | Admin Panel" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Newsletter & Campaigns</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'subscribers' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Subscribers
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'campaigns' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          News Campaigns
        </button>
      </div>

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 w-full justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors shrink-0"
            >
              <FileDown className="w-5 h-5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Subscriber</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Date Subscribed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoadingSubscribers ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      </tr>
                    ))
                  ) : filteredSubscribers.length > 0 ? (
                    filteredSubscribers.map((subscriber) => (
                      <tr key={subscriber._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                              <Mail className="w-5 h-5 text-brand-600" />
                            </div>
                            <span className="font-medium text-gray-900">{subscriber.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subscriber.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {subscriber.isActive ? 'Active' : 'Unsubscribed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(subscriber.subscribedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                        <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium text-gray-900 mb-1">No subscribers found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">News & Arrivals Campaigns</h2>
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Campaign
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoadingCampaigns ? (
              <p>Loading campaigns...</p>
            ) : campaigns.length > 0 ? (
              campaigns.map(campaign => (
                <div key={campaign._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{campaign.title}</h3>
                      <p className="text-sm text-gray-500">Subject: {campaign.subject}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {campaign.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1 mb-6 text-sm text-gray-600 border border-gray-100 p-4 rounded-xl bg-gray-50 line-clamp-3">
                    <div dangerouslySetInnerHTML={{ __html: campaign.content }} />
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-400">
                      {campaign.status === 'sent' ? (
                        <>Sent to {campaign.sentCount} subs on {new Date(campaign.sentAt!).toLocaleDateString()}</>
                      ) : (
                        <>Created on {new Date(campaign.createdAt).toLocaleDateString()}</>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleDeleteCampaign(campaign._id)} className="text-red-500 hover:bg-red-50 hover:border-red-200">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" onClick={() => generateWhatsappLink(campaign)} className="border-green-200 text-green-600 hover:bg-green-50">
                        <Whatsapp className="w-4 h-4 mr-2" /> Share
                      </Button>
                      {campaign.status === 'draft' && (
                        <Button onClick={() => handleSendCampaign(campaign._id)}>
                          <Send className="w-4 h-4 mr-2" /> Send
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-900 mb-1">No campaigns found</p>
                <p>Create a campaign to send news and new arrivals to your subscribers.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md">
              <h2 className="text-xl font-bold">Create New Campaign</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateCampaign} className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title (Internal)</Label>
                <Input
                  id="title"
                  value={newCampaign.title}
                  onChange={e => setNewCampaign(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Summer Sale 2024"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject Line</Label>
                <Input
                  id="subject"
                  value={newCampaign.subject}
                  onChange={e => setNewCampaign(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. ✨ Don't miss our new handbag arrivals!"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Email Content (HTML allowed)</Label>
                <textarea
                  id="content"
                  value={newCampaign.content}
                  onChange={e => setNewCampaign(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="<p>Hello! Check out our new arrivals...</p>"
                  rows={8}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
                <p className="text-xs text-gray-500">You can write plain text or HTML. This will be embedded in the standard email layout.</p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Saving...' : 'Save Draft'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
