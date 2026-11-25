import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminRoute } from '../components/AdminRoute';
import { ScrollToTop } from '../components/ScrollToTop';
import { useAuth } from '../hooks/useAuth';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CategoryPage } from '../pages/CategoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrderSuccessPage } from '../pages/OrderSuccessPage';
import { CartDrawer } from '../components/CartDrawer';
import { Toaster } from './components/ui/sonner';
import { BlogListPage } from '../pages/BlogListPage';
import { BlogDetailPage } from '../pages/BlogDetailPage';

// Admin imports
import { AdminLayout } from '../layouts/AdminLayout';
import { OverviewPage } from '../pages/admin/OverviewPage';
import { MarketingAnalyticsPage } from '../pages/admin/MarketingAnalyticsPage';
import { OrdersPage as OrdersPageAdmin } from '../pages/admin/OrdersPage';
import { OrderDetailPage } from '../pages/admin/OrderDetailPage';
import { ProductsPage } from '../pages/admin/ProductsPage';
import { ProductFormPage } from '../pages/admin/ProductFormPage';
import { InventoryPage } from '../pages/admin/InventoryPage';
import { CategoriesPage } from '../pages/admin/CategoriesPage';
import { UsersPage } from '../pages/admin/UsersPage';
import { NotificationsPage } from '../pages/admin/NotificationsPage';
import { ReviewsPage } from '../pages/admin/ReviewsPage';
import { TransactionsPage } from '../pages/admin/TransactionsPage';
import { OffersPage } from '../pages/admin/OffersPage';
import { CouponsPage } from '../pages/admin/CouponsPage';
import { ReturnsPage } from '../pages/admin/ReturnsPage';
import { BannersPage } from '../pages/admin/BannersPage';
import { HeroBannerManager } from '../pages/admin/HeroBannerManager';
import { BlogsPage } from '../pages/admin/BlogsPage';
import { BlogFormPage } from '../pages/admin/BlogFormPage';
import { PagesPage } from '../pages/admin/PagesPage';
import { MessagesPage } from '../pages/admin/MessagesPage';
import { NewsletterPage } from '../pages/admin/NewsletterPage';
import { SettingsPage } from '../pages/admin/SettingsPage';
import { SecuritySettingsPage } from '../pages/admin/SecuritySettingsPage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';

import { HelmetProvider } from 'react-helmet-async';

import { useAttribution } from '../hooks/useAttribution';
import { useVisitorTracking } from '../hooks/useVisitorTracking';
import { PixelTracker } from '../components/PixelTracker';

const TrackingLayer = () => {
  useAttribution();
  useVisitorTracking();
  return <PixelTracker />;
};

// Layout component to include Header and Footer for storefront
const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

import { toast } from 'sonner';
import { AccountLayout } from '../layouts/AccountLayout';
import { ProfilePage } from '../pages/account/ProfilePage';
import { OrdersPage } from '../pages/account/OrdersPage';
import { AddressesPage } from '../pages/account/AddressesPage';
import { WishlistPage } from '../pages/account/WishlistPage';
// import { PaymentMethodsPage } from '../pages/account/PaymentMethodsPage';
import { AppReviewPage } from '../pages/account/AppReviewPage';
import { TrackOrderPage } from '../pages/TrackOrderPage';
import { ReturnRequestPage } from '../pages/account/ReturnRequestPage';
import { ReturnSlipPage } from '../pages/account/ReturnSlipPage';
import { ReturnPolicyPage } from '../pages/ReturnPolicyPage';
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage';

export default function App() {
  const { fetchCurrentUser, isLoading } = useAuth();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <TrackingLayer />
        <ScrollToTop />
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<OverviewPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductFormPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="marketing" element={<MarketingAnalyticsPage />} />
            <Route path="orders" element={<OrdersPageAdmin />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="returns" element={<ReturnsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="offers" element={<OffersPage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="banners" element={<BannersPage />} />
            <Route path="hero-banner" element={<HeroBannerManager />} />
            <Route path="blogs" element={<BlogsPage />} />
            <Route path="blogs/new" element={<BlogFormPage />} />
            <Route path="blogs/:slug" element={<BlogFormPage />} />
            <Route path="pages" element={<PagesPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="newsletter" element={<NewsletterPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="security" element={<SecuritySettingsPage />} />
          </Route>

          {/* Customer Account Routes */}
            <Route path="/account" element={
              <ProtectedRoute>
                <AccountLayout />
              </ProtectedRoute>
            }>
              <Route index element={<ProfilePage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="rate-store" element={<AppReviewPage />} />
              <Route path="return/:orderId" element={<ReturnRequestPage />} />
              <Route path="return/slip/:returnId" element={<ReturnSlipPage />} />
              <Route path="addresses" element={<AddressesPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
            </Route>

            {/* Storefront Routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/search" element={<CategoryPage />} /> {/* Using CategoryPage as search page for now */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/blogs" element={<BlogListPage />} />
            <Route path="/blogs/:slug" element={<BlogDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/returns" element={<ReturnPolicyPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            
            {/* Protected User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
