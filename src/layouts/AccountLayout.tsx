import { useState } from 'react';
import { Outlet, NavLink, Navigate, Link } from 'react-router';
import { 
  User as UserIcon, 
  Package, 
  MapPin, 
  Heart, 
  LogOut, 
  ChevronRight, 
  Home, 
  Menu, 
  X, 
  Star, 
  ShieldCheck, 
  Sparkles,
  PhoneCall,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { name: 'Account Overview', path: '/account', icon: UserIcon, description: 'Profile, tier & quick stats' },
  { name: 'My Orders', path: '/account/orders', icon: Package, description: 'Track & manage deliveries' },
  { name: 'Saved Addresses', path: '/account/addresses', icon: MapPin, description: 'Shipping & doorstep info' },
  { name: 'My Wishlist', path: '/account/wishlist', icon: Heart, description: 'Curated saved items' },
  { name: 'Rate Experience', path: '/account/rate-store', icon: Star, description: 'Share your boutique review' },
];

export function AccountLayout() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-[#111111] rounded-full animate-spin"></div>
          <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Loading Your Account...</p>
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

  return (
    <div className="bg-[#FBFBFA] min-h-[calc(100vh-80px)] font-sans text-[#111111]">
      
      {/* Top Luxury Banner / Breadcrumb */}
      <div className="bg-white border-b border-gray-100 py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-black transition-colors font-medium">Boutique Home</Link>
            <span>/</span>
            <span className="text-black font-semibold">Customer Account</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-amber-700 bg-amber-50/80 px-3 py-1 rounded-full border border-amber-200/60 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Style End Purse VIP Member</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-[320px] shrink-0">
            <div className="sticky top-24 space-y-5">
              
              {/* User Profile Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#C5A880]/15 to-transparent rounded-bl-full pointer-events-none" />
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-[#111111] text-[#C5A880] border-2 border-[#C5A880]/40 shadow-sm flex items-center justify-center overflow-hidden shrink-0 font-serif font-bold text-xl tracking-wider">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs" title="Verified Member">
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-bold text-gray-900 text-base truncate font-serif-luxury">{user?.name || 'Customer'}</h2>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                    
                    <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold tracking-wide border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Customer
                    </div>
                  </div>

                  {/* Mobile Menu Toggle */}
                  <button 
                    className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors shrink-0"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle navigation"
                  >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className={`bg-white rounded-2xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-2.5 transition-all duration-200 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
                <div className="space-y-1 w-full">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/account'}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                            isActive
                              ? 'bg-[#111111] text-white shadow-xs font-semibold'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-black font-medium'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                isActive ? 'bg-white/15 text-[#C5A880]' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-black'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="truncate text-left">
                                <div className="text-xs sm:text-sm font-semibold">{item.name}</div>
                                <div className={`text-[10px] truncate hidden sm:block ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                                  {item.description}
                                </div>
                              </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                              isActive ? 'text-[#C5A880] translate-x-0 opacity-100' : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-gray-400'
                            }`} />
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                  
                  <div className="h-px bg-gray-100 my-2 mx-2" />

                  {/* Back to Boutique Shopping */}
                  <Link
                    to="/"
                    className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-black font-medium transition-colors text-xs sm:text-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <span>Continue Shopping</span>
                  </Link>

                  {/* Sign Out */}
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors text-xs sm:text-sm text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span>Sign Out</span>
                  </button>
                </div>
              </nav>

              {/* VIP Concierge Assistance Card */}
              <div className="hidden lg:block bg-gradient-to-br from-[#111111] to-[#222222] text-white p-5 rounded-2xl border border-black shadow-md relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#C5A880]/15 rounded-full blur-xl" />
                <div className="flex items-center gap-2 text-[#C5A880] text-xs font-semibold uppercase tracking-wider mb-2">
                  <PhoneCall className="w-3.5 h-3.5" />
                  VIP Concierge Support
                </div>
                <p className="text-xs text-gray-300 leading-relaxed mb-3 font-normal">
                  Need priority assistance with your luxury handbags, shoes or delivery status?
                </p>
                <Link 
                  to="/contact" 
                  className="inline-block w-full text-center bg-[#C5A880] hover:bg-[#b0936d] text-black text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider transition-colors shadow-xs"
                >
                  Contact Concierge
                </Link>
              </div>

            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-200/80 p-5 sm:p-8 lg:p-10 min-h-[560px]">
              <Outlet />
            </div>
          </main>
          
        </div>
      </div>
    </div>
  );
}
