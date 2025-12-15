import { useState, useRef, useEffect } from 'react';
import { Phone, Shield, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Step = 'phone' | 'otp' | 'success';

export default function OTPSignIn() {
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 5) return cleaned;
    if (cleaned.length <= 10) return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhoneNumber(value);
      setError('');
    }
  };

  const handleSendOTP = async () => {
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullPhone = `+91${phoneNumber}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (error) throw error;

      setStep('otp');
      setCountdown(60);
      otpInputs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit) && newOtp.join('').length === 6) {
      verifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);

    if (pastedData.length === 6) {
      verifyOTP(pastedData);
    }
  };

  const verifyOTP = async (otpCode: string) => {
    setLoading(true);
    setError('');

    try {
      const fullPhone = `+91${phoneNumber}`;
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otpCode,
        type: 'sms',
      });

      if (error) throw error;

      setStep('success');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError('Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpInputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setLoading(true);
    setError('');
    setOtp(['', '', '', '', '', '']);

    try {
      const fullPhone = `+91${phoneNumber}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (error) throw error;

      setCountdown(60);
      otpInputs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-lg border border-white/20">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                Secure Login
                <Sparkles className="w-5 h-5" />
              </h1>
              <p className="text-emerald-50 text-sm">India's most trusted OTP authentication</p>
            </div>
          </div>

          <div className="p-8">
            {step === 'phone' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                      <Phone className="w-5 h-5 text-emerald-500" />
                      <span className="text-gray-700 font-semibold text-lg">+91</span>
                      <div className="w-px h-6 bg-gray-300 ml-1"></div>
                    </div>
                    <input
                      type="tel"
                      value={formatPhoneNumber(phoneNumber)}
                      onChange={handlePhoneChange}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                      placeholder="98765 43210"
                      className="w-full pl-24 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all duration-300 placeholder:text-gray-400"
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-shake">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSendOTP}
                  disabled={loading || phoneNumber.length !== 10}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="text-center text-sm text-gray-500 space-y-2">
                  <p className="flex items-center justify-center gap-1">
                    <Shield className="w-4 h-4" />
                    Your number is safe with us
                  </p>
                </div>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-2">
                    <Phone className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Enter OTP</h2>
                  <p className="text-gray-600 text-sm">
                    Code sent to +91 {formatPhoneNumber(phoneNumber)}
                    <button
                      onClick={() => setStep('phone')}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold ml-2 hover:underline"
                    >
                      Change
                    </button>
                  </p>
                </div>

                <div className="flex gap-3 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all duration-300 focus:scale-110"
                    />
                  ))}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center animate-shake">
                    {error}
                  </div>
                )}

                {loading && (
                  <div className="text-center">
                    <div className="inline-block w-6 h-6 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                  </div>
                )}

                <div className="text-center">
                  <button
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || loading}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="space-y-6 text-center animate-fadeIn py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full animate-bounce-slow">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Verified Successfully!</h2>
                  <p className="text-gray-600">Redirecting you to dashboard...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
}
