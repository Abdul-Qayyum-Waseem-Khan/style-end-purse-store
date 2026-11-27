import { useState, useEffect } from 'react';
import { Outlet, NavLink, Navigate, Link, useLocation } from 'react-router';
import {
  User as UserIcon,
  Package,
  MapPin,
  Heart,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Star,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { name: 'Account Overview', path: '/account', icon: UserIcon },
  { name: 'My Orders', path: '/account/orders', icon: Package },
  { name: 'Saved Addresses', path: '/account/addresses', icon: MapPin },
  { name: 'My Wishlist', path: '/account/wishlist', icon: Heart },
  { name: 'Rate Experience', path: '/account/rate-store', icon: Star },
];

export function AccountLayout() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF8F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-gray-200 border-t-[#111111] rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Loading Account...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  const SidebarNavList = () => (
    <div className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/account'}
            onClick={() => setIsMobileSidebarOpen(false)}
            className={({ isActive }) =>
              `group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs sm:text-sm transition-colors ${
                isActive
                  ? 'bg-[#111111] text-white font-semibold'
                  : 'text-gray-600 hover:bg-gray-100/80 hover:text-[#111111] font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C5A880]' : 'text-gray-500 group-hover:text-[#111111]'}`} />
                  <span className="truncate">{item.name}</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-[#C5A880]' : 'text-gray-300 group-hover:text-gray-500'
                  }`}
                />
              </>
            )}
          </NavLink>
        );
      })}

      <div className="h-px bg-gray-100 my-2.5" />

      <Link
        to="/"
        onClick={() => setIsMobileSidebarOpen(false)}
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm text-gray-700 hover:bg-gray-100/80 hover:text-[#111111] font-medium transition-colors"
      >
        <ShoppingBag className="w-4 h-4 text-gray-500 shrink-0" />
        <span>Continue Shopping</span>
      </Link>

      <button
        onClick={logout}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm text-red-600 hover:bg-red-50 font-medium transition-colors text-left"
      >
        <LogOut className="w-4 h-4 shrink-0" />
        <span>Sign Out</span>
      </button>
    </div>
  );

  return (
    <div className="bg-[#FAF8F5] min-h-[calc(100vh-80px)] font-sans text-[#111111]">
      {/* Top Breadcrumb & Mobile Menu Trigger */}
      <div className="bg-white border-b border-gray-200/80 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 -ml-1.5 mr-1 rounded-md text-[#111111] hover:bg-gray-100 transition-colors"
              aria-label="Open account menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="hover:text-[#111111] transition-colors font-medium">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#111111] font-semibold">My Account</span>
          </div>

          <span className="text-[11px] text-gray-500 hidden sm:inline truncate max-w-[240px]">
            {user?.email}
          </span>
        </div>
      </div>

      {/* Mobile Slide-Over Sidebar Drawer */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="relative w-72 max-w-[82vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-md bg-[#111111] text-[#C5A880] flex items-center justify-center font-serif font-bold text-sm shrink-0 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#111111] truncate font-serif-luxury">
                    {user?.name || 'Customer'}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-md text-gray-500 hover:text-black hover:bg-gray-100 shrink-0"
                aria-label="Close account menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5">
              <SidebarNavList />
            </div>
          </aside>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200/80 shadow-2xs flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-md bg-[#111111] text-[#C5A880] flex items-center justify-center font-serif font-bold text-base shrink-0 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-[#111111] text-sm truncate font-serif-luxury">
                    {user?.name || 'Customer'}
                  </h2>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>

              <nav className="bg-white rounded-lg border border-gray-200/80 shadow-2xs p-2.5">
                <SidebarNavList />
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-lg border border-gray-200/80 shadow-2xs p-4 sm:p-6 lg:p-8 min-h-[520px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
