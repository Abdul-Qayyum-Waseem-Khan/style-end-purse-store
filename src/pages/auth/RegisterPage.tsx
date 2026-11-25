import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { Logo } from '../../app/components/Logo';
import axiosInstance from '../../api/axios';
import { toast } from 'sonner';
import { validateClientEmail } from '../../utils/emailValidator';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailCheck = validateClientEmail(email);
    if (!emailCheck.isValid) {
      setError(emailCheck.error || 'Please enter a valid personal or business email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await register({ name, email, password });
      import('../../utils/tracking').then(({ trackEvent }) => trackEvent('sign_up', { method: 'Email' }));
      setRegisteredEmail(email);
      setIsSuccess(true);
      toast.success('Account created! Please check your email for the verification link.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      await axiosInstance.post('/api/v1/auth/resend-verification', { email: registeredEmail || email });
      toast.success('Verification email resent! Please check your inbox and spam folder.');
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white py-12 px-4 font-sans text-[#111111]">
        <div className="w-full max-w-md text-center p-8 sm:p-10 rounded-2xl border border-gray-100 bg-[#FAFAFA] shadow-sm space-y-6">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <Mail className="w-7 h-7" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We have dispatched an activation link to:
            </p>
            <p className="text-sm font-semibold text-black bg-white py-2 px-3 rounded-lg border border-gray-200 inline-block break-all">
              {registeredEmail || email}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-left text-xs text-gray-600 space-y-2">
            <p className="font-semibold text-gray-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              What to do next:
            </p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Open your email inbox.</li>
              <li>Click the <strong>Verify Email Address</strong> button.</li>
              <li>Check your <strong>Spam / Junk</strong> folder if you do not see it in 1-2 minutes.</li>
            </ol>
          </div>

          <div className="space-y-3 pt-2">
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full bg-[#111111] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider py-3.5 rounded-full shadow-xs"
            >
              Go to Sign In
            </Button>

            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResending || resendCooldown > 0}
              className="inline-flex items-center justify-center text-xs font-medium text-gray-600 hover:text-black transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isResending ? 'animate-spin' : ''}`} />
              {resendCooldown > 0 
                ? `Resend email in ${resendCooldown}s` 
                : 'Didn’t receive an email? Resend verification link'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#111111]">
      
      {/* Left Column: Editorial Banner */}
      <div className="hidden lg:flex w-1/2 relative bg-[#111111] text-white flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85" 
          alt="Style End Purse collection"
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
              Create Your Account
            </h1>
          </div>

          <p className="text-sm text-gray-200 leading-relaxed font-normal">
            Join Style End Purse to save your shipping details, track deliveries in real time, and access special offers.
          </p>

          <ul className="space-y-3 text-xs text-gray-200 pt-2">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>100% Genuine Leather Bags & Shoes</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Cash on Delivery & Doorstep Inspection</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Free Delivery on Orders Over PKR 5,000</span>
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
              Create an Account
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Enter your details below to register your profile
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Ayesha Khan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 rounded-lg border-gray-200 text-sm focus:border-black focus:ring-black"
              />
            </div>

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
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 pr-10 rounded-lg border-gray-200 text-sm focus:border-black focus:ring-black"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-[#111111] hover:bg-black text-white h-11 text-xs font-semibold uppercase tracking-wider rounded-full transition-all shadow-xs" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account & Sending Email...' : 'Create Account'}
            </Button>

            {/* Login Link */}
            <p className="text-center text-xs text-gray-500 pt-3">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-black hover:underline">
                Sign in
              </Link>
            </p>

          </form>

        </div>
      </div>

    </div>
  );
}
