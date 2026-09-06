import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, KeyRound, LogIn } from 'lucide-react';
import { IrsyadulAmalLogo } from '../IrsyadulAmalLogo';
import { requestPasswordReset } from '../../lib/adminAuth';

interface AdminForgotPasswordViewProps {
  onReturnToLogin: () => void;
  onReturnToPublic: () => void;
}

export const AdminForgotPasswordView: React.FC<AdminForgotPasswordViewProps> = ({
  onReturnToLogin,
  onReturnToPublic,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setStatusMessage({
        type: 'error',
        text: 'Silakan masukkan format alamat email yang valid.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await requestPasswordReset(cleanEmail);
      setIsLoading(false);
      setStatusMessage({
        type: res.success ? 'success' : 'error',
        text: res.message,
      });
    } catch (err: any) {
      setIsLoading(false);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Terjadi gangguan saat memproses permintaan reset kata sandi.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071F20] via-[#004D4F] to-[#006769] flex flex-col justify-center items-center px-4 py-12 relative font-sans">
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onReturnToPublic}
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl backdrop-blur-md transition-all border border-white/10 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Website Publik
        </button>
        <button
          type="button"
          onClick={onReturnToLogin}
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl backdrop-blur-md transition-all border border-white/10 cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5" />
          Ke Halaman Login
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-b from-[#F0FAFA] to-white p-6 sm:p-8 text-center border-b border-[#E0EAEA]">
          <div className="inline-flex justify-center mb-3">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-[#CCFBF1]">
              <IrsyadulAmalLogo size={48} />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#008284] tracking-tight">
            Lupa Kata Sandi
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#071F20] mt-1">
            Pemulihan Akun Administrator
          </p>
          <p className="text-xs text-[#647B7C] mt-1.5 leading-relaxed">
            Masukkan email terdaftar Anda. Supabase Auth akan mengirimkan tautan reset kata sandi resmi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#071F20] block">
              Email Administrator
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#008284] focus:ring-2 focus:ring-[#008284]/20 text-xs sm:text-sm transition-all outline-none"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-[#008284] hover:bg-[#006769] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            {isLoading ? 'Mengirimkan Tautan...' : 'KIRIM TAUTAN PEMULIHAN'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onReturnToLogin}
              className="text-xs font-semibold text-[#008284] hover:underline inline-flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Ingat kata sandi? Kembali ke Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
