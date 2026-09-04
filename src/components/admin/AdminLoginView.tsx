import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { IrsyadulAmalLogo } from '../IrsyadulAmalLogo';
import { useCMS } from '../../data/cmsContext';

interface AdminLoginViewProps {
  onReturnToPublic: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onReturnToPublic }) => {
  const { loginAdmin } = useCMS();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = loginAdmin(usernameOrEmail, password);
    if (!res.success) {
      setErrorMessage(res.message || 'Login gagal. Periksa username dan password.');
    }
  };

  const handleDemoLogin = () => {
    setUsernameOrEmail('admin');
    setPassword('admin');
    loginAdmin('admin', 'admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071F20] via-[#004D4F] to-[#006769] flex flex-col justify-center items-center px-4 py-12 relative">
      {/* Back button */}
      <button
        type="button"
        onClick={onReturnToPublic}
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl backdrop-blur-md transition-all border border-white/10"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Website Publik
      </button>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-200">
        {/* Card Header */}
        <div className="bg-gradient-to-b from-[#F0FAFA] to-white p-6 sm:p-8 text-center border-b border-[#E0EAEA]">
          <div className="inline-flex justify-center mb-4">
            <div className="p-3 bg-white rounded-2xl shadow-md border border-[#CCFBF1]">
              <IrsyadulAmalLogo size={52} />
            </div>
          </div>
          <h1 className="text-2xl font-black text-[#008284] tracking-tight">
            Dashboard Admin
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-[#071F20] mt-1">
            Kelola Website Irsyadul Amal
          </p>
          <p className="text-xs text-[#647B7C] mt-2 leading-relaxed">
            Kelola konten website, program, donasi, laporan, dan informasi lembaga dalam satu tempat.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#071F20] block">
              Username atau Email
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="admin atau email pengelola"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#008284] focus:ring-2 focus:ring-[#008284]/20 text-xs sm:text-sm transition-all outline-none"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#071F20] block">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi admin"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#008284] focus:ring-2 focus:ring-[#008284]/20 text-xs sm:text-sm transition-all outline-none"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-[#008284] hover:bg-[#006769] text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            MASUK
          </button>

          {/* Prototype Easy Access */}
          <div className="pt-3 border-t border-gray-100 text-center">
            <p className="text-[11px] text-[#647B7C] mb-2">Akses Demo Pengelola:</p>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Masuk Cepat Sebagai Pengelola (Demo)
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-[11px] text-gray-500">
          Hak Cipta © 2026 Irsyadul Amal. Sistem CMS Terintegrasi.
        </div>
      </div>
    </div>
  );
};
