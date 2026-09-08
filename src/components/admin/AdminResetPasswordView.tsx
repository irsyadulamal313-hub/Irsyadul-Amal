import React, { useState, useEffect } from 'react';
import {
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  LogIn,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { IrsyadulAmalLogo } from '../IrsyadulAmalLogo';
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase';
import { formatSupabaseAuthError } from '../../lib/adminAuth';

interface AdminResetPasswordViewProps {
  onReturnToLogin: () => void;
  onReturnToPublic: () => void;
  onGoToForgotPassword?: () => void;
}

export const AdminResetPasswordView: React.FC<AdminResetPasswordViewProps> = ({
  onReturnToLogin,
  onReturnToPublic,
  onGoToForgotPassword,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Recovery session state
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isRecoverySessionActive, setIsRecoverySessionActive] = useState(false);
  const [userEmailHint, setUserEmailHint] = useState<string | null>(null);
  const [urlErrorMessage, setUrlErrorMessage] = useState<string | null>(null);

  // Form submit state
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);

  useEffect(() => {
    // 1. Periksa apakah konfigurasi Supabase tersedia
    if (!isSupabaseConfigured()) {
      setIsCheckingSession(false);
      setUrlErrorMessage('Konfigurasi Supabase belum tersedia di aplikasi.');
      return;
    }

    const client = getSupabase();
    if (!client) {
      setIsCheckingSession(false);
      setUrlErrorMessage('Klien Supabase belum dapat diinisialisasi.');
      return;
    }

    // 2. Periksa error pada URL fragment / query string (misal jika token expired atau invalid)
    const rawHash = window.location.hash || '';
    const rawSearch = window.location.search || '';

    // Deteksi parameter error dari Supabase (misal: #error=access_denied&error_code=otp_expired)
    if (rawHash.includes('error=')) {
      const hashParams = new URLSearchParams(rawHash.replace(/^#/, ''));
      const errorDesc =
        hashParams.get('error_description') ||
        hashParams.get('error') ||
        'Tautan pemulihan kata sandi tidak valid atau telah kedaluwarsa.';
      setUrlErrorMessage(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
      setIsCheckingSession(false);
    } else if (rawSearch.includes('error=')) {
      const searchParams = new URLSearchParams(rawSearch);
      const errorDesc =
        searchParams.get('error_description') ||
        searchParams.get('error') ||
        'Tautan pemulihan kata sandi tidak valid atau telah kedaluwarsa.';
      setUrlErrorMessage(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
      setIsCheckingSession(false);
    }

    // 3. Sanitasi token dari address bar tanpa reload browser
    // KETENTUAN 5 & 19: Jangan menampilkan access token atau refresh token kepada user
    const sanitizeTokensFromAddressBar = () => {
      if (
        window.location.hash &&
        (window.location.hash.includes('access_token=') ||
          window.location.hash.includes('refresh_token='))
      ) {
        // Hapus hash token dari URL address bar secara mulus
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search
        );
      }
    };

    // 4. Deteksi event PASSWORD_RECOVERY dari Supabase Auth
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoverySessionActive(true);
        setIsCheckingSession(false);
        setUrlErrorMessage(null);
        if (session?.user?.email) {
          setUserEmailHint(session.user.email);
        }
        sanitizeTokensFromAddressBar();
      } else if (event === 'SIGNED_IN') {
        // Jika sign in berasal dari link recovery
        if (
          rawHash.includes('type=recovery') ||
          window.location.hash.includes('type=recovery') ||
          window.location.pathname.includes('reset-password')
        ) {
          setIsRecoverySessionActive(true);
          setIsCheckingSession(false);
          setUrlErrorMessage(null);
          if (session?.user?.email) {
            setUserEmailHint(session.user.email);
          }
          sanitizeTokensFromAddressBar();
        }
      }
    });

    // 5. Cek session recovery aktif yang sudah diterima Supabase
    client.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          setUrlErrorMessage(formatSupabaseAuthError(error));
          setIsCheckingSession(false);
          return;
        }

        if (data?.session) {
          setIsRecoverySessionActive(true);
          setIsCheckingSession(false);
          if (data.session.user?.email) {
            setUserEmailHint(data.session.user.email);
          }
          sanitizeTokensFromAddressBar();
        } else {
          // Berikan toleransi waktu singkat untuk Supabase memproses token recovery dari URL
          const timer = setTimeout(() => {
            setIsCheckingSession(false);
          }, 1200);
          return () => clearTimeout(timer);
        }
      })
      .catch((err) => {
        setIsCheckingSession(false);
        setUrlErrorMessage(err?.message || 'Gagal memeriksa sesi Supabase.');
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const cleanPassword = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    // Validasi password tidak kosong
    if (!cleanPassword) {
      setStatusMessage({
        type: 'error',
        text: 'Password baru tidak boleh kosong.',
      });
      return;
    }

    // Validasi panjang password minimal 6 karakter sesuai standar keamanan
    if (cleanPassword.length < 6) {
      setStatusMessage({
        type: 'error',
        text: 'Password baru minimal 6 karakter sesuai standar keamanan Supabase.',
      });
      return;
    }

    // Validasi password baru dan konfirmasi harus sama
    if (cleanPassword !== cleanConfirm) {
      setStatusMessage({
        type: 'error',
        text: 'Password baru dan Konfirmasi Password harus sama persis.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const client = getSupabase();
      if (!client) {
        throw new Error('Klien Supabase belum aktif.');
      }

      // KETENTUAN 5: gunakan supabase.auth.updateUser({ password: newPassword })
      const { error } = await client.auth.updateUser({
        password: cleanPassword,
      });

      if (error) {
        setIsLoading(false);
        setStatusMessage({
          type: 'error',
          text: formatSupabaseAuthError(error),
        });
        return;
      }

      // Keluar dari sesi recovery agar pengguna login secara bersih dengan password baru
      try {
        await client.auth.signOut();
      } catch {}

      // Tampilkan pesan berhasil
      setIsLoading(false);
      setStatusMessage({
        type: 'success',
        text: 'Password baru berhasil disimpan! Mengalihkan ke halaman login admin...',
      });

      // Setelah berhasil, arahkan user ke /admin/login
      setTimeout(() => {
        onReturnToLogin();
      }, 2000);
    } catch (err: any) {
      setIsLoading(false);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Terjadi kesalahan saat menyimpan password baru.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071F20] via-[#004D4F] to-[#006769] flex flex-col justify-center items-center px-4 py-12 relative font-sans">
      {/* Top Header Navigation */}
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

      {/* Main Card Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-200">
        {/* Card Header */}
        <div className="bg-gradient-to-b from-[#F0FAFA] to-white p-6 sm:p-8 text-center border-b border-[#E0EAEA]">
          <div className="inline-flex justify-center mb-3">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-[#CCFBF1]">
              <IrsyadulAmalLogo size={48} />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#008284] tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#071F20] mt-1">
            Penetapan Password Baru Administrator
          </p>
          {userEmailHint ? (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-[11px] font-medium text-teal-800">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Akun: {userEmailHint}</span>
            </div>
          ) : (
            <p className="text-xs text-[#647B7C] mt-1.5 leading-relaxed">
              Silakan buat password baru yang kuat untuk mengamankan akses akun Supabase Auth Anda.
            </p>
          )}
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8">
          {/* 1. STATE: Sedang Memeriksa Sesi Recovery */}
          {isCheckingSession && (
            <div className="py-10 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#008284] animate-spin mx-auto" />
              <p className="text-xs sm:text-sm font-semibold text-[#071F20]">
                Memverifikasi tautan pemulihan Supabase...
              </p>
              <p className="text-xs text-gray-500">
                Mohon tunggu beberapa saat.
              </p>
            </div>
          )}

          {/* 2. STATE: Error Tautan Tidak Valid / Kedaluwarsa */}
          {!isCheckingSession && urlErrorMessage && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Tautan Pemulihan Tidak Valid / Kedaluwarsa</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  {urlErrorMessage}
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {onGoToForgotPassword && (
                  <button
                    type="button"
                    onClick={onGoToForgotPassword}
                    className="w-full py-2.5 px-4 bg-[#008284] hover:bg-[#006769] text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Minta Tautan Reset Password Baru
                  </button>
                )}
                <button
                  type="button"
                  onClick={onReturnToLogin}
                  className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  Kembali ke Halaman Login
                </button>
              </div>
            </div>
          )}

          {/* 3. STATE: Tidak Ada Sesi Pemulihan Aktif */}
          {!isCheckingSession && !urlErrorMessage && !isRecoverySessionActive && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Sesi Pemulihan Tidak Ditemukan</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Halaman ini khusus untuk mereset kata sandi melalui tautan resmi yang dikirim ke email administrator.
                  Silakan ajukan permintaan pemulihan kata sandi melalui fitur &quot;Lupa Password&quot;.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {onGoToForgotPassword && (
                  <button
                    type="button"
                    onClick={onGoToForgotPassword}
                    className="w-full py-2.5 px-4 bg-[#008284] hover:bg-[#006769] text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Buka Halaman Lupa Password
                  </button>
                )}
                <button
                  type="button"
                  onClick={onReturnToLogin}
                  className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  Kembali ke Halaman Login
                </button>
              </div>
            </div>
          )}

          {/* 4. STATE: Sesi Pemulihan Aktif -> Tampilkan Formulir Password Baru */}
          {!isCheckingSession && isRecoverySessionActive && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Alert Status (Error / Success) */}
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

              {/* Password Baru Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#071F20] block">
                  Password Baru *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru (min. 6 karakter)"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 focus:border-[#008284] focus:ring-2 focus:ring-[#008284]/20 text-xs sm:text-sm transition-all outline-none"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#071F20] block">
                  Konfirmasi Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 focus:border-[#008284] focus:ring-2 focus:ring-[#008284]/20 text-xs sm:text-sm transition-all outline-none"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Tombol Simpan Password Baru */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-[#008284] hover:bg-[#006769] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Password Baru...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>SIMPAN PASSWORD BARU</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
