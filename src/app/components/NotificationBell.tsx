import { useEffect, useState } from 'react';
import { Bell, ShoppingBag, Package, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from './ui/popover';
import { Button } from './ui/button';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuth } from '../../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Poll for notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  const handleNotificationClick = (notification: any) => {
    setIsOpen(false);
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    if (notification.relatedId) {
      // Admin notifications (new order placed) go to admin dashboard
      const adminTypes = ['order_placed', 'low_stock'];
      if (adminTypes.includes(notification.type)) {
        navigate(`/admin/orders/${notification.relatedId}`);
      } else {
        // User notifications go to user account orders
        navigate('/account/orders');
      }
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'order_placed':
        return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      case 'order_shipped':
        return <Package className="w-4 h-4 text-brand-500" />;
      case 'order_delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'order_confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'order_cancelled':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'order_returned':
      case 'order_update':
        return <Package className="w-4 h-4 text-orange-500" />;
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-600 hover:bg-gray-100">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4" align="end">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <button 
              onClick={() => markAllAsRead()}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications yet.
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <div 
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex gap-3 p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-brand-50/30' : ''}`}
                >
                  <div className="shrink-0 mt-0.5">
                    {getIconForType(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {notif.body}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : ''}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="shrink-0 mt-1.5">
                      <div className="w-2 h-2 rounded-full bg-brand-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-2 border-t border-gray-100">
          <Button 
            variant="ghost" 
            className="w-full text-xs text-gray-500 h-8 justify-center"
            onClick={() => {
              setIsOpen(false);
              navigate(user?.role === 'admin' ? '/admin/notifications' : '/account/notifications');
            }}
          >
            See all notifications
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
