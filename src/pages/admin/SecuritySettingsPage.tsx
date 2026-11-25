import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { toast } from 'sonner';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Trash2, 
  CheckCircle2, 
  Copy, 
  AlertTriangle, 
  Fingerprint, 
  Monitor, 
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';

export function SecuritySettingsPage() {
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    hasTotp: false,
    webAuthnKeys: [] as { id: string; label?: string }[],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [isSetupTotp, setIsSetupTotp] = useState(false);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get('/api/v1/security/settings');
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch security settings', error);
      toast.error('Failed to load security settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTotp = async () => {
    try {
      const { data } = await axiosInstance.post('/api/v1/security/2fa/generate');
      setQrCode(data.qrCodeUrl);
      setSecretKey(data.secret);
      setIsSetupTotp(true);
    } catch (error) {
      toast.error('Failed to generate Google Authenticator QR code');
    }
  };

  const handleVerifyTotp = async () => {
    if (!totpCode || totpCode.trim().length !== 6) {
      toast.error('Please enter a 6-digit code from Google Authenticator');
      return;
    }
    try {
      await axiosInstance.post('/api/v1/security/2fa/verify', { code: totpCode.trim() });
      toast.success('Google Authenticator 2FA enabled successfully!');
      setIsSetupTotp(false);
      setQrCode(null);
      setSecretKey(null);
      setTotpCode('');
      fetchSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid code. Please check your authenticator app.');
    }
  };

  const handleDisableTotp = async () => {
    if (!confirm('Are you sure you want to disable Google Authenticator?')) return;
    try {
      await axiosInstance.post('/api/v1/security/2fa/disable');
      toast.success('Google Authenticator 2FA disabled');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to disable 2FA');
    }
  };

  const handleRegisterPasskey = async () => {
    try {
      setIsRegisteringPasskey(true);
      // 1. Fetch registration options from server
      const { data: options } = await axiosInstance.get('/api/v1/security/webauthn/generate-registration-options');
      
      // 2. Prompt Windows Security / Browser Passkey dialog
      let authResponse;
      try {
        authResponse = await startRegistration({ optionsJSON: options });
      } catch (err: any) {
        if (err.name === 'NotAllowedError') {
          toast.error('Windows Security prompt cancelled or timed out');
        } else {
          toast.error('Windows Security error: ' + err.message);
        }
        return;
      }

      // 3. Verify registration response on backend
      await axiosInstance.post('/api/v1/security/webauthn/verify-registration', authResponse);
      toast.success('Windows Security Passkey registered successfully!');
      fetchSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to register Windows Passkey');
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  const handleRemoveKey = async (id: string) => {
    if (!confirm('Are you sure you want to remove this Windows Security Passkey?')) return;
    try {
      await axiosInstance.delete(`/api/v1/security/webauthn/remove/${id}`);
      toast.success('Passkey removed');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to remove Passkey');
    }
  };

  const copySecret = () => {
    if (secretKey) {
      navigator.clipboard.writeText(secretKey);
      toast.success('Secret key copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-[#FBFBFA] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Loading Security Console...</p>
        </div>
      </div>
    );
  }

  const isProtected = settings.hasTotp || settings.webAuthnKeys.length > 0;

  return (
    <div className="p-6 lg:p-10 bg-[#FBFBFA] min-h-screen space-y-8 font-sans text-[#111111]">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-black text-[#C5A880] flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-serif-luxury">Admin Security & 2FA Console</h1>
              <p className="text-xs text-gray-500 mt-0.5">Secure your admin panel with Google Authenticator & Windows Security Passkey</p>
            </div>
          </div>
        </div>

        {/* Protection Status Badge */}
        <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border text-xs font-bold uppercase tracking-wider self-start sm:self-auto shadow-xs ${
          isProtected 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          {isProtected ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Admin Protected (2FA Active)</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>2FA Not Configured</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. Google Authenticator (TOTP) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shadow-xs">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 font-serif-luxury">Google Authenticator</h3>
                  <p className="text-xs text-gray-500">6-digit time-based one-time password (TOTP)</p>
                </div>
              </div>

              {settings.hasTotp && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  Enabled
                </span>
              )}
            </div>

            {!settings.hasTotp && !isSetupTotp && (
              <div className="space-y-4 pt-2">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Protect your admin account with Google Authenticator, Microsoft Authenticator, or 1Password. Every time you log in, you will be prompted for a 6-digit code.
                </p>
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 text-xs text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-800">Compatible apps:</p>
                  <p>• Google Authenticator (Android / iOS)</p>
                  <p>• Microsoft Authenticator</p>
                  <p>• Authy / 1Password / Bitwarden</p>
                </div>
                <Button 
                  onClick={handleGenerateTotp}
                  className="w-full bg-[#111111] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider py-3 rounded-full shadow-xs"
                >
                  Configure Google Authenticator
                </Button>
              </div>
            )}

            {/* Setup Mode: QR Code and Verify */}
            {isSetupTotp && qrCode && (
              <div className="space-y-5 pt-2 flex flex-col items-center text-center animate-in fade-in duration-200">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-900">Step 1: Scan QR Code in App</p>
                  <p className="text-[11px] text-gray-500">Open Google Authenticator, tap "+" and scan this QR code.</p>
                </div>

                <div className="p-3 bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
                  <img src={qrCode} alt="TOTP QR Code" className="w-44 h-44 object-contain" />
                </div>

                {secretKey && (
                  <div className="w-full space-y-1.5 text-left">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Or Enter Secret Key Manually:</p>
                    <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                      <span className="font-mono text-xs text-gray-800 tracking-wider truncate flex-1">{secretKey}</span>
                      <button 
                        type="button" 
                        onClick={copySecret}
                        className="p-1.5 text-gray-600 hover:text-black bg-white rounded-lg border border-gray-200 shadow-xs"
                        title="Copy Secret"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="w-full space-y-3 pt-2">
                  <div className="space-y-1 text-left">
                    <p className="text-xs font-bold text-gray-900">Step 2: Enter 6-Digit Code</p>
                    <Input 
                      type="text" 
                      placeholder="123456" 
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      maxLength={6}
                      className="h-11 text-center tracking-[0.3em] text-lg font-mono rounded-xl border-gray-200 focus:border-black focus:ring-black"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-full text-xs font-semibold"
                      onClick={() => setIsSetupTotp(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1 bg-[#111111] hover:bg-black text-white rounded-full text-xs font-semibold uppercase tracking-wider"
                      onClick={handleVerifyTotp}
                    >
                      Verify & Activate
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Active TOTP State */}
            {settings.hasTotp && (
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Google Authenticator Active</span>
                  </div>
                  <p className="text-emerald-700 leading-relaxed">
                    Your account is securely protected. When logging in, you will be prompted for your 6-digit Google Authenticator code.
                  </p>
                </div>

                <Button 
                  variant="outline" 
                  onClick={handleDisableTotp}
                  className="w-full text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-full"
                >
                  Disable Google Authenticator
                </Button>
              </div>
            )}

          </div>
        </div>

        {/* 2. Windows Security Passkey & WebAuthn */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 shadow-xs">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 font-serif-luxury">Windows Security Passkey</h3>
                  <p className="text-xs text-gray-500">Windows Hello, PIN, Fingerprint & FIDO2</p>
                </div>
              </div>

              {settings.webAuthnKeys.length > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider">
                  {settings.webAuthnKeys.length} {settings.webAuthnKeys.length === 1 ? 'Key' : 'Keys'}
                </span>
              )}
            </div>

            <div className="space-y-4 pt-2">
              <p className="text-xs text-gray-600 leading-relaxed">
                Log in instantly using <strong>Windows Security</strong> (Windows Hello facial recognition, fingerprint, PIN, or USB security keys like YubiKey). No password typing required.
              </p>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2 font-semibold text-gray-800">
                  <Fingerprint className="w-4 h-4 text-purple-700" />
                  <span>Supported Passkey Methods:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Windows Hello PIN
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Fingerprint Reader
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Facial Recognition
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> YubiKey / Hardware Key
                  </div>
                </div>
              </div>

              {/* List of Registered Passkeys */}
              {settings.webAuthnKeys.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-700">Registered Windows Passkeys:</p>
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white">
                    {settings.webAuthnKeys.map((key, idx) => (
                      <div key={key.id} className="p-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Key className="w-4 h-4 text-purple-700 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {key.label || `Windows Security Passkey #${idx + 1}`}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono truncate">
                              ID: {key.id.substring(0, 16)}...
                            </p>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleRemoveKey(key.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          title="Remove Passkey"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleRegisterPasskey}
                disabled={isRegisteringPasskey}
                className="w-full bg-[#111111] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider py-3 rounded-full shadow-xs flex items-center justify-center gap-2"
              >
                <Monitor className="w-4 h-4 text-[#C5A880]" />
                <span>{isRegisteringPasskey ? 'Registering Passkey...' : 'Add Windows Security Passkey'}</span>
              </Button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
