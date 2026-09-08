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
  if (!error) return 'Email atau password salah.';

  const message = String(error.message || '').toLowerCase();
  const name = String(error.name || '').toLowerCase();

  // Gangguan koneksi atau jaringan
  if (
    message.includes('failed to fetch') ||
    message.includes('network error') ||
    name.includes('authretryablefetcherror') ||
    message.includes('connection refused')
  ) {
    return 'Tidak dapat terhubung ke Supabase.';
  }

  // Konfigurasi Supabase
  if (
    message.includes('configuration error') ||
    message.includes('anon key') ||
    message.includes('supabase url')
  ) {
    return 'Konfigurasi Supabase belum lengkap.';
  }

  // Pesan error autentikasi umum (aman, tidak membocorkan keberadaan email)
  return 'Email atau password salah.';
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
    // 1. Cek pada tabel admin_users berdasarkan email
    const { data: adminRecord, error: queryErr } = await client
      .from('admin_users')
      .select('user_id, email, role, is_active')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (queryErr) {
      return {
        ok: false,
        registered: false,
        isActive: false,
        message: 'Gagal mengakses tabel admin_users di Supabase.',
      };
    }

    if (adminRecord) {
      const isRoleAdmin = String(adminRecord.role || '').toLowerCase() === 'admin' ||
                          String(adminRecord.role || '').toLowerCase() === 'super_admin';
      const isStatusActive = adminRecord.is_active === true;

      if (!isRoleAdmin) {
        return {
          ok: true,
          registered: true,
          isActive: isStatusActive,
          message: 'Akun ini bukan administrator.',
        };
      }

      if (!isStatusActive) {
        return {
          ok: true,
          registered: true,
          isActive: false,
          message: 'Akun administrator sedang tidak aktif.',
        };
      }

      return {
        ok: true,
        registered: true,
        isActive: true,
        message: 'Akun terdaftar sebagai administrator aktif. Autentikasi Supabase siap digunakan.',
      };
    }

    // 2. Jika tidak ditemukan di admin_users
    return {
      ok: true,
      registered: false,
      isActive: false,
      message: 'Akun berhasil login, tetapi belum memiliki hak akses administrator.',
    };
  } catch {
    return {
      ok: false,
      registered: false,
      isActive: false,
      message: 'Terjadi kendala saat memeriksa status akun di database.',
    };
  }
}

/**
 * 4. PANEL DIAGNOSTIK LOGIN (SESUAI SPESIFIKASI PERSIS)
 * Panel hanya menampilkan:
 * - Supabase: TERHUBUNG / TIDAK TERHUBUNG
 * - Auth User: DITEMUKAN / TIDAK DITEMUKAN
 * - Login: BERHASIL / GAGAL
 * - Admin Profile: DITEMUKAN / TIDAK DITEMUKAN
 * - Role: ADMIN / BUKAN ADMIN
 * - Status: AKTIF / TIDAK AKTIF
 * 
 * JANGAN PERNAH MENAMPILKAN:
 * password, anon key, service role key, secret key, access token, refresh token
 */
export interface AdminLoginDiagnosticPanel {
  supabase: 'TERHUBUNG' | 'TIDAK TERHUBUNG';
  authUser: 'DITEMUKAN' | 'TIDAK DITEMUKAN';
  login: 'BERHASIL' | 'GAGAL';
  adminProfile: 'DITEMUKAN' | 'TIDAK DITEMUKAN';
  role: 'ADMIN' | 'BUKAN ADMIN';
  status: 'AKTIF' | 'TIDAK AKTIF';
}

export async function getAdminLoginDiagnostics(targetEmail?: string): Promise<AdminLoginDiagnosticPanel> {
  const conn = await testSupabaseConnection();
  if (!conn.isConnected) {
    return {
      supabase: 'TIDAK TERHUBUNG',
      authUser: 'TIDAK DITEMUKAN',
      login: 'GAGAL',
      adminProfile: 'TIDAK DITEMUKAN',
      role: 'BUKAN ADMIN',
      status: 'TIDAK AKTIF',
    };
  }

  const client = getSupabase();
  if (!client) {
    return {
      supabase: 'TIDAK TERHUBUNG',
      authUser: 'TIDAK DITEMUKAN',
      login: 'GAGAL',
      adminProfile: 'TIDAK DITEMUKAN',
      role: 'BUKAN ADMIN',
      status: 'TIDAK AKTIF',
    };
  }

  let authUser: 'DITEMUKAN' | 'TIDAK DITEMUKAN' = 'TIDAK DITEMUKAN';
  let login: 'BERHASIL' | 'GAGAL' = 'GAGAL';
  let adminProfile: 'DITEMUKAN' | 'TIDAK DITEMUKAN' = 'TIDAK DITEMUKAN';
  let role: 'ADMIN' | 'BUKAN ADMIN' = 'BUKAN ADMIN';
  let status: 'AKTIF' | 'TIDAK AKTIF' = 'TIDAK AKTIF';

  try {
    const { data: sessionData } = await client.auth.getSession();
    const currentSessionUser = sessionData?.session?.user;

    if (currentSessionUser) {
      authUser = 'DITEMUKAN';
      login = 'BERHASIL';

      const { data: profile } = await client
        .from('admin_users')
        .select('user_id, role, is_active')
        .eq('user_id', currentSessionUser.id)
        .maybeSingle();

      if (profile) {
        adminProfile = 'DITEMUKAN';
        const roleVal = String(profile.role || '').toLowerCase();
        if (roleVal === 'admin' || roleVal === 'super_admin') {
          role = 'ADMIN';
        }
        if (profile.is_active === true) {
          status = 'AKTIF';
        }
      }
    } else if (targetEmail && targetEmail.includes('@')) {
      const clean = targetEmail.trim().toLowerCase();
      const { data: profile } = await client
        .from('admin_users')
        .select('user_id, email, role, is_active')
        .ilike('email', clean)
        .maybeSingle();

      if (profile) {
        if (profile.user_id) {
          authUser = 'DITEMUKAN';
        }
        adminProfile = 'DITEMUKAN';
        const roleVal = String(profile.role || '').toLowerCase();
        if (roleVal === 'admin' || roleVal === 'super_admin') {
          role = 'ADMIN';
        }
        if (profile.is_active === true) {
          status = 'AKTIF';
        }
      }
    }
  } catch {}

  return {
    supabase: 'TERHUBUNG',
    authUser,
    login,
    adminProfile,
    role,
    status,
  };
}

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

  // 3. Periksa tabel admin_users
  try {
    let query = client
      .from('admin_users')
      .select('user_id, name, email, role, is_active');

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
        notes = 'Admin profile tidak dapat dibaca karena kebijakan RLS. Periksa konfigurasi RLS di Supabase.';
      } else if (errMsg.includes('relation') || queryErr.code === '42P01') {
        rlsQueryStatus = 'DITOLAK';
        adminProfile = 'TIDAK DITEMUKAN';
        notes = 'Tabel admin_users belum dibuat di database Supabase.';
      } else {
        rlsQueryStatus = 'DITOLAK';
        adminProfile = 'TIDAK DITEMUKAN';
        notes = `Query database mengalami kendala: ${queryErr.message}`;
      }
    } else if (!dbAdmin) {
      rlsQueryStatus = 'BERHASIL';
      adminProfile = 'TIDAK DITEMUKAN';
      notes = 'Akun belum memiliki hak akses administrator.';
      canClaimFirstAdmin = true;
    } else {
      rlsQueryStatus = 'BERHASIL';
      adminProfile = 'DITEMUKAN';
      const isRoleAdmin = String(dbAdmin.role || '').toLowerCase() === 'admin' ||
                          String(dbAdmin.role || '').toLowerCase() === 'super_admin';
      const isStatusActive = dbAdmin.is_active === true;

      roleStatus = isRoleAdmin ? 'ADMIN' : 'BUKAN ADMIN';
      activeStatus = isStatusActive ? 'AKTIF' : 'TIDAK AKTIF';

      if (!isRoleAdmin) {
        notes = 'Akun ini bukan administrator.';
      } else if (!isStatusActive) {
        notes = 'Akun administrator sedang tidak aktif.';
      } else {
        notes = 'Profil administrator valid dan aktif. Akun berhak mengakses /admin.';
      }
    }
  } catch (err: any) {
    rlsQueryStatus = 'DITOLAK';
    adminProfile = 'TIDAK DITEMUKAN';
    notes = 'Admin profile tidak dapat dibaca karena kendala akses database.';
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
      .select('user_id', { count: 'exact', head: true });

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
          .select('user_id, name, email, role, is_active')
          .eq('user_id', userId)
          .maybeSingle();

        if (
          verified &&
          (String(verified.role || '').toLowerCase() === 'admin' ||
            String(verified.role || '').toLowerCase() === 'super_admin') &&
          verified.is_active === true
        ) {
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
        .select('user_id, name, email, role, is_active')
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
      error: 'Tidak dapat menulis ke admin_users via REST API. Pastikan struktur tabel admin_users sesuai.',
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
    // 1. User login menggunakan: supabase.auth.signInWithPassword({ email, password })
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (authError) {
      // 10. Jika email/password salah: tampilkan: "Email atau password salah."
      return {
        success: false,
        error: formatSupabaseAuthError(authError),
      };
    }

    // 2. Jika login berhasil, ambil: supabase.auth.getUser()
    const { data: userData, error: userError } = await client.auth.getUser();
    const authUser = userData?.user || authData?.user;

    if (userError || !authUser || !authUser.id) {
      await client.auth.signOut();
      return {
        success: false,
        error: 'Gagal memverifikasi pengguna terautentikasi.',
      };
    }

    // 3. Ambil user.id dari authenticated Supabase user
    const userId = authUser.id;
    const userEmail = (authUser.email || cleanEmail).toLowerCase();

    // 4. Cari data admin_users berdasarkan: admin_users.user_id = authenticated user.id
    const { data: adminRecord, error: queryErr } = await client
      .from('admin_users')
      .select('user_id, name, email, role, is_active')
      .eq('user_id', userId)
      .maybeSingle();

    if (queryErr) {
      await client.auth.signOut();
      return {
        success: false,
        error: `Gagal membaca profil administrator: ${queryErr.message}`,
      };
    }

    // 7. Jika tidak ditemukan: tampilkan pesan:
    // "Akun berhasil login, tetapi belum memiliki hak akses administrator."
    if (!adminRecord) {
      await client.auth.signOut();
      return {
        success: false,
        error: 'Akun berhasil login, tetapi belum memiliki hak akses administrator.',
      };
    }

    // 5 & 8. Validasi: role harus bernilai "admin" secara case-insensitive.
    // Jika role bukan admin: tampilkan: "Akun ini bukan administrator."
    const roleVal = String(adminRecord.role || '').toLowerCase();
    if (roleVal !== 'admin' && roleVal !== 'super_admin') {
      await client.auth.signOut();
      return {
        success: false,
        error: 'Akun ini bukan administrator.',
      };
    }

    // 5 & 9. Validasi: is_active harus bernilai true.
    // Jika is_active false: tampilkan: "Akun administrator sedang tidak aktif."
    if (adminRecord.is_active !== true) {
      await client.auth.signOut();
      return {
        success: false,
        error: 'Akun administrator sedang tidak aktif.',
      };
    }

    // 6. Jika valid: izinkan masuk ke Dashboard Admin
    return {
      success: true,
      user: {
        id: userId,
        email: userEmail,
        name: adminRecord.name || authUser.user_metadata?.name || 'Administrator',
        role: adminRecord.role || 'admin',
      },
    };
  } catch (err: any) {
    try {
      await client.auth.signOut();
    } catch {}
    return {
      success: false,
      error: formatSupabaseAuthError(err),
    };
  }
}

/**
 * 6. LOGIKA ADMIN GUARD:
 * Memverifikasi sesi aktif dan memastikan user terdaftar di admin_users dengan role admin dan is_active true
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

    if (error || !user || !user.id) {
      return { isValid: false, reason: 'Tidak ada sesi aktif.' };
    }

    const userId = user.id;
    const userEmail = (user.email || '').toLowerCase();

    // Cari di admin_users: user_id = user.id
    const { data: dbAdmin, error: queryErr } = await client
      .from('admin_users')
      .select('user_id, name, email, role, is_active')
      .eq('user_id', userId)
      .maybeSingle();

    if (queryErr) {
      return {
        isValid: false,
        reason: `Kendala akses admin_users: ${queryErr.message}`,
      };
    }

    // 7. Jika tidak ditemukan
    if (!dbAdmin) {
      return {
        isValid: false,
        reason: 'Akun berhasil login, tetapi belum memiliki hak akses administrator.',
      };
    }

    // 8. Role harus bernilai "admin" secara case-insensitive
    const roleVal = String(dbAdmin.role || '').toLowerCase();
    if (roleVal !== 'admin' && roleVal !== 'super_admin') {
      return {
        isValid: false,
        reason: 'Akun ini bukan administrator.',
      };
    }

    // 9. is_active harus bernilai true
    if (dbAdmin.is_active !== true) {
      return {
        isValid: false,
        reason: 'Akun administrator sedang tidak aktif.',
      };
    }

    return {
      isValid: true,
      user: {
        id: userId,
        email: userEmail,
        name: dbAdmin.name || user.user_metadata?.name || 'Administrator',
        role: dbAdmin.role || 'admin',
      },
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

export const PRODUCTION_RESET_PASSWORD_URL = 'https://irsyadul-amal.vercel.app/reset-password';

/**
 * 10. Lupa Password
 * Mengirim email pemulihan via Supabase Auth dengan redirectTo: https://irsyadul-amal.vercel.app/reset-password
 * Tidak pernah mengarahkan ke http://localhost:3000
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
    // Sesuai ketentuan nomor 3 & 6:
    // Gunakan redirectTo: https://irsyadul-amal.vercel.app/reset-password
    // Jangan mengarahkan ke http://localhost:3000
    const redirectUrl = PRODUCTION_RESET_PASSWORD_URL;
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
      message: `Tautan instruksi reset password telah dikirim ke ${cleanEmail}. Silakan periksa kotak masuk atau spam email Anda.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: formatSupabaseAuthError(err),
    };
  }
}

/**
 * 11. Reset Password Baru
 * Menggunakan supabase.auth.updateUser({ password: newPassword })
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

  const cleanPassword = (newPassword || '').trim();
  if (!cleanPassword) {
    return {
      success: false,
      message: 'Password baru tidak boleh kosong.',
    };
  }

  if (cleanPassword.length < 6) {
    return {
      success: false,
      message: 'Password baru minimal 6 karakter sesuai standar keamanan Supabase.',
    };
  }

  try {
    const { error } = await client.auth.updateUser({
      password: cleanPassword,
    });

    if (error) {
      return {
        success: false,
        message: formatSupabaseAuthError(error),
      };
    }

    // Keluar dari sesi recovery agar pengguna dapat login bersih dengan kredensial baru
    try {
      await client.auth.signOut();
    } catch {}

    return {
      success: true,
      message: 'Password baru berhasil disimpan! Silakan masuk kembali dengan password baru Anda.',
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
              if (
                dbAdmin &&
                (String(dbAdmin.role || '').toLowerCase() === 'admin' ||
                  String(dbAdmin.role || '').toLowerCase() === 'super_admin')
              ) {
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
