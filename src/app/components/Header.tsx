import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  User as UserIcon, 
  Menu, 
  X, 
  ChevronDown,
  ChevronRight,
  LogOut,
  Package,
  MapPin,
  Shield,
  Sparkles,
  ArrowRight,
  Home,
  Grid,
  Phone,
  Truck,
  CheckCircle2,
  Flame,
  Layers
} from 'lucide-react';
import { Logo } from './Logo';
import { useCartStore } from '../../store/cartStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuth } from '../../hooks/useAuth';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { toast } from 'sonner';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSearchCategory, setSelectedSearchCategory] = useState('all');
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { itemCount, setDrawerOpen } = useCartStore();
  const { topBar, fetchSettings } = useSettingsStore();
  const { isAuthenticated, user, logout } = useAuth();
  const { categories } = useCategories();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  
  // Real-time dynamic product search filtered by category & keyword
  const { products } = useProducts({ 
    search: searchQuery, 
    category: selectedSearchCategory !== 'all' ? selectedSearchCategory : undefined,
    limit: 6 
  });

  const navigate = useNavigate();
  const location = useLocation();

  const totalCartCount = itemCount();
  const wishlistCount = user?.wishlist?.length || 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  // Focus search input when search opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // Click outside listener for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Prevent background scroll when mobile menu or search is open
  useEffect(() => {
    if (isMobileMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() || selectedSearchCategory !== 'all') {
      const targetCategory = selectedSearchCategory !== 'all' ? selectedSearchCategory : 'all';
      const searchParam = searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery.trim())}` : '';
      navigate(`/category/${targetCategory}${searchParam}`);
      setIsSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  const searchCategories = [
    { slug: 'all', name: 'All Collections' },
    { slug: 'handbags', name: 'Handbags' },
    { slug: 'shoes', name: 'Shoes & Heels' },
    { slug: 'pouches', name: 'Pouches' },
    { slug: 'sets', name: '3-Piece Sets' },
    ...(categories.filter(c => !['handbags', 'shoes', 'pouches', 'sets'].includes(c.slug)))
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md transition-all duration-200">
        
        {/* 1. Dynamic Top Announcement Bar (Managed in Admin Settings) */}
        {topBar?.enabled && (topBar.leftText || topBar.centerText || topBar.rightText) && (
          <div className="bg-[#111111] text-white text-[10px] sm:text-[11px] font-normal tracking-wide py-1.5 sm:py-2 px-3 sm:px-4 text-center border-b border-white/5">
            <div className="container mx-auto flex items-center justify-between">
              <span className="hidden lg:inline text-gray-400 text-[10.5px]">
                {topBar.leftText}
              </span>
              <span className="w-full lg:w-auto text-center font-medium truncate">
                {topBar.centerText}
              </span>
              <span className="hidden lg:inline text-gray-400 font-mono text-[10.5px]">
                {topBar.rightText}
              </span>
            </div>
          </div>
        )}

        {/* 2. Main Navigation Bar */}
        <div className={`w-full border-b border-gray-100 transition-all duration-200 relative ${
          isScrolled ? 'py-2.5 sm:py-3 shadow-xs' : 'py-3 sm:py-4'
        }`}>
          <div className="container mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
            {isSearchOpen ? (
              /* Inline Navbar Search Bar (hides logo & icons cleanly while open) */
              <div className="w-full flex items-center gap-2 sm:gap-3 animate-in fade-in duration-150">
                <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search handbags, shoes, clutches, sets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-20 rounded-full border border-gray-200 text-xs sm:text-sm focus:outline-hidden focus:border-black bg-gray-50 focus:bg-white transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-16 text-gray-400 hover:text-gray-700 p-1 text-xs"
                      aria-label="Clear search"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="submit"
                    className="absolute right-1 bg-[#111111] hover:bg-black text-white text-[11px] font-semibold px-3.5 py-1.5 rounded-full transition-colors"
                  >
                    Search
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="p-2 rounded-full text-gray-600 hover:text-black hover:bg-gray-100 transition-colors shrink-0"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
            <>
            {/* Left: Mobile Menu Toggle & Brand Logo */}
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink-0">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 -ml-1 rounded-xl text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation shrink-0"
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Responsive Logo */}
              <Link to="/" className="flex items-center shrink-0">
                <Logo className="h-7 sm:h-9 md:h-10 w-auto" />
              </Link>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-7 text-[11px] xl:text-[12px] font-semibold uppercase tracking-[0.1em] xl:tracking-[0.14em] text-[#111111]">
              <Link 
                to="/category/handbags" 
                className={`whitespace-nowrap hover:text-gray-500 transition-colors py-1 relative ${
                  location.pathname.includes('handbags') 
                    ? 'text-black after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-black' 
                    : ''
                }`}
              >
                Handbags
              </Link>
              <Link 
                to="/category/shoes" 
                className={`whitespace-nowrap hover:text-gray-500 transition-colors py-1 relative ${
                  location.pathname.includes('shoes') 
                    ? 'text-black after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-black' 
                    : ''
                }`}
              >
                Shoes & Heels
              </Link>
              <Link 
                to="/category/pouches" 
                className={`whitespace-nowrap hover:text-gray-500 transition-colors py-1 relative ${
                  location.pathname.includes('pouches') 
                    ? 'text-black after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-black' 
                    : ''
                }`}
              >
                Pouches & Wallets
              </Link>
              <Link 
                to="/category/sets" 
                className={`whitespace-nowrap hover:text-gray-500 transition-colors py-1 relative ${
                  location.pathname.includes('sets') 
                    ? 'text-amber-800 after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-amber-800' 
                    : 'text-amber-800 font-bold'
                }`}
              >
                3-Piece Sets
              </Link>
              <Link 
                to="/category/all" 
                className="whitespace-nowrap text-gray-500 hover:text-black transition-colors py-1"
              >
                New Arrivals
              </Link>
            </nav>

            {/* Right: Action Icons (Touch-friendly for mobile) */}
            <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
              
              {/* Search Trigger */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 xl:px-3.5 xl:py-1.5 text-gray-700 hover:text-black transition-all flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-200/80 active:scale-95 touch-manipulation"
                aria-label="Search catalog"
              >
                <Search className="w-4 h-4 text-gray-700" />
                <span className="hidden xl:inline text-xs text-gray-500 font-normal">Search catalog...</span>
              </button>

              {/* Wishlist Button (Desktop & Tablet) */}
              <Link 
                to={isAuthenticated ? "/account/wishlist" : "/login"}
                className="relative p-2 text-gray-700 hover:text-black transition-colors rounded-full hover:bg-gray-100 active:scale-95 touch-manipulation"
                aria-label="Wishlist"
              >
                <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Profile Dropdown Trigger */}
              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={`p-1.5 sm:p-2 rounded-full transition-all flex items-center gap-1.5 active:scale-95 touch-manipulation ${
                    isProfileMenuOpen ? 'text-black bg-gray-100' : 'text-gray-700 hover:text-black hover:bg-gray-50'
                  }`}
                  aria-label="User Account Menu"
                  aria-expanded={isProfileMenuOpen}
                >
                  {isAuthenticated && user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-gray-300" />
                  ) : isAuthenticated ? (
                    <div className="w-6 h-6 rounded-full bg-[#111111] text-[#C5A880] flex items-center justify-center text-[10px] font-bold shadow-xs">
                      {initials}
                    </div>
                  ) : (
                    <UserIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  )}
                  <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 hidden sm:block ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Luxury Dropdown Menu (Positioned safely for mobile screens) */}
                {isProfileMenuOpen && (
                  <div className="absolute right-[-44px] sm:right-0 mt-2 w-[calc(100vw-24px)] max-w-xs sm:w-72 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]">
                    {isAuthenticated ? (
                      <div>
                        {/* User Header */}
                        <div className="p-3 bg-gradient-to-r from-[#111111] to-[#222222] text-white rounded-xl mb-2 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-black border border-[#C5A880]/50 text-[#C5A880] flex items-center justify-center text-sm font-serif font-bold shrink-0">
                            {user?.avatar ? (
                              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <span>{initials}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate font-serif-luxury">{user?.name || 'Valued Client'}</p>
                            <p className="text-[10.5px] text-gray-300 truncate">{user?.email}</p>
                            <span className="inline-block text-[9px] text-[#C5A880] uppercase tracking-wider font-semibold mt-0.5">
                              VIP Member
                            </span>
                          </div>
                        </div>

                        {/* Navigation Options */}
                        <div className="space-y-0.5 text-xs">
                          <Link 
                            to="/account"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-black font-medium"
                          >
                            <UserIcon className="w-4 h-4 text-gray-500" />
                            <span>Account Dashboard</span>
                          </Link>

                          <Link 
                            to="/account/orders"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-black font-medium"
                          >
                            <Package className="w-4 h-4 text-gray-500" />
                            <span>My Orders & Tracking</span>
                          </Link>

                          <Link 
                            to="/account/addresses"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-black font-medium"
                          >
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>Saved Addresses</span>
                          </Link>

                          <Link 
                            to="/account/wishlist"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-black font-medium"
                          >
                            <Heart className="w-4 h-4 text-gray-500" />
                            <span>My Wishlist ({wishlistCount})</span>
                          </Link>

                          {user?.role === 'admin' && (
                            <Link 
                              to="/admin"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-amber-50/80 hover:bg-amber-100 text-amber-900 font-semibold border border-amber-200/60 my-1"
                            >
                              <Shield className="w-4 h-4 text-amber-700" />
                              <span>Admin Portal</span>
                            </Link>
                          )}

                          <div className="h-px bg-gray-100 my-1" />

                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 space-y-3">
                        <div className="text-center pb-2 border-b border-gray-100">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2 text-gray-700">
                            <UserIcon className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-gray-900">Welcome to Style End Purse</p>
                          <p className="text-[11px] text-gray-500">Sign in to track deliveries and access wishlist</p>
                        </div>

                        <div className="space-y-2">
                          <Link
                            to="/login"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="block w-full text-center bg-[#111111] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-xs"
                          >
                            Sign In
                          </Link>
                          <Link
                            to="/register"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="block w-full text-center bg-gray-50 hover:bg-gray-100 text-black text-xs font-semibold uppercase tracking-wider py-2.5 rounded-xl border border-gray-200 transition-all"
                          >
                            Create Account
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Shopping Bag Button */}
              <button 
                onClick={() => setDrawerOpen(true)}
                className="relative flex items-center gap-1.5 sm:gap-2 bg-[#111111] hover:bg-black text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-semibold transition-all active:scale-95 shadow-sm touch-manipulation"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-mono text-xs font-bold">{totalCartCount}</span>
              </button>

            </div>
            </>
            )}

          </div>

          {/* Inline Live Search Results Dropdown */}
          {isSearchOpen && searchQuery.trim().length > 1 && (
            <div className="absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-lg z-50 max-h-[70vh] overflow-y-auto">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-700">
                    Results ({products.length})
                  </span>
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {products.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">No products found.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {products.map((p: any) => (
                      <Link
                        key={p.id || p._id}
                        to={`/product/${p.slug}`}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="group p-2 rounded-lg border border-gray-100 hover:border-gray-300 transition-all bg-white"
                      >
                        <div className="aspect-[4/5] rounded-md overflow-hidden bg-gray-50 mb-1.5">
                          <img
                            src={p.images?.[0]?.url || p.images?.[0] || ''}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <p className="text-[11px] font-semibold text-gray-900 truncate">{p.name}</p>
                        <p className="text-[11px] font-bold text-gray-700 font-mono">PKR {(p.price || 0).toLocaleString()}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 3. Mobile Slide-Over Drawer Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide-out Drawer Panel */}
            <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden z-10 animate-in slide-in-from-left duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
              
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                <Logo />
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="p-2 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                
                {/* Compact Account Links */}
                {isAuthenticated ? (
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
                    <Link
                      to="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-xs font-semibold text-[#111111] hover:underline truncate"
                    >
                      {user?.name || 'My Account'}
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to="/account/orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-xs font-medium text-gray-600 hover:text-black px-2.5 py-1 rounded-md bg-gray-100"
                      >
                        Orders
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-xs font-semibold text-amber-800 px-2.5 py-1 rounded-md bg-amber-50"
                        >
                          Admin
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 text-center bg-[#111111] text-white text-xs font-semibold py-2 rounded-md"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 text-center bg-white text-[#111111] text-xs font-semibold py-2 rounded-md border border-gray-300"
                    >
                      Register
                    </Link>
                  </div>
                )}

                {/* Primary Category Links */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block px-2 mb-2">
                    Explore Catalog
                  </span>

                  <Link 
                    to="/category/handbags" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 text-sm font-semibold text-gray-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <span>Handbags & Purses</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link 
                    to="/category/shoes" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 text-sm font-semibold text-gray-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span>Shoes & Stilettos</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link 
                    to="/category/pouches" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 text-sm font-semibold text-gray-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                        <Layers className="w-4 h-4" />
                      </div>
                      <span>Pouches & Wallets</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link 
                    to="/category/sets" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 hover:bg-amber-100/70 text-sm font-bold text-amber-950 border border-amber-200/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-200/70 flex items-center justify-center text-amber-900">
                        <Flame className="w-4 h-4 text-amber-700 fill-amber-700" />
                      </div>
                      <span>3-Piece Matching Sets</span>
                    </div>
                    <span className="text-[9px] uppercase font-bold tracking-wider bg-amber-500 text-black px-2 py-0.5 rounded-full">
                      HOT
                    </span>
                  </Link>

                  <Link 
                    to="/category/all" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 text-sm font-semibold text-gray-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                        <Grid className="w-4 h-4" />
                      </div>
                      <span>All New Arrivals</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                </div>

                {/* Secondary Account / Links */}
                <div className="space-y-1 pt-3 border-t border-gray-100 text-xs text-gray-700">
                  <Link 
                    to={isAuthenticated ? "/account/wishlist" : "/login"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-lg"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-gray-500" />
                      Wishlist
                    </span>
                    <span className="font-bold text-gray-900">{wishlistCount}</span>
                  </Link>

                  <Link 
                    to="/track-order" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 px-2 hover:bg-gray-50 rounded-lg"
                  >
                    <Truck className="w-4 h-4 text-gray-500" />
                    <span>Track Your Order</span>
                  </Link>

                  <Link 
                    to="/contact" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 px-2 hover:bg-gray-50 rounded-lg"
                  >
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>Customer Concierge</span>
                  </Link>

                  {isAuthenticated && user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-2 px-2 text-amber-800 font-bold bg-amber-50 rounded-lg"
                    >
                      <Shield className="w-4 h-4 text-amber-700" />
                      <span>Admin Management Portal</span>
                    </Link>
                  )}
                </div>

              </div>

              {/* Drawer Footer */}
              {isAuthenticated && (
                <div className="p-4 border-t border-gray-100 shrink-0">
                  <button 
                    onClick={handleLogout}
                    className="text-xs text-red-600 font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      {/* 5. Mobile Bottom Navigation Dock (Fixed app-like bar for mobile viewports) */}
      <nav 
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-center justify-around text-center">
          
          {/* Home */}
          <Link 
            to="/" 
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors touch-manipulation ${
              location.pathname === '/' ? 'text-black font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Home</span>
          </Link>

          {/* Shop / Categories */}
          <Link 
            to="/category/all" 
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors touch-manipulation ${
              location.pathname.startsWith('/category') ? 'text-black font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Catalog</span>
          </Link>

          {/* Search Trigger */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex flex-col items-center py-1 px-3 rounded-xl text-gray-500 hover:text-gray-900 transition-colors touch-manipulation"
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Search</span>
          </button>

          {/* Wishlist */}
          <Link 
            to={isAuthenticated ? "/account/wishlist" : "/login"}
            className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition-colors touch-manipulation ${
              location.pathname.includes('wishlist') ? 'text-black font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-2 min-w-[14px] h-[14px] bg-black text-white text-[8.5px] font-bold rounded-full flex items-center justify-center px-0.5">
                {wishlistCount}
              </span>
            )}
            <span className="text-[10px] mt-0.5">Wishlist</span>
          </Link>

          {/* Cart Bag Drawer Trigger */}
          <button 
            onClick={() => setDrawerOpen(true)}
            className="relative flex flex-col items-center py-1 px-3 rounded-xl text-black font-bold transition-colors touch-manipulation"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute top-0 right-2 min-w-[14px] h-[14px] bg-amber-500 text-black text-[8.5px] font-extrabold rounded-full flex items-center justify-center px-0.5 shadow-xs">
                {totalCartCount}
              </span>
            )}
            <span className="text-[10px] mt-0.5">Bag</span>
          </button>

        </div>
      </nav>
    </>
  );
}
