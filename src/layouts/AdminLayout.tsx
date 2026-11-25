import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Tags, 
  Users, 
  CreditCard, 
  Percent, 
  Settings, 
  LogOut,
  Bell,
  Plus,
  Menu,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  LayoutTemplate,
  MessageSquare,
  CornerDownLeft,
  Mail,
  Star,
  Shield,
  Target
} from 'lucide-react';
import { Button } from '../app/components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle
} from '../app/components/ui/sheet';
import { NotificationBell } from '../app/components/NotificationBell';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Marketing', path: '/admin/marketing', icon: Target },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { name: 'Returns', path: '/admin/returns', icon: CornerDownLeft },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Inventory', path: '/admin/inventory', icon: LayoutDashboard },
  { name: 'Categories', path: '/admin/categories', icon: Tags },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Reviews', path: '/admin/reviews', icon: Star },
  { name: 'Transactions', path: '/admin/transactions', icon: CreditCard },
  { name: 'Offers', path: '/admin/offers', icon: Percent },
  { name: 'Coupons', path: '/admin/coupons', icon: Tags },
  { name: 'Flash Ads', path: '/admin/banners', icon: ImageIcon },
  { name: 'Hero Banner', path: '/admin/hero-banner', icon: LayoutTemplate },
  { name: 'Blogs', path: '/admin/blogs', icon: FileText },
  { name: 'Pages', path: '/admin/pages', icon: LayoutTemplate },
  { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
  { name: 'News & Campaigns', path: '/admin/newsletter', icon: Mail },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
  { name: 'Security', path: '/admin/security', icon: Shield },
];

export function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user: currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile sheet on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentRouteName = navItems.find(item => location.pathname.startsWith(item.path))?.name || 'Admin';

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#111111] text-neutral-300 border-r border-neutral-800">
      {/* Logo Area */}
      <div className={`h-16 flex items-center shrink-0 bg-white border-b border-neutral-200 ${isCollapsed ? 'justify-center px-2' : 'px-5'}`}>
        {isCollapsed ? (
          <img src="/favicon.svg" alt="Style End Purse" className="w-8 h-8 object-contain" />
        ) : (
          <div className="flex items-center justify-between w-full gap-2">
            <img src="/style-end-logo.svg" alt="Style End Purse" className="h-9 w-auto object-contain" />
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#111111] text-[#C5A880]">
              Admin
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1 scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30 shadow-xs' 
                  : 'hover:bg-white/5 hover:text-white border border-transparent'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#C5A880]' : 'text-neutral-400'}`} />
              {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* User Profile */}
      <div className={`p-4 border-t border-neutral-800 shrink-0 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center mb-4' : 'gap-3 mb-4'}`}>
          <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center shrink-0 text-[#C5A880] font-bold border border-[#C5A880]/40">
            {currentUser?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser?.name || 'Admin User'}</p>
              <p className="text-xs text-neutral-400 truncate">{currentUser?.email}</p>
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          className={`w-full text-neutral-400 hover:text-white hover:bg-white/5 ${isCollapsed ? 'p-2 h-10' : 'justify-start gap-2'}`}
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FAF8F5] overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col relative transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] shrink-0 z-20 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderSidebarContent()}
        
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-20 w-7 h-7 bg-[#111111] text-[#C5A880] border-2 border-neutral-700 rounded-full flex items-center justify-center hover:bg-neutral-800 hover:text-white transition-colors z-30 shadow-sm"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200/80 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10">
          
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Trigger */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-gray-700 hover:bg-gray-100">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 bg-[#111111] border-r-neutral-800">
                <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
                {renderSidebarContent()}
              </SheetContent>
            </Sheet>

            <h1 className="text-xl font-semibold text-[#111111] hidden sm:block">
              {currentRouteName}
            </h1>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}
