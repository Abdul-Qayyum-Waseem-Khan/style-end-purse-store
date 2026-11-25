import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, AlertTriangle } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { Logo } from '../../app/components/Logo';
import { toast } from 'sonner';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing password reset token. Please request a new link.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await axiosInstance.post(`/api/v1/auth/reset-password`, { token, password });
      setIsSuccess(true);
      toast.success('Password updated successfully! You can now log in.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] py-12 px-4 font-sans text-[#111111]">
        <div className="w-full max-w-md text-center p-8 sm:p-10 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-6">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Missing Reset Token</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              No valid password reset token was found in your link. Please request a new password reset link.
            </p>
          </div>
          <Link to="/forgot-password" className="block">
            <Button className="w-full bg-[#111111] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider py-3.5 rounded-full shadow-xs">
              Request New Reset Link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] py-12 px-4 font-sans text-[#111111]">
        <div className="w-full max-w-md text-center p-8 sm:p-10 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-6">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Password Reset Complete</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Your password has been successfully updated. You can now sign in with your new credentials.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/login')} 
            className="w-full bg-[#111111] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider py-3.5 rounded-full shadow-xs"
          >
            Sign In Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] py-12 px-4 font-sans text-[#111111]">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        
        <div>
          <Link to="/login" className="inline-flex items-center text-gray-500 hover:text-black mb-6 transition-colors text-xs font-semibold">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Sign In
          </Link>
          <div className="mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111111]">Set New Password</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Choose a strong password to protect your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              New Password
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

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter new password"
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

          <Button 
            type="submit" 
            className="w-full bg-[#111111] hover:bg-black text-white h-11 text-xs font-semibold uppercase tracking-wider rounded-full transition-all shadow-xs" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating Password...' : 'Save New Password'}
          </Button>

          <p className="text-center text-xs text-gray-500 pt-2">
            <Link to="/login" className="text-gray-600 hover:text-black underline">
              Cancel and return to sign in
            </Link>
          </p>
        </form>

      </div>
    </div>
  );
}
