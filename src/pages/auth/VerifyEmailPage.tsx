import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router';
import axiosInstance from '../../api/axios';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Logo } from '../../app/components/Logo';
import { CheckCircle2, XCircle, ArrowLeft, Mail, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      if (!token) {
        if (isMounted) {
          setStatus('error');
          setMessage('No verification token was provided in the link. Please request a new verification email.');
        }
        return;
      }

      try {
        const { data } = await axiosInstance.get(`/api/v1/auth/verify-email?token=${token}`);
        if (isMounted) {
          setStatus('success');
          setMessage(data.message || 'Your email address has been verified successfully!');
          toast.success('Email verified successfully! You can now log in.');
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setMessage(err.response?.data?.error || 'Verification link is invalid or has expired.');
        }
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setIsResending(true);
    try {
      await axiosInstance.post('/api/v1/auth/resend-verification', { email: resendEmail });
      setResendSuccess(true);
      toast.success(`New verification link sent to ${resendEmail}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] py-12 px-4 font-sans text-[#111111]">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl border border-gray-100 shadow-sm text-center space-y-6">
        
        <div className="flex justify-center mb-2">
          <Logo />
        </div>

        {status === 'loading' && (
          <div className="py-8 space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-black border-t-transparent mx-auto"></div>
            <h2 className="text-xl font-bold text-gray-900">Verifying Email...</h2>
            <p className="text-xs text-gray-500">Please wait while we activate your account.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {message}
              </p>
            </div>

            <Button 
              onClick={() => navigate('/login')}
              className="w-full bg-[#111111] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider py-3.5 rounded-full shadow-xs"
            >
              Sign In to Your Account
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
              <p className="text-xs sm:text-sm text-red-600 leading-relaxed font-medium">
                {message}
              </p>
            </div>

            {!resendSuccess ? (
              <form onSubmit={handleResend} className="space-y-3 pt-2 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-700 text-center">
                  Request a New Verification Link
                </p>
                <div className="flex gap-2">
                  <Input 
                    type="email"
                    placeholder="Enter your email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    required
                    className="h-10 text-xs rounded-lg border-gray-200"
                  />
                  <Button 
                    type="submit"
                    disabled={isResending}
                    className="bg-[#111111] hover:bg-black text-white text-xs px-4 h-10 rounded-lg shrink-0"
                  >
                    {isResending ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Send'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-800 text-xs font-medium">
                New verification email sent! Please check your inbox and spam folder.
              </div>
            )}

            <div className="pt-2 border-t border-gray-100">
              <Link 
                to="/login"
                className="inline-flex items-center text-xs font-medium text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Return to Sign In
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
