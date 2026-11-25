import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Shield, Key } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { Logo } from '../../app/components/Logo';
import axiosInstance from '../../api/axios';
import { startAuthentication } from '@simplewebauthn/browser';
import { toast } from 'sonner';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  // 2FA States
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [authMethods, setAuthMethods] = useState<{ totp: boolean, webAuthn: boolean }>({ totp: false, webAuthn: false });
  const [totpCode, setTotpCode] = useState('');

  const { login, fetchCurrentUser, setUser } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (userObj?: any) => {
    let finalUser = userObj;
    if (userObj) {
      setUser(userObj);
    } else {
      await fetchCurrentUser();
    }
    
    if (finalUser?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsUnverified(false);
    setIsSubmitting(true);
    
    try {
      const result = await login({ email, password });
      if (result?.requires2FA) {
        setRequires2FA(true);
        setTempToken(result.tempToken);
        setAuthMethods(result.methods);
      } else {
        import('../../utils/tracking').then(({ trackEvent }) => {
          trackEvent('login', { method: 'Email' });
        });
        await handleSuccess(result?.user);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Invalid email or password';
      setError(errorMsg);
      if (err.response?.data?.isUnverified || errorMsg.toLowerCase().includes('verify your email')) {
        setIsUnverified(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      await axiosInstance.post('/api/v1/auth/resend-verification', { email });
      setError('');
      setIsUnverified(false);
      toast.success(`Verification link sent to ${email}. Please check your inbox!`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const { data } = await axiosInstance.post('/api/v1/auth/login/totp', { tempToken, code: totpCode });
      import('../../utils/tracking').then(({ trackEvent }) => trackEvent('login', { method: 'TOTP' }));
      await handleSuccess(data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWebAuthnLogin = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const { data: options } = await axiosInstance.post('/api/v1/auth/login/webauthn/generate', { tempToken });
      
      let authResponse;
      try {
        authResponse = await startAuthentication({ optionsJSON: options });
      } catch (err: any) {
        if (err.name !== 'NotAllowedError') setError('Security key error: ' + err.message);
        setIsSubmitting(false);
        return;
      }

      const { data } = await axiosInstance.post('/api/v1/auth/login/webauthn/verify', { tempToken, response: authResponse });
      import('../../utils/tracking').then(({ trackEvent }) => trackEvent('login', { method: 'WebAuthn' }));
      await handleSuccess(data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#111111]">
      
      {/* Left Column: Editorial Banner */}
      <div className="hidden lg:flex w-1/2 relative bg-[#111111] text-white flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85" 
          alt="Style End Purse editorial"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        <div className="relative z-20">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Store
          </Link>
        </div>

        <div className="relative z-20 max-w-md space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-300 block mb-2">
              Style End Purse
            </span>
            <h1 className="font-serif-luxury text-4xl lg:text-5xl font-normal leading-tight text-white">
              Welcome Back
            </h1>
          </div>

          <p className="text-sm text-gray-200 leading-relaxed font-normal">
            Sign in to track your orders, view saved wishlist items, and manage your account.
          </p>

          <ul className="space-y-3 text-xs text-gray-200 pt-2">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Fast & Secure Checkout</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Order Tracking & Delivery Updates</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Saved Wishlist & Address Management</span>
            </li>
          </ul>
        </div>

        <div className="relative z-20 text-[11px] text-gray-400">
          &copy; {new Date().getFullYear()} Style End Purse. All rights reserved.
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div>
            <Link to="/" className="lg:hidden inline-flex items-center text-gray-500 hover:text-black mb-6 transition-colors text-xs font-semibold">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Store
            </Link>
            
            <div className="mb-4">
              <Logo />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#111111]">
              {requires2FA ? 'Two-Step Verification' : 'Sign In'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {requires2FA 
                ? 'Enter the code from your authenticator app' 
                : 'Enter your email and password to access your account'}
            </p>
          </div>

          {!requires2FA ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-lg border-gray-200 text-sm focus:border-black focus:ring-black"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                    Password
                  </Label>
                  <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-black underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10 rounded-lg border-gray-200 text-sm focus:border-black focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-medium space-y-2">
                  <p>{error}</p>
                  {isUnverified && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={isResending}
                      className="text-xs font-semibold text-black underline hover:text-gray-700 block transition-colors disabled:opacity-50"
                    >
                      {isResending ? 'Sending verification link...' : 'Click here to resend verification email'}
                    </button>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-[#111111] hover:bg-black text-white h-11 text-xs font-semibold uppercase tracking-wider rounded-full transition-all shadow-xs" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>

              {/* Register Link */}
              <p className="text-center text-xs text-gray-500 pt-3">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-black hover:underline">
                  Create an account
                </Link>
              </p>

            </form>
          ) : (
            <div className="space-y-6">
              
              {/* Windows Security Passkey Action (if available) */}
              {authMethods.webAuthn && (
                <div className="space-y-3">
                  <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200/80 text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-black text-[#C5A880] flex items-center justify-center mx-auto shadow-xs">
                      <Key className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-gray-900">Windows Security Passkey Detected</p>
                    <p className="text-[11px] text-gray-600">Authenticate using Windows Hello, fingerprint, or hardware security key.</p>
                    
                    <Button 
                      type="button" 
                      onClick={handleWebAuthnLogin}
                      disabled={isSubmitting}
                      className="w-full bg-[#111111] hover:bg-black text-white h-11 text-xs font-semibold uppercase tracking-wider rounded-full shadow-xs mt-2"
                    >
                      {isSubmitting ? 'Authenticating...' : 'Authenticate with Windows Passkey'}
                    </Button>
                  </div>
                </div>
              )}

              {authMethods.totp && authMethods.webAuthn && (
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-gray-200" />
                  <span className="bg-white px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider absolute">
                    Or Use Authenticator Code
                  </span>
                </div>
              )}

              {/* Google Authenticator TOTP Form */}
              {authMethods.totp && (
                <form onSubmit={handleVerifyTotp} className="space-y-4">
                  <div className="space-y-2 text-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto border border-blue-100">
                      <Shield className="w-5 h-5" />
                    </div>
                    <Label htmlFor="totp" className="text-xs font-bold uppercase tracking-wider text-gray-800">
                      Google Authenticator Code
                    </Label>
                    <p className="text-[11px] text-gray-500">Enter the 6-digit verification code from your authenticator app</p>
                    
                    <Input
                      id="totp"
                      type="text"
                      placeholder="••••••"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      maxLength={6}
                      required
                      autoFocus={!authMethods.webAuthn}
                      className="h-12 text-center tracking-[0.4em] text-xl font-mono rounded-xl border-gray-200 focus:border-black focus:ring-black bg-gray-50 focus:bg-white"
                    />
                  </div>
                  
                  {error && <p className="text-xs text-red-600 font-medium text-center">{error}</p>}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#111111] hover:bg-black text-white h-11 text-xs font-semibold uppercase tracking-wider rounded-full shadow-xs" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Verifying Code...' : 'Verify Google Authenticator'}
                  </Button>
                </form>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRequires2FA(false);
                    setTempToken('');
                    setError('');
                  }}
                  className="text-xs text-gray-500 hover:text-black underline"
                >
                  ← Back to standard sign in
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
