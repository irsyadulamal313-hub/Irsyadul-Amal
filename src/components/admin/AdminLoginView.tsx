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
  UserPlus,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sliders,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { IrsyadulAmalLogo } from '../IrsyadulAmalLogo';
import { useCMS } from '../../data/cmsContext';
import {
  signInAdmin,
  testSupabaseConnection,
  checkAdminEmailStatus,
  getAdminLoginDiagnostics,
  AdminLoginDiagnosticPanel,
} from '../../lib/adminAuth';
import { getSupabaseConfig, ADMIN_USERS_SQL_MIGRATION } from '../../lib/supabase';

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

  // Collapsible Diagnostic Panel State
  const [showDiagnosticPanel, setShowDiagnosticPanel] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<AdminLoginDiagnosticPanel>({
    supabase: 'TERHUBUNG',
    authUser: 'TIDAK DITEMUKAN',
    login: 'GAGAL',
    adminProfile: 'TIDAK DITEMUKAN',
    role: 'BUKAN ADMIN',
    status: 'INACTIVE',
  });
  const [isRefreshingDiagnostics, setIsRefreshingDiagnostics] = useState(false);

  // Status check feedback
  const [accountCheckMessage, setAccountCheckMessage] = useState<{
    text: string;
    type: 'success' | 'warning' | 'error';
  } | null>(null);
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);

  // Modals
  const [showConfigHelper, setShowConfigHelper] = useState(false);
  const [showSqlMigration, setShowSqlMigration] = useState(false);
  const [hasCopiedSql, setHasCopiedSql] = useState(false);

  // Refresh Diagnostics
  const runDiagnostics = async (targetEmail?: string) => {
    setIsRefreshingDiagnostics(true);
    try {
      const data = await getAdminLoginDiagnostics(targetEmail || email);
      setDiagnosticData(data);
    } catch {
      // ignore
    } finally {
      setIsRefreshingDiagnostics(false);
    }
  };

  // Check Supabase connection on load
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
    await runDiagnostics(email);
  };

  useEffect(() => {
    handleCheckConnection();
  }, []);

  // Handle Login submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setAccountCheckMessage(null);

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
        // Update diagnostic panel
        await runDiagnostics(cleanEmail);
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

      // Update diagnostic panel
      await runDiagnostics(cleanEmail);

      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(
        err?.message || 'Terjadi kesalahan sistem saat memproses login administrator.'
      );
      await runDiagnostics(cleanEmail);
    }
  };

  // Handle Tombol "Periksa Status Akun Admin"
  const handleInspectAccountStatus = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Masukkan alamat email pada kolom di atas untuk memeriksa status akun.');
      return;
    }

    setErrorMessage(null);
    setIsCheckingAccount(true);
    setAccountCheckMessage(null);

    try {
      const statusRes = await checkAdminEmailStatus(cleanEmail);
      const diagRes = await getAdminLoginDiagnostics(cleanEmail);
      setDiagnosticData(diagRes);
      setShowDiagnosticPanel(true);

      let msgType: 'success' | 'warning' | 'error' = 'warning';
      if (diagRes.role === 'ADMIN' && diagRes.status === 'AKTIF') {
        msgType = 'success';
      } else if (!statusRes.registered) {
        msgType = 'error';
      }

      setAccountCheckMessage({
        text: statusRes.message,
        type: msgType,
      });
    } catch {
      setAccountCheckMessage({
        text: 'Gagal melakukan pemeriksaan status akun ke Supabase.',
        type: 'error',
      });
    } finally {
      setIsCheckingAccount(false);
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

          {/* STATUS KONEKSI SUPABASE & TOMBOL PERIKSA */}
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
          {/* DIAGNOSTIC ERROR MESSAGE */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2 animate-in fade-in leading-relaxed">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{errorMessage}</p>
                </div>
              </div>

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

          {/* Account Check Result Message */}
          {accountCheckMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in ${
                accountCheckMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : accountCheckMessage.type === 'warning'
                  ? 'bg-amber-50 border border-amber-200 text-amber-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {accountCheckMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              )}
              <div className="flex-1">
                <p className="font-semibold leading-relaxed">{accountCheckMessage.text}</p>
              </div>
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
                  className="text-[11px] font-semibold text-[#008284] hover:underline cursor-pointer"
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

          {/* TOMBOL "PERIKSA STATUS AKUN ADMIN" */}
          <div className="pt-2 flex items-center justify-between text-xs border-t border-gray-100">
            <button
              type="button"
              onClick={handleInspectAccountStatus}
              disabled={isCheckingAccount}
              className="inline-flex items-center gap-1.5 text-xs text-[#008284] hover:text-[#006769] font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <Search className={`w-3.5 h-3.5 ${isCheckingAccount ? 'animate-spin' : ''}`} />
              {isCheckingAccount ? 'Memeriksa ke Supabase...' : 'Periksa Status Akun Admin'}
            </button>

            {onGoToSetup && (
              <button
                type="button"
                onClick={onGoToSetup}
                className="text-xs text-gray-600 hover:text-[#008284] font-medium hover:underline cursor-pointer"
              >
                Setup Admin Pertama
              </button>
            )}
          </div>
        </form>

        {/* 4. PANEL DIAGNOSTIK LOGIN (COLLAPSIBLE / BISA DIBUKA/TUTUP) */}
        <div className="border-t border-[#E0EAEA] bg-gray-50/80">
          <button
            type="button"
            onClick={() => {
              const nextState = !showDiagnosticPanel;
              setShowDiagnosticPanel(nextState);
              if (nextState) {
                runDiagnostics(email);
              }
            }}
            className="w-full px-6 py-2.5 flex items-center justify-between text-[11px] font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-teal-700" />
              Panel Diagnostik Login
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-400 font-normal">
                {showDiagnosticPanel ? 'Tutup' : 'Buka'}
              </span>
              {showDiagnosticPanel ? (
                <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              )}
            </div>
          </button>

          {showDiagnosticPanel && (
            <div className="px-6 pb-4 pt-2 space-y-2 text-[11px] border-t border-gray-200/60 bg-white animate-in fade-in">
              <div className="grid grid-cols-2 gap-2">
                {/* 1. Supabase: TERHUBUNG / TIDAK TERHUBUNG */}
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between">
                  <span className="text-gray-500 font-medium text-[10px]">Supabase:</span>
                  <span
                    className={`font-bold mt-1 ${
                      diagnosticData.supabase === 'TERHUBUNG'
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {diagnosticData.supabase}
                  </span>
                </div>

                {/* 2. Auth User: DITEMUKAN / TIDAK DITEMUKAN */}
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between">
                  <span className="text-gray-500 font-medium text-[10px]">Auth User:</span>
                  <span
                    className={`font-bold mt-1 ${
                      diagnosticData.authUser === 'DITEMUKAN'
                        ? 'text-emerald-700'
                        : 'text-gray-600'
                    }`}
                  >
                    {diagnosticData.authUser}
                  </span>
                </div>

                {/* 3. Login: BERHASIL / GAGAL */}
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between">
                  <span className="text-gray-500 font-medium text-[10px]">Login:</span>
                  <span
                    className={`font-bold mt-1 ${
                      diagnosticData.login === 'BERHASIL'
                        ? 'text-emerald-700'
                        : 'text-gray-600'
                    }`}
                  >
                    {diagnosticData.login}
                  </span>
                </div>

                {/* 4. Admin Profile: DITEMUKAN / TIDAK DITEMUKAN */}
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between">
                  <span className="text-gray-500 font-medium text-[10px]">Admin Profile:</span>
                  <span
                    className={`font-bold mt-1 ${
                      diagnosticData.adminProfile === 'DITEMUKAN'
                        ? 'text-teal-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {diagnosticData.adminProfile}
                  </span>
                </div>

                {/* 5. Role: ADMIN / BUKAN ADMIN */}
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between">
                  <span className="text-gray-500 font-medium text-[10px]">Role:</span>
                  <span
                    className={`font-bold mt-1 ${
                      diagnosticData.role === 'ADMIN'
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {diagnosticData.role}
                  </span>
                </div>

                {/* 6. Status: ACTIVE / INACTIVE */}
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between">
                  <span className="text-gray-500 font-medium text-[10px]">Status:</span>
                  <span
                    className={`font-bold mt-1 ${
                      diagnosticData.status === 'ACTIVE'
                        ? 'text-emerald-700'
                        : 'text-gray-500'
                    }`}
                  >
                    {diagnosticData.status}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] text-gray-500">
                <span>Data diambil secara langsung dari Supabase.</span>
                <button
                  type="button"
                  onClick={() => runDiagnostics(email)}
                  disabled={isRefreshingDiagnostics}
                  className="text-[#008284] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingDiagnostics ? 'animate-spin' : ''}`} />
                  Segarkan
                </button>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowSqlMigration(!showSqlMigration)}
                  className="text-[10px] text-[#008284] hover:underline font-semibold cursor-pointer"
                >
                  {showSqlMigration ? 'Tutup Skema SQL' : 'Skema SQL admin_users'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(ADMIN_USERS_SQL_MIGRATION);
                    setHasCopiedSql(true);
                    setTimeout(() => setHasCopiedSql(false), 2500);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                  {hasCopiedSql ? (
                    <>
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-2.5 h-2.5" />
                      <span>Salin SQL</span>
                    </>
                  )}
                </button>
              </div>

              {showSqlMigration && (
                <div className="pt-2 animate-in fade-in">
                  <pre className="p-2.5 bg-gray-900 text-gray-100 text-[9px] font-mono rounded-xl max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {ADMIN_USERS_SQL_MIGRATION}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Bantuan Status Konfigurasi Supabase */}
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
    </div>
  );
};

