import { useContacts } from '../../hooks/useContacts';
import { Badge } from '../../app/components/ui/badge';
import { Button } from '../../app/components/ui/button';
import { CheckCircle2, Trash2, Eye, X } from 'lucide-react';
import { formatDate } from '../../utils/format';
import { useState } from 'react';

export function MessagesPage() {
  const { messages, isLoading, markAsRead, deleteMessage } = useContacts();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">From</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Subject</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center">Loading messages...</td></tr>
              ) : messages.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center">No messages received yet.</td></tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg._id} className={`hover:bg-gray-50 ${!msg.isRead ? 'bg-orange-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{msg.name}</p>
                      <p className="text-sm text-gray-500">{msg.email}</p>
                      {msg.phone && <p className="text-sm text-gray-500">{msg.phone}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{msg.subject}</p>
                      {msg.disease && <p className="text-sm font-medium text-brand-600">Issue: {msg.disease}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(msg.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      {msg.isRead ? (
                        <Badge variant="outline" className="text-gray-500">Read</Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-700">New</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {!msg.isRead && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => markAsRead(msg._id)}
                            title="Mark as read"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedMessage(msg);
                            if (!msg.isRead) markAsRead(msg._id);
                          }}
                          title="View Message"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this message?')) {
                              deleteMessage(msg._id);
                            }
                          }}
                          title="Delete message"
                        >
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

      {/* Message View Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">{selectedMessage.subject}</h3>
              <button 
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-500 bg-white rounded-full p-1 border border-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Name</p>
                  <p className="font-medium text-gray-900">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Email</p>
                  <p className="font-medium text-gray-900">{selectedMessage.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Phone</p>
                  <p className="font-medium text-gray-900">{selectedMessage.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Age</p>
                  <p className="font-medium text-gray-900">{selectedMessage.age || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Disease / Condition</p>
                  <p className="font-medium text-brand-600">{selectedMessage.disease || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Message</p>
                <div className="bg-white p-4 rounded-xl border border-gray-200 text-gray-700 whitespace-pre-wrap min-h-[100px]">
                  {selectedMessage.message}
                </div>
              </div>
              
              <div className="text-xs text-gray-400 text-right">
                Received: {formatDate(selectedMessage.createdAt)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
