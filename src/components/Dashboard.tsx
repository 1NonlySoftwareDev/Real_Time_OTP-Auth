import { LogOut, User, Phone, Calendar, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  session: any;
}

export default function Dashboard({ session }: DashboardProps) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('91')) {
      const number = cleaned.slice(2);
      return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
    }
    return phone;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-lg border border-white/20 mt-8">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
                <p className="text-emerald-50">You're successfully logged in</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="grid gap-6">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">User ID</h2>
                    <p className="text-sm text-gray-600">Your unique identifier</p>
                  </div>
                </div>
                <p className="text-gray-700 font-mono text-sm bg-white/50 p-3 rounded-lg break-all">
                  {session.user.id}
                </p>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-6 border border-cyan-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Mobile Number</h2>
                    <p className="text-sm text-gray-600">Verified phone number</p>
                  </div>
                </div>
                <p className="text-gray-700 font-semibold text-lg bg-white/50 p-3 rounded-lg">
                  {formatPhoneNumber(session.user.phone || 'Not available')}
                </p>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Last Sign In</h2>
                    <p className="text-sm text-gray-600">Most recent login time</p>
                  </div>
                </div>
                <p className="text-gray-700 font-medium bg-white/50 p-3 rounded-lg">
                  {formatDate(session.user.last_sign_in_at)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6" />
                  <h3 className="font-bold text-lg">Security Status</h3>
                </div>
                <div className="space-y-2 text-emerald-50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Phone number verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>OTP authentication enabled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Secure session active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
