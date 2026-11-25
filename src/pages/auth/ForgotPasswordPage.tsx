import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Mail, RefreshCw, CheckCircle2 } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { Logo } from '../../app/components/Logo';
import { toast } from 'sonner';
import { validateClientEmail } from '../../utils/emailValidator';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailCheck = validateClientEmail(email);
    if (!emailCheck.isValid) {
      setError(emailCheck.error || 'Please provide a valid email address.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await axiosInstance.post('/api/v1/auth/forgot-password', { email });
      setIsSuccess(true);
      toast.success('Password reset link sent to your email!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || isResending) return;
    setIsResending(true);
    try {
      await axiosInstance.post('/api/v1/auth/forgot-password', { email });
      toast.success('A fresh password reset link has been dispatched.');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send password reset email');
    } finally {
      setIsResending(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] py-12 px-4 font-sans text-[#111111]">
        <div className="w-full max-w-md text-center p-8 sm:p-10 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-6">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <Mail className="w-7 h-7" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              If an account is associated with:
            </p>
            <p className="text-sm font-semibold text-black bg-gray-50 py-2 px-3 rounded-lg border border-gray-200 inline-block break-all">
              {email}
            </p>
            <p className="text-xs text-gray-500 pt-1">
              We have sent a secure password reset link. The link is valid for <strong>15 minutes</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-left text-xs text-gray-600 space-y-1.5">
            <p className="font-semibold text-gray-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Helpful Tips:
            </p>
            <p>• If you do not see the email within a minute, check your Spam/Junk folder.</p>
            <p>• Make sure you typed the exact email address used during registration.</p>
          </div>

          <div className="space-y-3 pt-2">
            <Link to="/login" className="block">
              <Button className="w-full bg-[#111111] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider py-3.5 rounded-full shadow-xs">
                Return to Sign In
              </Button>
            </Link>

            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="inline-flex items-center justify-center text-xs font-medium text-gray-600 hover:text-black transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? 'Sending...' : 'Didn’t receive it? Resend reset link'}
            </button>
          </div>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111111]">Forgot Password</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Enter your email address and we'll send you a password reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
          </Button>

          <p className="text-center text-xs text-gray-500 pt-2">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-black hover:underline">
              Sign in
            </Link>
          </p>
        </form>

      </div>
    </div>
  );
}
