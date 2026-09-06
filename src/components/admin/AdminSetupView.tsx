import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  UserPlus,
  Lock,
  Mail,
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Database,
  LogIn,
  RefreshCw,
} from 'lucide-react';
import { IrsyadulAmalLogo } from '../IrsyadulAmalLogo';
import {
  checkIsInitialSetupAvailable,
  signUpInitialAdmin,
  testSupabaseConnection,
} from '../../lib/adminAuth';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminSetupViewProps {
  onReturnToLogin: () => void;
  onReturnToPublic: () => void;
}

export const AdminSetupView: React.FC<AdminSetupViewProps> = ({
  onReturnToLogin,
  onReturnToPublic,
}) => {
  const [checkingAvailability, setCheckingAvailability] = useState(true);
  const [isSetupAllowed, setIsSetupAllowed] = useState(false);
  const [closeReason, setCloseReason] = useState<string>('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Memeriksa...');

  const evaluateSetupEligibility = async () => {
    setCheckingAvailability(true);
    setErrorMessage(null);

    const conn = await testSupabaseConnection();
    setConnectionStatus(conn.statusText);

    if (!conn.isConnected) {
      setIsSetupAllowed(false);
      setCloseReason(
        'Koneksi Supabase belum terhubung. Konfigurasikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di lingkungan hosting untuk melanjutkan.'
      );
      setCheckingAvailability(false);
      return;
    }

    const check = await checkIsInitialSetupAvailable();
    if (!check.available && check.count > 0) {
      setIsSetupAllowed(false);
      setCloseReason(
        'Setup Administrator Telah Ditutup: Sistem telah memiliki administrator yang terdaftar. Pembuatan akun baru hanya dapat dilakukan dari dalam dashboard admin.'
      );
    } else {
      setIsSetupAllowed(true);
    }
    setCheckingAvailability(false);
  };

  useEffect(() => {
    evaluateSetupEligibility();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setErrorMessage('Silakan masukkan nama lengkap administrator.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Silakan masukkan alamat email yang valid.');
      return;
    }

    if (!password) {
      setErrorMessage('Silakan tentukan kata sandi administrator.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter sesuai standar keamanan Supabase.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok dengan kata sandi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signUpInitialAdmin({
        name: cleanName,
        email: cleanEmail,
        password: password,
      });

      if (!result.success) {
        setIsSubmitting(false);
        setErrorMessage(result.error || 'Gagal mendaftarkan administrator pertama.');
        return;
      }

      setIsSubmitting(false);
      setSuccessMessage(
        'Akun administrator pertama berhasil didaftarkan di Supabase Auth & admin_users! Mengalihkan ke halaman login...'
      );

      // Auto redirect to login after 2 seconds
      setTimeout(() => {
        onReturnToLogin();
      }, 2000);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem saat mendaftarkan akun.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071F20] via-[#004D4F] to-[#006769] flex flex-col justify-center items-center px-4 py-12 relative font-sans">
      {/* Navigation buttons */}
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

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-b from-[#F0FAFA] to-white p-6 sm:p-8 text-center border-b border-[#E0EAEA]">
          <div className="inline-flex justify-center mb-3">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-[#CCFBF1]">
              <IrsyadulAmalLogo size={48} />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#008284] tracking-tight">
            Setup Administrator Pertama
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#071F20] mt-1">
            Inisialisasi Pengelola Irsyadul Amal
          </p>
          <p className="text-xs text-[#647B7C] mt-1.5 leading-relaxed">
            Halaman ini khusus digunakan satu kali saat sistem belum memiliki administrator yang terdaftar.
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-200">
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span>Status: {connectionStatus}</span>
          </div>
        </div>

        {/* Loading state */}
        {checkingAvailability ? (
          <div className="p-10 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#008284] animate-spin mx-auto" />
            <p className="text-xs text-gray-600 font-medium">
              Memeriksa ketersediaan setup administrator...
            </p>
          </div>
        ) : !isSetupAllowed ? (
          /* Setup is CLOSED */
          <div className="p-6 sm:p-8 space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-[#071F20]">
                Akses Setup Tidak Tersedia
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                {closeReason}
              </p>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={onReturnToLogin}
                className="w-full py-3 px-4 bg-[#008284] hover:bg-[#006769] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Masuk ke Halaman Login Admin
              </button>
            </div>
          </div>
        ) : (
          /* Setup FORM (Allowed) */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#071F20] block">
                Nama Lengkap Administrator *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Ust. Muhammad Irsyad"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#008284] focus:ring-2 focus:ring-[#008284]/20 text-xs sm:text-sm transition-all outline-none"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#071F20] block">
                Email Admin Resmi *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin.resmi@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#008284] focus:ring-2 focus:ring-[#008284]/20 text-xs sm:text-sm transition-all outline-none"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
              <p className="text-[11px] text-[#647B7C]">
                Email ini akan didaftarkan ke Supabase Authentication.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#071F20] block">
                  Kata Sandi *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 karakter"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#008284] focus:ring-2 focus:ring-[#008284]/20 text-xs sm:text-sm transition-all outline-none"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#071F20] block">
                  Konfirmasi Sandi *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#008284] focus:ring-2 focus:ring-[#008284]/20 text-xs sm:text-sm transition-all outline-none"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <span className="font-bold">Keamanan Terjamin:</span> Password Anda dienkripsi secara aman oleh Supabase Auth dan tidak disimpan sebagai teks biasa (plaintext) pada tabel database.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-[#008284] hover:bg-[#006769] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <UserPlus className="w-4 h-4" />
              {isSubmitting ? 'Mendaftarkan Akun Supabase...' : 'BUAT AKUN ADMINISTRATOR PERTAMA'}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onReturnToLogin}
                className="text-xs font-semibold text-[#008284] hover:underline"
              >
                Sudah memiliki akun? Masuk di sini
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
