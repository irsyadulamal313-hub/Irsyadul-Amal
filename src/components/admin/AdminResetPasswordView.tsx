import React, { useState } from 'react';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, LogIn, KeyRound } from 'lucide-react';
import { IrsyadulAmalLogo } from '../IrsyadulAmalLogo';
import { updateAdminPassword } from '../../lib/adminAuth';

interface AdminResetPasswordViewProps {
  onReturnToLogin: () => void;
  onReturnToPublic: () => void;
}

export const AdminResetPasswordView: React.FC<AdminResetPasswordViewProps> = ({
  onReturnToLogin,
  onReturnToPublic,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!newPassword || newPassword.length < 6) {
      setStatusMessage({
        type: 'error',
        text: 'Kata sandi baru minimal 6 karakter sesuai standar keamanan Supabase.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({
        type: 'error',
        text: 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await updateAdminPassword(newPassword);
      setIsLoading(false);
      setStatusMessage({
        type: res.success ? 'success' : 'error',
        text: res.message,
      });

      if (res.success) {
        setTimeout(() => {
          onReturnToLogin();
        }, 2000);
      }
    } catch (err: any) {
      setIsLoading(false);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Gagal memperbarui kata sandi.',
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
            Perbarui Kata Sandi
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#071F20] mt-1">
            Penetapan Sandi Baru Administrator
          </p>
          <p className="text-xs text-[#647B7C] mt-1.5 leading-relaxed">
            Silakan masukkan kata sandi baru untuk mengamankan akses akun Supabase Auth Anda.
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
              Kata Sandi Baru *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 karakter"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#008284] focus:ring-2 focus:ring-[#008284]/20 text-xs sm:text-sm transition-all outline-none"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#071F20] block">
              Konfirmasi Kata Sandi Baru *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#008284] focus:ring-2 focus:ring-[#008284]/20 text-xs sm:text-sm transition-all outline-none"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-[#008284] hover:bg-[#006769] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <KeyRound className="w-4 h-4" />
            {isLoading ? 'Menyimpan Kata Sandi...' : 'SIMPAN KATA SANDI BARU'}
          </button>
        </form>
      </div>
    </div>
  );
};
