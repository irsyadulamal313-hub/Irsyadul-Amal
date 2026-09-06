import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowLeft,
  AlertCircle,
  Database,
  RefreshCw,
  Search,
  KeyRound,
  UserPlus,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sliders,
  X,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { IrsyadulAmalLogo } from '../IrsyadulAmalLogo';
import { useCMS } from '../../data/cmsContext';
import {
  signInAdmin,
  testSupabaseConnection,
  checkAdminEmailStatus,
  checkAdminAccountDiagnostics,
  AdminAccountDiagnosticResult,
  getSafeAdminDiagnostics,
  AdminDiagnosticState,
  claimFirstAdminBootstrap,
} from '../../lib/adminAuth';
import { getSupabaseConfig, isSupabaseConfigured, ADMIN_USERS_SQL_MIGRATION } from '../../lib/supabase';

interface AdminLoginViewProps {
  onReturnToPublic: () => void;
  onLoginSuccess?: () => void;
  onGoToSetup?: () => void;
  onGoToForgotPassword?: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onReturnToPublic,
  onLoginSuccess,
  onGoToSetup,
  onGoToForgotPassword,
}) => {
  const { loginAdmin } = useCMS();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginNotice, setLoginNotice] = useState<{
    canClaimFirstAdmin?: boolean;
    needsSqlFix?: boolean;
    email?: string;
  } | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  // Connection diagnostics
  const [connectionState, setConnectionState] = useState<{
    isChecked: boolean;
    isConnected: boolean;
    statusText: string;
    latencyMs?: number;
    error?: string;
    isChecking: boolean;
  }>({
    isChecked: false,
    isConnected: false,
    statusText: 'Memeriksa koneksi...',
    isChecking: true,
  });

  // Modals & Panels
  const [showConfigHelper, setShowConfigHelper] = useState(false);
  const [showAccountChecker, setShowAccountChecker] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Account checker state
  const [checkEmailInput, setCheckEmailInput] = useState('');
  const [checkAccountResult, setCheckAccountResult] = useState<{
    loading: boolean;
    message: string | null;
    type: 'success' | 'warning' | 'error' | null;
  }>({
    loading: false,
    message: null,
    type: null,
  });
  const [accountDiagnostic, setAccountDiagnostic] = useState<AdminAccountDiagnosticResult | null>(null);
  const [hasCopiedSql, setHasCopiedSql] = useState(false);
  const [showSqlMigration, setShowSqlMigration] = useState(false);

  // Safe diagnostics state
  const [diagnostics, setDiagnostics] = useState<AdminDiagnosticState | null>(null);

  // Execute Live Connection Test
  const handleCheckConnection = async () => {
    setConnectionState((prev) => ({ ...prev, isChecking: true }));
    const res = await testSupabaseConnection();
    setConnectionState({
      isChecked: true,
      isConnected: res.isConnected,
      statusText: res.statusText,
      latencyMs: res.latencyMs,
      error: res.error,
      isChecking: false,
    });

    const diag = await getSafeAdminDiagnostics();
    setDiagnostics(diag);
  };

  useEffect(() => {
    handleCheckConnection();
  }, []);

  // Handle Login submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoginNotice(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Silakan masukkan email administrator resmi.');
      return;
    }

    if (!password) {
      setErrorMessage('Silakan masukkan kata sandi.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Eksekusi Supabase Auth murni (signInWithPassword) & Verifikasi Hak Akses Admin
      const result = await signInAdmin({
        email: cleanEmail,
        password: password,
      });

      if (!result.success || !result.user) {
        setIsLoading(false);
        setErrorMessage(result.error || 'Autentikasi gagal. Silakan periksa kembali akun Anda.');
        if (result.canClaimFirstAdmin || result.needsSqlFix) {
          setLoginNotice({
            canClaimFirstAdmin: result.canClaimFirstAdmin,
            needsSqlFix: result.needsSqlFix,
            email: cleanEmail,
          });
        }
        return;
      }

      // 2. Sinkronkan sesi admin terverifikasi ke CMS
      loginAdmin({
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        username: result.user.name,
      });

      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(
        err?.message || 'Terjadi kesalahan sistem saat memproses login administrator.'
      );
    }
  };

  // Handle klaim administrator pertama jika user Supabase Auth sudah berhasil login
  const handleClaimFirstAdmin = async () => {
    setIsClaiming(true);
    try {
      const res = await claimFirstAdminBootstrap();
      if (res.success && res.user) {
        loginAdmin({
          id: res.user.id,
          email: res.user.email,
          name: res.user.name,
          role: res.user.role,
          username: res.user.name,
        });
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        setErrorMessage(res.error || 'Gagal mendaftarkan hak akses administrator.');
        setShowSqlMigration(true);
        setShowAccountChecker(true);
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'Gagal bootstrap administrator.');
    } finally {
      setIsClaiming(false);
    }
  };

  // Handle Account Status Check
  const handleInspectEmailStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = checkEmailInput.trim().toLowerCase();
    if (!clean) return;

    setCheckAccountResult({
      loading: true,
      message: 'Memeriksa status akun dan role administrator di Supabase...',
      type: null,
    });
    setAccountDiagnostic(null);

    try {
      const [simpleResult, diagResult] = await Promise.all([
        checkAdminEmailStatus(clean),
        checkAdminAccountDiagnostics(clean),
      ]);

      setAccountDiagnostic(diagResult);

      let type: 'success' | 'warning' | 'error' = 'error';
      if (diagResult.role === 'ADMIN' && diagResult.status === 'AKTIF') {
        type = 'success';
      } else if (diagResult.adminProfile === 'DITEMUKAN') {
        type = 'warning';
      } else {
        type = 'warning';
      }

      setCheckAccountResult({
        loading: false,
        message: diagResult.notes || simpleResult.message,
        type,
      });
    } catch {
      setCheckAccountResult({
        loading: false,
        message: 'Gagal menjalankan pemeriksaan status akun. Pastikan koneksi Supabase aktif.',
        type: 'error',
      });
    }
  };

  const { url, anonKey } = getSupabaseConfig();
  const maskedUrl = url
    ? url.length > 25
      ? `${url.substring(0, 18)}...${url.substring(url.length - 8)}`
      : url
    : 'Belum terkonfigurasi';
  const isAnonKeyActive = anonKey && anonKey.length > 15;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071F20] via-[#004D4F] to-[#006769] flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative font-sans selection:bg-[#008284] selection:text-white">
      {/* Top Header Buttons */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onReturnToPublic}
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl backdrop-blur-md transition-all border border-white/15 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Website Publik
        </button>

        {onGoToSetup && (
          <button
            type="button"
            onClick={onGoToSetup}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-200 hover:text-white bg-teal-900/40 hover:bg-teal-800/60 px-3 py-2 rounded-xl backdrop-blur-md transition-all border border-teal-500/30 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-teal-300" />
            Setup Admin Pertama
          </button>
        )}
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-200">
        {/* Card Header */}
        <div className="bg-gradient-to-b from-[#F0FAFA] to-white p-6 sm:p-8 text-center border-b border-[#E0EAEA]">
          <div className="inline-flex justify-center mb-3">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-[#CCFBF1]">
              <IrsyadulAmalLogo size={50} />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#008284] tracking-tight">
            Dashboard Admin
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-[#071F20] mt-1">
            Lembaga Sosial & Kemanusiaan Irsyadul Amal
          </p>
          <p className="text-xs text-[#647B7C] mt-1.5 leading-relaxed">
            Pusat autentikasi pengelola untuk CMS konten, donasi, program, rekening, dan laporan resmi.
          </p>

          {/* 3. STATUS KONEKSI SUPABASE & TOMBOL PERIKSA */}
          <div className="mt-4 pt-3 border-t border-[#E0EAEA]/60 flex flex-wrap items-center justify-between gap-2 text-left">
            <div className="inline-flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {connectionState.isConnected ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                )}
              </span>
              <div>
                <span
                  className={`text-xs font-bold ${
                    connectionState.isConnected ? 'text-emerald-800' : 'text-rose-700'
                  }`}
                >
                  {connectionState.statusText}
                </span>
                {connectionState.latencyMs !== undefined && connectionState.isConnected && (
                  <span className="text-[10px] text-gray-500 ml-1.5 font-mono">
                    ({connectionState.latencyMs}ms)
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCheckConnection}
                disabled={connectionState.isChecking}
                title="Periksa kembali koneksi Supabase"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#008284] hover:text-[#006769] bg-teal-50 hover:bg-teal-100/80 rounded-lg border border-teal-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3 h-3 ${connectionState.isChecking ? 'animate-spin' : ''}`}
                />
                Periksa
              </button>

              <button
                type="button"
                onClick={() => setShowConfigHelper(true)}
                title="Lihat status konfigurasi URL dan Key"
                className="p-1 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {/* 2. DIAGNOSTIC ERROR MESSAGE */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2 animate-in fade-in leading-relaxed">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{errorMessage}</p>
                </div>
              </div>

              {loginNotice?.canClaimFirstAdmin && (
                <div className="pt-2 border-t border-rose-200/60 flex flex-col gap-1.5">
                  <p className="text-[11px] text-rose-700">
                    Akun Supabase Auth Anda sudah aktif. Anda dapat mendaftarkannya sebagai administrator pertama sekarang:
                  </p>
                  <button
                    type="button"
                    onClick={handleClaimFirstAdmin}
                    disabled={isClaiming}
                    className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isClaiming ? 'Menghubungkan Administrator...' : 'Tautkan Akun & Masuk ke Dashboard'}
                  </button>
                </div>
              )}

              {loginNotice?.needsSqlFix && (
                <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setCheckEmailInput(email || 'irsyadulamal313@gmail.com');
                      setShowAccountChecker(true);
                      setShowSqlMigration(true);
                    }}
                    className="text-[#008284] hover:underline font-bold"
                  >
                    Buka Panduan SQL & Skema admin_users &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(ADMIN_USERS_SQL_MIGRATION);
                      setHasCopiedSql(true);
                      setTimeout(() => setHasCopiedSql(false), 2500);
                    }}
                    className="text-rose-900 underline font-semibold cursor-pointer"
                  >
                    {hasCopiedSql ? 'SQL Tersalin!' : 'Salin SQL Migration'}
                  </button>
                </div>
              )}

              {errorMessage.includes('belum terdaftar') && onGoToSetup && (
                <button
                  type="button"
                  onClick={onGoToSetup}
                  className="mt-1.5 text-[11px] font-bold text-rose-900 underline block"
                >
                  Buka Halaman Setup Admin Pertama &rarr;
                </button>
              )}
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#071F20] block">
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

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#071F20] block">
                Kata Sandi
              </label>
              {onGoToForgotPassword && (
                <button
                  type="button"
                  onClick={onGoToForgotPassword}
                  className="text-[11px] font-semibold text-[#008284] hover:underline"
                >
                  Lupa Password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#008284] focus:ring-2 focus:ring-[#008284]/20 text-xs sm:text-sm transition-all outline-none"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-[#008284] hover:bg-[#006769] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <ShieldCheck className="w-4 h-4" />
            {isLoading ? 'Memverifikasi Supabase Auth...' : 'MASUK KE DASHBOARD ADMIN'}
          </button>

          {/* 4. INFORMASI STATUS AKUN BUTTON */}
          <div className="pt-2 flex items-center justify-between text-xs border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowAccountChecker(true)}
              className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#008284] font-medium transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-gray-400" />
              Periksa Status Akun Admin
            </button>

            {onGoToSetup && (
              <button
                type="button"
                onClick={onGoToSetup}
                className="text-xs text-[#008284] font-semibold hover:underline"
              >
                Setup Admin Baru
              </button>
            )}
          </div>
        </form>

        {/* 12. DEBUG PANEL (DEVELOPMENT ONLY) */}
        <div className="border-t border-[#E0EAEA] bg-gray-50/80">
          <button
            type="button"
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="w-full px-6 py-2.5 flex items-center justify-between text-[11px] font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-gray-500" />
              Panel Diagnostik Sistem (Pengembang)
            </span>
            {showDebugPanel ? (
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>

          {showDebugPanel && (
            <div className="px-6 pb-4 pt-1 space-y-2 text-[11px] border-t border-gray-200/60 bg-white">
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Supabase URL:</span>
                <span className="font-mono text-gray-800 font-medium">
                  {diagnostics?.isUrlConfigured ? (
                    <span className="text-emerald-700 font-bold">Terpasang ({maskedUrl})</span>
                  ) : (
                    <span className="text-rose-600 font-bold">Belum Terpasang</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Anon Public Key:</span>
                <span className="font-mono font-medium">
                  {diagnostics?.isKeyConfigured ? (
                    <span className="text-emerald-700 font-bold">Terpasang (Aktif)</span>
                  ) : (
                    <span className="text-rose-600 font-bold">Belum Terpasang</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Klien Supabase:</span>
                <span className="font-medium">
                  {diagnostics?.isClientInitialized ? (
                    <span className="text-emerald-700">Inisialisasi Berhasil</span>
                  ) : (
                    <span className="text-rose-600">Gagal Inisialisasi</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Sesi Aktif:</span>
                <span className="font-medium">
                  {diagnostics?.hasSession ? (
                    <span className="text-emerald-700">Ada Sesi Aktif</span>
                  ) : (
                    <span className="text-gray-500">Tidak Ada Sesi</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500">Hak Akses Role:</span>
                <span className="font-medium">
                  {diagnostics?.isAdminRole ? (
                    <span className="text-emerald-700 font-bold">Terverifikasi Admin</span>
                  ) : (
                    <span className="text-gray-500">Belum Terverifikasi</span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Bantuan Status Konfigurasi Supabase */}
      {showConfigHelper && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-[#071F20] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#008284]" />
                Status Konfigurasi Supabase
              </h3>
              <button
                type="button"
                onClick={() => setShowConfigHelper(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Sistem membaca variabel lingkungan <code>VITE_SUPABASE_URL</code> dan{' '}
              <code>VITE_SUPABASE_ANON_KEY</code>.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-500 font-semibold mb-1">VITE_SUPABASE_URL</p>
                <p className="font-mono text-gray-800 break-all">{maskedUrl}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-500 font-semibold mb-1">VITE_SUPABASE_ANON_KEY</p>
                <p className="font-mono text-gray-800">
                  {isAnonKeyActive ? 'Terpasang & Siap Digunakan' : 'Belum Dikonfigurasi'}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowConfigHelper(false)}
                className="w-full py-2.5 bg-[#008284] text-white text-xs font-semibold rounded-xl hover:bg-[#006769] transition-all cursor-pointer"
              >
                Tutup Informasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Fitur Periksa Status Akun (Tanpa bocor password) */}
      {showAccountChecker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-[#071F20] flex items-center gap-2">
                <Search className="w-4 h-4 text-[#008284]" />
                Periksa Status Akun Administrator
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAccountChecker(false);
                  setCheckAccountResult({ loading: false, message: null, type: null });
                }}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Gunakan fitur ini untuk memeriksa apakah email Anda telah terdaftar sebagai administrator di Supabase. Pemeriksaan ini bersifat aman dan tidak menampilkan kata sandi.
            </p>

            <form onSubmit={handleInspectEmailStatus} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={checkEmailInput}
                  onChange={(e) => setCheckEmailInput(e.target.value)}
                  placeholder="Masukkan email yang ingin diperiksa..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 text-xs outline-none focus:border-[#008284] focus:ring-1 focus:ring-[#008284]"
                />
                <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              </div>

              <button
                type="submit"
                disabled={checkAccountResult.loading}
                className="w-full py-2.5 bg-[#008284] hover:bg-[#006769] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-60"
              >
                {checkAccountResult.loading ? 'Memeriksa Database...' : 'Periksa Status Email'}
              </button>
            </form>

            {/* 10. DIAGNOSTIK 6 STATUS UTAMA */}
            {accountDiagnostic && (
              <div className="space-y-2.5 pt-1">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500 block font-medium">Supabase:</span>
                    <span
                      className={`font-bold ${
                        accountDiagnostic.supabase === 'TERHUBUNG'
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {accountDiagnostic.supabase}
                    </span>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500 block font-medium">Auth:</span>
                    <span
                      className={`font-bold ${
                        accountDiagnostic.auth === 'USER TERDAFTAR'
                          ? 'text-emerald-700'
                          : 'text-gray-600'
                      }`}
                    >
                      {accountDiagnostic.auth}
                    </span>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500 block font-medium">Login:</span>
                    <span
                      className={`font-bold ${
                        accountDiagnostic.login === 'BERHASIL'
                          ? 'text-emerald-700'
                          : 'text-gray-600'
                      }`}
                    >
                      {accountDiagnostic.login}
                    </span>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500 block font-medium">Admin Profile:</span>
                    <span
                      className={`font-bold ${
                        accountDiagnostic.adminProfile === 'DITEMUKAN'
                          ? 'text-teal-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {accountDiagnostic.adminProfile}
                    </span>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500 block font-medium">Role:</span>
                    <span
                      className={`font-bold ${
                        accountDiagnostic.role === 'ADMIN'
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {accountDiagnostic.role}
                    </span>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500 block font-medium">Status:</span>
                    <span
                      className={`font-bold ${
                        accountDiagnostic.status === 'AKTIF'
                          ? 'text-emerald-700'
                          : accountDiagnostic.status === 'TIDAK AKTIF'
                          ? 'text-rose-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {accountDiagnostic.status}
                    </span>
                  </div>
                </div>

                <div className="p-2 bg-gray-50 rounded-lg text-[10px] text-gray-500 text-center">
                  Keamanan Terjamin: Sistem tidak pernah menampilkan atau menyimpan password, access token, refresh token, maupun service key.
                </div>
              </div>
            )}

            {checkAccountResult.message && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                  checkAccountResult.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                {checkAccountResult.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{checkAccountResult.message}</span>
              </div>
            )}

            {/* Tombol Salin SQL Migration Skema admin_users jika profil belum ditemukan */}
            <div className="pt-1 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowSqlMigration(!showSqlMigration)}
                className="text-[11px] text-[#008284] hover:underline font-semibold"
              >
                {showSqlMigration ? 'Sembunyikan Bantuan SQL' : 'Lihat Skema SQL admin_users'}
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(ADMIN_USERS_SQL_MIGRATION);
                  setHasCopiedSql(true);
                  setTimeout(() => setHasCopiedSql(false), 2500);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                {hasCopiedSql ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin SQL Migration</span>
                  </>
                )}
              </button>
            </div>

            {showSqlMigration && (
              <div className="space-y-1.5 animate-in fade-in">
                <p className="text-[11px] text-gray-500">
                  Jalankan skrip ini di <b>Supabase SQL Editor</b> jika tabel <code>admin_users</code> belum ada:
                </p>
                <pre className="p-3 bg-gray-900 text-gray-100 text-[10px] font-mono rounded-xl max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {ADMIN_USERS_SQL_MIGRATION}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
