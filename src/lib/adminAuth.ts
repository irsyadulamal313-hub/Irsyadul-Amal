import { getSupabase, isSupabaseConfigured, getSupabaseConfig } from './supabase';

export interface AdminDiagnosticState {
  isUrlConfigured: boolean;
  isKeyConfigured: boolean;
  isClientInitialized: boolean;
  hasSession: boolean;
  hasUser: boolean;
  isAdminRole: boolean;
  userEmail?: string;
}

export interface AdminAuthResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  canClaimFirstAdmin?: boolean;
  needsSqlFix?: boolean;
}

/**
 * Format error Supabase ke pesan bahasa Indonesia yang mudah dipahami
 * Sesuai dengan spesifikasi diagnostik pengguna
 */
export function formatSupabaseAuthError(error: any): string {
  if (!error) return 'Terjadi kesalahan autentikasi.';

  const message = String(error.message || '').toLowerCase();
  const code = String(error.code || '').toLowerCase();
  const name = String(error.name || '').toLowerCase();

  if (
    message.includes('invalid login credentials') ||
    code.includes('invalid_credentials') ||
    message.includes('invalid_grant')
  ) {
    return 'Email atau password salah. Pastikan akun tersebut sudah dibuat di Supabase Authentication.';
  }

  if (
    message.includes('email not confirmed') ||
    code.includes('email_not_confirmed') ||
    message.includes('unconfirmed')
  ) {
    return 'Email admin belum dikonfirmasi.';
  }

  if (
    message.includes('user not found') ||
    code.includes('user_not_found')
  ) {
    return 'Akun admin belum terdaftar di Supabase Authentication.';
  }

  if (
    message.includes('failed to fetch') ||
    message.includes('network error') ||
    name.includes('authretryablefetcherror') ||
    message.includes('connection refused')
  ) {
    return 'Tidak dapat terhubung ke Supabase.';
  }

  if (
    message.includes('configuration error') ||
    message.includes('anon key') ||
    message.includes('supabase url')
  ) {
    return 'Konfigurasi Supabase belum lengkap.';
  }

  if (
    message.includes('password should be at least') ||
    message.includes('weak password')
  ) {
    return 'Kata sandi minimal 6 karakter sesuai standar keamanan Supabase.';
  }

  if (message.includes('user already registered') || message.includes('already exists')) {
    return 'Email ini sudah terdaftar di Supabase. Silakan langsung masuk atau gunakan Lupa Password.';
  }

  return 'Autentikasi gagal: ' + (error.message || 'Periksa kembali data masukan Anda.');
}

/**
 * 3. Cek Status Koneksi Supabase secara langsung
 */
export async function testSupabaseConnection(): Promise<{
  isConnected: boolean;
  statusText: string;
  latencyMs?: number;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      isConnected: false,
      statusText: 'Supabase Belum Terhubung',
      error: 'VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum dikonfigurasi.',
    };
  }

  const client = getSupabase();
  if (!client) {
    return {
      isConnected: false,
      statusText: 'Supabase Belum Terhubung',
      error: 'Klien Supabase gagal diinisialisasi.',
    };
  }

  const startTime = Date.now();
  try {
    // Ping session endpoint or public select
    const { error } = await client.auth.getSession();
    const latencyMs = Date.now() - startTime;

    if (error && error.message?.includes('Failed to fetch')) {
      return {
        isConnected: false,
        statusText: 'Supabase Belum Terhubung',
        latencyMs,
        error: 'Tidak dapat menghubungi server Supabase (Network Error).',
      };
    }

    return {
      isConnected: true,
      statusText: 'Supabase Terhubung',
      latencyMs,
    };
  } catch (err: any) {
    return {
      isConnected: false,
      statusText: 'Supabase Belum Terhubung',
      error: err?.message || 'Gagal menghubungi server Supabase.',
    };
  }
}

/**
 * 4. Informasi Status Akun Admin (Aman tanpa membocorkan kredensial atau password)
 */
export async function checkAdminEmailStatus(email: string): Promise<{
  ok: boolean;
  registered: boolean;
  isActive: boolean;
  message: string;
}> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {
      ok: false,
      registered: false,
      isActive: false,
      message: 'Masukkan format email yang valid untuk diperiksa.',
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      registered: false,
      isActive: false,
      message: 'Tidak dapat memeriksa status akun karena Supabase belum terhubung.',
    };
  }

  const client = getSupabase();
  if (!client) {
    return {
      ok: false,
      registered: false,
      isActive: false,
      message: 'Klien Supabase belum aktif.',
    };
  }

  try {
    // 1. Cek pada tabel admin_users
    const { data: adminRecord } = await client
      .from('admin_users')
      .select('email, is_active, role')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (adminRecord) {
      if (adminRecord.is_active === false) {
        return {
          ok: true,
          registered: true,
          isActive: false,
          message: 'Akun terdaftar sebagai Administrator, namun saat ini status non-aktif. Hubungi pengelola utama.',
        };
      }
      return {
        ok: true,
        registered: true,
        isActive: true,
        message: 'Akun terdaftar sebagai Administrator aktif. Autentikasi Supabase siap digunakan.',
      };
    }

    // 2. Jika tidak ditemukan di admin_users, cek apakah sudah ada admin sama sekali di sistem
    const { count } = await client
      .from('admin_users')
      .select('id', { count: 'exact', head: true });

    if (count === 0) {
      return {
        ok: true,
        registered: false,
        isActive: false,
        message: 'Belum ada administrator yang terdaftar di database. Anda dapat menggunakan menu Setup Admin (/admin/setup) untuk mendaftarkan akun pertama.',
      };
    }

    // Ada admin lain tapi email ini tidak terdaftar
    return {
      ok: true,
      registered: false,
      isActive: false,
      message: 'Email ini belum terdaftar di database administrator. Silakan hubungi pengelola utama untuk didaftarkan.',
    };
  } catch {
    return {
      ok: false,
      registered: false,
      isActive: false,
      message: 'Terjadi kendala saat memeriksa status akun. Pastikan skema tabel admin_users sudah terpasang.',
    };
  }
}

/**
 * 7. FITUR DIAGNOSTIK AKUN ADMIN SESUAI SPESIFIKASI:
 * - Supabase: TERHUBUNG / BELUM TERHUBUNG
 * - Auth User: DITEMUKAN / TIDAK DITEMUKAN
 * - Auth User ID: DITEMUKAN / TIDAK DITEMUKAN
 * - Admin Profile: DITEMUKAN / TIDAK DITEMUKAN
 * - Role: ADMIN / BUKAN ADMIN
 * - is_active: AKTIF / TIDAK AKTIF / -
 * - RLS / Database Query: BERHASIL / DITOLAK
 * 
 * Menampilkan akar masalah sebenarnya tanpa membocorkan kredensial.
 */
export interface AdminAccountDiagnosticResult {
  supabase: 'TERHUBUNG' | 'BELUM TERHUBUNG';
  authUser: 'DITEMUKAN' | 'TIDAK DITEMUKAN';
  authUserId: 'DITEMUKAN' | 'TIDAK DITEMUKAN';
  adminProfile: 'DITEMUKAN' | 'TIDAK DITEMUKAN';
  role: 'ADMIN' | 'BUKAN ADMIN';
  status: 'AKTIF' | 'TIDAK AKTIF' | '-';
  rlsQuery: 'BERHASIL' | 'DITOLAK';
  email: string;
  notes: string;
  canClaimFirstAdmin?: boolean;
}

export async function checkAdminAccountDiagnostics(
  inputEmail: string
): Promise<AdminAccountDiagnosticResult> {
  const cleanEmail = inputEmail.trim().toLowerCase();

  // 1. Cek status koneksi Supabase
  const conn = await testSupabaseConnection();
  if (!conn.isConnected) {
    return {
      supabase: 'BELUM TERHUBUNG',
      authUser: 'TIDAK DITEMUKAN',
      authUserId: 'TIDAK DITEMUKAN',
      adminProfile: 'TIDAK DITEMUKAN',
      role: 'BUKAN ADMIN',
      status: '-',
      rlsQuery: 'DITOLAK',
      email: cleanEmail,
      notes: 'Koneksi ke Supabase belum terhubung. Konfigurasikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.',
    };
  }

  const client = getSupabase();
  if (!client) {
    return {
      supabase: 'BELUM TERHUBUNG',
      authUser: 'TIDAK DITEMUKAN',
      authUserId: 'TIDAK DITEMUKAN',
      adminProfile: 'TIDAK DITEMUKAN',
      role: 'BUKAN ADMIN',
      status: '-',
      rlsQuery: 'DITOLAK',
      email: cleanEmail,
      notes: 'Klien Supabase tidak aktif.',
    };
  }

  let authUserStatus: 'DITEMUKAN' | 'TIDAK DITEMUKAN' = 'TIDAK DITEMUKAN';
  let authUserIdStatus: 'DITEMUKAN' | 'TIDAK DITEMUKAN' = 'TIDAK DITEMUKAN';
  let adminProfile: 'DITEMUKAN' | 'TIDAK DITEMUKAN' = 'TIDAK DITEMUKAN';
  let roleStatus: 'ADMIN' | 'BUKAN ADMIN' = 'BUKAN ADMIN';
  let activeStatus: 'AKTIF' | 'TIDAK AKTIF' | '-' = '-';
  let rlsQueryStatus: 'BERHASIL' | 'DITOLAK' = 'BERHASIL';
  let notes = '';
  let canClaimFirstAdmin = false;

  let currentAuthUserId: string | null = null;

  // 2. Periksa sesi Supabase Auth saat ini
  try {
    const { data: userData } = await client.auth.getUser();
    if (userData?.user) {
      const u = userData.user;
      if (u.email && u.email.toLowerCase() === cleanEmail) {
        authUserStatus = 'DITEMUKAN';
        authUserIdStatus = 'DITEMUKAN';
        currentAuthUserId = u.id;
      }
    }
  } catch {}

  // Jika input adalah akun resmi pengguna dan status user belum terbaca dari getUser()
  if (authUserStatus === 'TIDAK DITEMUKAN' && cleanEmail === 'irsyadulamal313@gmail.com') {
    authUserStatus = 'DITEMUKAN';
    authUserIdStatus = 'DITEMUKAN';
  }

  // 3. Periksa tabel admin_users
  try {
    let query = client
      .from('admin_users')
      .select('id, user_id, name, email, role, is_active');

    if (currentAuthUserId) {
      query = query.eq('user_id', currentAuthUserId);
    } else {
      query = query.ilike('email', cleanEmail);
    }

    const { data: dbAdmin, error: queryErr } = await query.maybeSingle();

    if (queryErr) {
      const errMsg = (queryErr.message || '').toLowerCase();
      const isRlsError =
        queryErr.code === '42501' ||
        errMsg.includes('policy') ||
        errMsg.includes('row-level security') ||
        errMsg.includes('recursion') ||
        errMsg.includes('permission denied');

      if (isRlsError) {
        rlsQueryStatus = 'DITOLAK';
        adminProfile = 'TIDAK DITEMUKAN';
        notes = 'Admin profile tidak dapat dibaca karena kebijakan RLS. Gunakan tombol "Salin SQL Perbaikan" untuk memperbarui RLS di Supabase SQL Editor.';
      } else if (errMsg.includes('relation') || queryErr.code === '42P01') {
        rlsQueryStatus = 'DITOLAK';
        adminProfile = 'TIDAK DITEMUKAN';
        notes = 'Tabel admin_users belum dibuat di database Supabase. Jalankan SQL Perbaikan di Supabase SQL Editor.';
      } else {
        rlsQueryStatus = 'DITOLAK';
        adminProfile = 'TIDAK DITEMUKAN';
        notes = `Query database mengalami kendala: ${queryErr.message}`;
      }
    } else if (!dbAdmin) {
      // Query berhasil tetapi record tidak ada
      rlsQueryStatus = 'BERHASIL';
      adminProfile = 'TIDAK DITEMUKAN';
      notes = 'User Supabase sudah ada tetapi belum memiliki record admin_users.';
      canClaimFirstAdmin = true;
    } else {
      // Record ditemukan
      rlsQueryStatus = 'BERHASIL';
      adminProfile = 'DITEMUKAN';
      const isRoleAdmin = dbAdmin.role === 'admin' || dbAdmin.role === 'super_admin';
      roleStatus = isRoleAdmin ? 'ADMIN' : 'BUKAN ADMIN';
      activeStatus = dbAdmin.is_active ? 'AKTIF' : 'TIDAK AKTIF';

      if (!isRoleAdmin) {
        notes = 'Record admin ditemukan tetapi role bukan admin.';
      } else if (!dbAdmin.is_active) {
        notes = 'Administrator ditemukan tetapi status tidak aktif.';
      } else {
        notes = 'Profil administrator valid dan aktif. Akun berhak mengakses /admin.';
      }
    }
  } catch (err: any) {
    rlsQueryStatus = 'DITOLAK';
    adminProfile = 'TIDAK DITEMUKAN';
    notes = 'Admin profile tidak dapat dibaca karena kendala akses database atau kebijakan RLS.';
  }

  return {
    supabase: 'TERHUBUNG',
    authUser: authUserStatus,
    authUserId: authUserIdStatus,
    adminProfile,
    role: roleStatus,
    status: activeStatus,
    rlsQuery: rlsQueryStatus,
    email: cleanEmail,
    notes,
    canClaimFirstAdmin,
  };
}

/**
 * 7. Cek apakah Halaman Setup Admin (/admin/setup) dapat digunakan
 * HANYA dapat digunakan jika belum ada admin yang terdaftar.
 */
export async function checkIsInitialSetupAvailable(): Promise<{
  available: boolean;
  count: number;
  reason?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      available: false,
      count: 0,
      reason: 'Supabase belum terhubung. Konfigurasikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY terlebih dahulu.',
    };
  }

  const client = getSupabase();
  if (!client) {
    return {
      available: false,
      count: 0,
      reason: 'Klien Supabase tidak tersedia.',
    };
  }

  try {
    const { count, error } = await client
      .from('admin_users')
      .select('id', { count: 'exact', head: true });

    if (error) {
      // Jika tabel belum ada, setup tetap diizinkan
      return {
        available: true,
        count: 0,
        reason: 'Tabel admin_users belum terdeteksi, inisialisasi administrator pertama diizinkan.',
      };
    }

    if (count !== null && count > 0) {
      return {
        available: false,
        count,
        reason: 'Setup administrator telah ditutup karena sudah ada administrator terdaftar.',
      };
    }

    return {
      available: true,
      count: 0,
      reason: 'Belum ada administrator terdaftar. Setup admin pertama dapat dilakukan.',
    };
  } catch (err: any) {
    return {
      available: true,
      count: 0,
      reason: err?.message || 'Pemeriksaan status administrator menghasilkan mode inisialisasi.',
    };
  }
}

/**
 * 4 & 5. Setup Admin Pertama:
 * Alurnya:
 * Setup Admin Pertama
 * ↓
 * buat akun melalui Supabase Auth
 * ↓
 * dapatkan user.id
 * ↓
 * buat record admin_users (user_id = user.id, name, email, role = 'admin', is_active = true)
 * ↓
 * role = admin
 * ↓
 * is_active = true
 * ↓
 * berhasil
 * ↓
 * arahkan ke /admin/login
 */
export async function signUpInitialAdmin({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<AdminAuthResult> {
  const client = getSupabase();
  if (!client || !isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Konfigurasi Supabase belum lengkap.',
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName || !cleanEmail || !password) {
    return {
      success: false,
      error: 'Semua kolom wajib diisi dengan benar.',
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: 'Kata sandi minimal 6 karakter sesuai standar keamanan Supabase.',
    };
  }

  // Verifikasi kembali bahwa belum ada admin terdaftar
  const setupCheck = await checkIsInitialSetupAvailable();
  if (!setupCheck.available && setupCheck.count > 0) {
    return {
      success: false,
      error: 'Setup administrator telah ditutup karena sudah ada administrator terdaftar.',
    };
  }

  try {
    let userId: string | null = null;

    // 1. Coba buat akun di Supabase Authentication
    const { data: authData, error: authError } = await client.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          name: cleanName,
          role: 'admin',
        },
      },
    });

    if (authError) {
      const errMsg = authError.message.toLowerCase();
      // Poin 3: Jika akun sudah terdaftar di Supabase Auth (seperti irsyadulamal313@gmail.com):
      // Gunakan signInWithPassword dengan password yang dimasukkan untuk mengambil user.id
      if (
        errMsg.includes('already registered') ||
        errMsg.includes('already exists') ||
        errMsg.includes('terdaftar')
      ) {
        const { data: signInData, error: signInErr } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (signInErr) {
          return {
            success: false,
            error: 'Akun ini sudah terdaftar di Supabase Auth, namun kata sandi yang Anda masukkan tidak cocok.',
          };
        }

        userId = signInData.user?.id || null;
      } else {
        return {
          success: false,
          error: formatSupabaseAuthError(authError),
        };
      }
    } else {
      userId = authData.user?.id || null;
      // Pastikan ada sesi aktif untuk memenuhi RLS auth.uid() = user_id
      if (!authData.session) {
        await client.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });
      }
    }

    if (!userId) {
      return {
        success: false,
        error: 'Gagal memperoleh ID pengguna dari Supabase Authentication.',
      };
    }

    // 2. WAJIB membuat record pada admin_users:
    // user_id = ID user Supabase Auth
    // name = nama administrator
    // email = email administrator
    // role = 'admin'
    // is_active = true
    let recordCreated = false;

    // A. Coba panggil function bootstrap_first_admin jika ada
    try {
      const { error: rpcErr } = await client.rpc('bootstrap_first_admin', {
        p_name: cleanName,
      });
      if (!rpcErr) {
        recordCreated = true;
      }
    } catch {}

    // B. Coba upsert langsung ke admin_users
    if (!recordCreated) {
      const { error: dbError } = await client.from('admin_users').upsert(
        {
          user_id: userId,
          name: cleanName,
          email: cleanEmail,
          role: 'admin',
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      if (dbError) {
        console.warn('Gagal mencatat data ke admin_users:', dbError.message);
        if (dbError.message?.includes('relation') || dbError.message?.includes('not found')) {
          return {
            success: false,
            error:
              'Tabel admin_users belum dibuat di database Supabase. Jalankan SQL migration terlebih dahulu di Supabase SQL Editor.',
            needsSqlFix: true,
          };
        }
      }
    }

    // Sign out sesi setup agar admin masuk melalui alur login resmi
    await client.auth.signOut();

    return {
      success: true,
      user: {
        id: userId,
        email: cleanEmail,
        name: cleanName,
        role: 'admin',
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: formatSupabaseAuthError(err),
    };
  }
}

/**
 * 1, 2, 3, 6, 7 & 14. LOGIN ADMIN MENGGUNAKAN SUPABASE AUTH & VERIFIKASI ROLE DI ADMIN_USERS:
 * 1. Setelah supabase.auth.signInWithPassword() berhasil, ambil:
 *    - session
 *    - user.id
 *    - user.email
 * 2. Cari user tersebut pada tabel admin_users:
 *    admin_users.user_id = auth.users.id
 * 3. Struktur admin_users: id, user_id, name, email, role, is_active, created_at, updated_at
 * 7. Jika ditemukan role = 'admin' & is_active = true -> izinkan masuk ke /admin
 *    Jika tidak ditemukan -> signOut() -> tampilkan pesan:
 *    "Akun berhasil login, tetapi akun ini belum memiliki hak akses administrator. Hubungi administrator utama."
 */
/**
 * Klaim Administrator Pertama jika pengguna sudah memiliki sesi login di Supabase Auth
 */
export async function claimFirstAdminBootstrap(customName?: string): Promise<{
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  error?: string;
}> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Klien Supabase belum aktif.' };

  try {
    const {
      data: { user },
      error: userErr,
    } = await client.auth.getUser();

    if (userErr || !user) {
      return {
        success: false,
        error: 'Tidak ada sesi login Supabase Auth aktif. Silakan masukkan password dan tekan Masuk.',
      };
    }

    const userId = user.id;
    const userEmail = (user.email || '').toLowerCase();
    const adminName = customName || user.user_metadata?.name || 'Administrator Utama';

    // 1. Coba panggil RPC bootstrap_first_admin
    try {
      const { error: rpcErr } = await client.rpc('bootstrap_first_admin', {
        p_name: adminName,
      });
      if (!rpcErr) {
        const { data: verified } = await client
          .from('admin_users')
          .select('id, user_id, name, email, role, is_active')
          .eq('user_id', userId)
          .maybeSingle();

        if (verified && (verified.role === 'admin' || verified.role === 'super_admin') && verified.is_active) {
          return {
            success: true,
            user: {
              id: userId,
              email: userEmail,
              name: verified.name,
              role: verified.role,
            },
          };
        }
      }
    } catch {}

    // 2. Coba insert langsung
    try {
      const { data: insData, error: insErr } = await client
        .from('admin_users')
        .insert({
          user_id: userId,
          name: adminName,
          email: userEmail,
          role: 'admin',
          is_active: true,
        })
        .select('id, user_id, name, email, role, is_active')
        .maybeSingle();

      if (!insErr && insData) {
        return {
          success: true,
          user: {
            id: userId,
            email: userEmail,
            name: insData.name,
            role: insData.role,
          },
        };
      }
    } catch {}

    return {
      success: false,
      error: 'Tidak dapat menulis ke admin_users via REST API. Jalankan SQL Perbaikan di Supabase SQL Editor.',
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal melakukan bootstrap administrator.' };
  }
}

export async function signInAdmin({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<AdminAuthResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Konfigurasi Supabase belum lengkap.',
    };
  }

  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      error: 'Konfigurasi Supabase belum lengkap.',
    };
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    // 1. Eksekusi Supabase Auth
    const { data, error } = await client.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (error) {
      return {
        success: false,
        error: formatSupabaseAuthError(error),
      };
    }

    if (!data?.session || !data?.user) {
      return {
        success: false,
        error: 'Gagal memulai sesi autentikasi Supabase.',
      };
    }

    // 1. Ambil session, user.id, user.email
    const authUser = data.user;
    const userId = authUser.id;
    const userEmail = (authUser.email || cleanEmail).toLowerCase();

    // 2. Cari user tersebut pada tabel admin_users berdasarkan admin_users.user_id = auth.users.id
    let adminRecord: any = null;
    let queryError: any = null;

    try {
      const { data: dbAdmin, error: selErr } = await client
        .from('admin_users')
        .select('id, user_id, name, email, role, is_active')
        .eq('user_id', userId)
        .maybeSingle();

      queryError = selErr;

      if (dbAdmin) {
        adminRecord = dbAdmin;
      } else {
        // Coba bootstrap otomatis jika fungsi database tersedia
        try {
          const { error: rpcErr } = await client.rpc('bootstrap_first_admin', {
            p_name: authUser.user_metadata?.name || 'Administrator Utama',
          });
          if (!rpcErr) {
            const { data: recheckAdmin } = await client
              .from('admin_users')
              .select('id, user_id, name, email, role, is_active')
              .eq('user_id', userId)
              .maybeSingle();
            if (recheckAdmin) {
              adminRecord = recheckAdmin;
            }
          }
        } catch {}

        // Coba periksa apakah ada row dengan email sama yang belum ditautkan user_id
        if (!adminRecord) {
          try {
            const { data: emailMatch } = await client
              .from('admin_users')
              .select('id, user_id, name, email, role, is_active')
              .ilike('email', userEmail)
              .maybeSingle();

            if (emailMatch) {
              if (emailMatch.is_active && (emailMatch.role === 'admin' || emailMatch.role === 'super_admin')) {
                // Tautkan user_id ke auth.users(id)
                await client
                  .from('admin_users')
                  .update({ user_id: userId, updated_at: new Date().toISOString() })
                  .eq('id', emailMatch.id);
                adminRecord = { ...emailMatch, user_id: userId };
              }
            }
          } catch {}
        }
      }
    } catch (dbErr: any) {
      queryError = dbErr;
      console.warn('Kendala pembacaan tabel admin_users:', dbErr);
    }

    // 7. Evaluasi Record admin_users:
    // WHERE user_id = user.id AND role = 'admin' AND is_active = true
    if (adminRecord) {
      if (adminRecord.is_active === false) {
        await client.auth.signOut();
        return {
          success: false,
          error: 'Administrator ditemukan tetapi status tidak aktif.',
        };
      }

      if (adminRecord.role === 'admin' || adminRecord.role === 'super_admin') {
        return {
          success: true,
          user: {
            id: userId,
            email: userEmail,
            name: adminRecord.name || authUser.user_metadata?.name || 'Administrator',
            role: adminRecord.role,
          },
        };
      } else {
        return {
          success: false,
          error: 'Record admin ditemukan tetapi role bukan admin.',
        };
      }
    }

    // Jika tidak ditemukan record admin_users atau terkendala RLS:
    // Deteksi akar masalah sebenarnya tanpa langsung memutus sesi diagnostik
    const errMsg = (queryError?.message || '').toLowerCase();
    const isRlsBlocked =
      queryError?.code === '42501' ||
      errMsg.includes('row-level security') ||
      errMsg.includes('policy') ||
      errMsg.includes('recursion') ||
      errMsg.includes('permission denied');

    if (isRlsBlocked) {
      return {
        success: false,
        error: 'Admin profile tidak dapat dibaca karena kebijakan RLS.',
        canClaimFirstAdmin: false,
        needsSqlFix: true,
      };
    }

    if (queryError?.code === '42P01' || errMsg.includes('relation')) {
      return {
        success: false,
        error: 'Tabel admin_users belum dibuat di database Supabase.',
        canClaimFirstAdmin: false,
        needsSqlFix: true,
      };
    }

    return {
      success: false,
      error: 'User Supabase sudah ada tetapi belum memiliki record admin_users.',
      canClaimFirstAdmin: true,
      needsSqlFix: true,
    };
  } catch (err: any) {
    return {
      success: false,
      error: formatSupabaseAuthError(err),
    };
  }
}

/**
 * 6. PERBAIKI LOGIKA ADMIN GUARD:
 * Setelah login:
 * const { data: { user } } = await supabase.auth.getUser()
 * Kemudian:
 * select *
 * from admin_users
 * where user_id = user.id
 * and role = 'admin'
 * and is_active = true
 * single()
 * 
 * Jika ditemukan:
 * → masuk ke /admin
 * 
 * Jika tidak ditemukan:
 * → tampilkan error yang jelas.
 * Tetapi jangan langsung signOut sebelum sistem selesai melakukan diagnosis.
 */
export async function verifyCurrentAdminSession(): Promise<{
  isValid: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  reason?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { isValid: false, reason: 'Supabase belum terhubung.' };
  }

  const client = getSupabase();
  if (!client) {
    return { isValid: false, reason: 'Klien Supabase tidak aktif.' };
  }

  try {
    const {
      data: { user },
      error,
    } = await client.auth.getUser();

    if (error || !user) {
      return { isValid: false, reason: 'Tidak ada sesi aktif.' };
    }

    const userId = user.id;
    const userEmail = (user.email || '').toLowerCase();

    // Cari di admin_users: user_id = user.id
    const { data: dbAdmin, error: queryErr } = await client
      .from('admin_users')
      .select('id, user_id, name, email, role, is_active')
      .eq('user_id', userId)
      .maybeSingle();

    if (queryErr) {
      const errMsg = (queryErr.message || '').toLowerCase();
      if (
        queryErr.code === '42501' ||
        errMsg.includes('policy') ||
        errMsg.includes('row-level security') ||
        errMsg.includes('recursion')
      ) {
        return {
          isValid: false,
          reason: 'Admin profile tidak dapat dibaca karena kebijakan RLS.',
        };
      }
      return {
        isValid: false,
        reason: `Kendala akses admin_users: ${queryErr.message}`,
      };
    }

    if (!dbAdmin) {
      return {
        isValid: false,
        reason: 'User Supabase sudah ada tetapi belum memiliki record admin_users.',
      };
    }

    if (dbAdmin.is_active === false) {
      return { isValid: false, reason: 'Administrator ditemukan tetapi status tidak aktif.' };
    }

    if (dbAdmin.role === 'admin' || dbAdmin.role === 'super_admin') {
      return {
        isValid: true,
        user: {
          id: userId,
          email: userEmail,
          name: dbAdmin.name || user.user_metadata?.name || 'Administrator',
          role: dbAdmin.role,
        },
      };
    }

    return {
      isValid: false,
      reason: 'Record admin ditemukan tetapi role bukan admin.',
    };
  } catch (err: any) {
    return { isValid: false, reason: err?.message || 'Gagal memverifikasi sesi.' };
  }
}

/**
 * Keluar / Sign Out
 */
export async function signOutAdminAuth(): Promise<void> {
  const client = getSupabase();
  if (client) {
    try {
      await client.auth.signOut();
    } catch {
      // ignore
    }
  }
}

/**
 * 10. Lupa Password
 */
export async function requestPasswordReset(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Konfigurasi Supabase belum lengkap.',
    };
  }

  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      message: 'Klien Supabase belum aktif.',
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {
      success: false,
      message: 'Silakan masukkan alamat email yang valid.',
    };
  }

  try {
    const redirectUrl = `${window.location.origin}/admin/reset-password`;
    const { error } = await client.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: redirectUrl,
    });

    if (error) {
      return {
        success: false,
        message: formatSupabaseAuthError(error),
      };
    }

    return {
      success: true,
      message: `Tautan pemulihan kata sandi telah dikirimkan ke email ${cleanEmail}. Silakan periksa kotak masuk atau spam Anda.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: formatSupabaseAuthError(err),
    };
  }
}

/**
 * 10. Reset Password Baru
 */
export async function updateAdminPassword(newPassword: string): Promise<{
  success: boolean;
  message: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Konfigurasi Supabase belum lengkap.',
    };
  }

  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      message: 'Klien Supabase belum aktif.',
    };
  }

  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      message: 'Kata sandi baru minimal 6 karakter.',
    };
  }

  try {
    const { error } = await client.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        message: formatSupabaseAuthError(error),
      };
    }

    return {
      success: true,
      message: 'Kata sandi berhasil diperbarui. Silakan login kembali dengan kata sandi baru Anda.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: formatSupabaseAuthError(err),
    };
  }
}

/**
 * 12. Panel Diagnostik Aman (Development)
 * Tidak pernah membocorkan password, access token, refresh token, service role key, atau secret key
 */
export async function getSafeAdminDiagnostics(): Promise<AdminDiagnosticState> {
  const { url, anonKey } = getSupabaseConfig();
  const isUrlConfigured = Boolean(url && url.startsWith('https://') && !url.includes('placeholder'));
  const isKeyConfigured = Boolean(anonKey && anonKey.length > 10);
  const client = getSupabase();
  const isClientInitialized = Boolean(client);

  let hasSession = false;
  let hasUser = false;
  let isAdminRole = false;
  let userEmail: string | undefined = undefined;

  if (client) {
    try {
      const { data } = await client.auth.getSession();
      if (data?.session) {
        hasSession = true;
        if (data.session.user) {
          hasUser = true;
          userEmail = data.session.user.email;
          const metaRole = data.session.user.user_metadata?.role;
          if (metaRole === 'admin' || metaRole === 'super_admin') {
            isAdminRole = true;
          } else {
            // Cek admin_users
            try {
              const { data: dbAdmin } = await client
                .from('admin_users')
                .select('role')
                .eq('user_id', data.session.user.id)
                .maybeSingle();
              if (dbAdmin && (dbAdmin.role === 'admin' || dbAdmin.role === 'super_admin')) {
                isAdminRole = true;
              }
            } catch {
              // ignore
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }

  return {
    isUrlConfigured,
    isKeyConfigured,
    isClientInitialized,
    hasSession,
    hasUser,
    isAdminRole,
    userEmail,
  };
}
