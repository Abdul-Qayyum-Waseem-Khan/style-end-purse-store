import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useNotificationStore } from '../../store/notificationStore';
import { Button } from '../../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Bell, CheckCircle, Trash2, ArrowLeft, ShoppingBag, Package, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export function NotificationsPage() {
  const navigate = useNavigate();
  const notifications = useNotificationStore(state => state.notifications) || [];
  const isLoading = useNotificationStore(state => state.isLoading);
  const fetchNotifications = useNotificationStore(state => state.fetchNotifications);
  const markAsRead = useNotificationStore(state => state.markAsRead);
  const markAllAsRead = useNotificationStore(state => state.markAllAsRead);
  const clearAllNotifications = useNotificationStore(state => state.clearAllNotifications);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    
    if (notification.relatedId) {
      const adminTypes = ['order_placed', 'low_stock'];
      if (adminTypes.includes(notification.type)) {
        navigate(`/admin/orders/${notification.relatedId}`);
      } else {
        navigate('/account/orders');
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    toast.success('All notifications marked as read');
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications? This cannot be undone.')) {
      await clearAllNotifications();
      toast.success('All notifications cleared');
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'order_placed':
        return <ShoppingBag className="w-5 h-5 text-blue-500" />;
      case 'order_shipped':
        return <Package className="w-5 h-5 text-orange-500" />;
      case 'order_delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'order_confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'order_cancelled':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'low_stock':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-full pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-orange-600" />
              Notifications
            </h1>
            <p className="text-gray-600 mt-1">Manage your alerts and updates.</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleMarkAllAsRead}
              disabled={notifications.length === 0 || !notifications.some(n => !n.isRead)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All as Read
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading && notifications.length === 0 ? (
              <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-12 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
                <p className="text-gray-500">You're all caught up! New alerts will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <div 
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex items-start gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-orange-50/30' : ''}`}
                  >
                    <div className="shrink-0 mt-1 bg-white p-2 rounded-full shadow-sm border border-gray-100">
                      {getIconForType(notif.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                        <p className={`text-base ${!notif.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 whitespace-nowrap">
                          {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : ''}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">
                        {notif.body}
                      </p>
                    </div>

                    {!notif.isRead && (
                      <div className="shrink-0 self-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
