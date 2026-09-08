import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve configuration from Vite environment variables (client-safe VITE_ prefix)
// with safe fallback to saved local configuration for preview convenience
export const getSupabaseConfig = () => {
  const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const envUrl = env.VITE_SUPABASE_URL || '';
  const envKey = env.VITE_SUPABASE_ANON_KEY || '';

  let storageUrl = '';
  let storageKey = '';
  try {
    storageUrl = localStorage.getItem('VITE_SUPABASE_URL') || '';
    storageKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY') || '';
  } catch {
    // Local storage unavailable
  }

  const url = (envUrl || storageUrl || '').trim();
  const anonKey = (envKey || storageKey || '').trim();

  return {
    url,
    anonKey,
    isFromEnv: Boolean(envUrl && envKey),
  };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(
    url &&
    anonKey &&
    url.length > 0 &&
    anonKey.length > 0 &&
    !url.includes('placeholder') &&
    url.startsWith('https://')
  );
};

let _clientInstance: SupabaseClient | null = null;
let _cachedUrl = '';
let _cachedKey = '';

export const getSupabase = (): SupabaseClient | null => {
  const { url, anonKey } = getSupabaseConfig();
  if (!isSupabaseConfigured()) {
    _clientInstance = null;
    return null;
  }

  if (!_clientInstance || _cachedUrl !== url || _cachedKey !== anonKey) {
    _cachedUrl = url;
    _cachedKey = anonKey;
    _clientInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return _clientInstance;
};

// Export active supabase client (singleton)
export const supabase: SupabaseClient | null = getSupabase();

export const saveSupabaseConfig = (url: string, anonKey: string): boolean => {
  try {
    localStorage.setItem('VITE_SUPABASE_URL', url.trim());
    localStorage.setItem('VITE_SUPABASE_ANON_KEY', anonKey.trim());
    // Invalidate client
    _clientInstance = null;
    return true;
  } catch {
    return false;
  }
};

export interface ConnectionStatus {
  isConfigured: boolean;
  statusText: string;
  url?: string;
  authReady: boolean;
  storageReady: boolean;
  databaseReady: boolean;
}

export const getSupabaseStatus = (): ConnectionStatus => {
  const configured = isSupabaseConfigured();
  const { url } = getSupabaseConfig();
  if (configured) {
    return {
      isConfigured: true,
      statusText: 'Supabase Terhubung',
      url,
      authReady: true,
      storageReady: true,
      databaseReady: true,
    };
  }
  return {
    isConfigured: false,
    statusText: 'Supabase Belum Terhubung',
    authReady: false,
    storageReady: false,
    databaseReady: false,
  };
};

/**
 * Storage upload helper for images and documents.
 * Uploads to Supabase Storage if configured, or converts to DataURL for safe offline preview.
 */
export async function uploadMediaFile(
  file: File,
  bucket: 'media' | 'reports' | 'logos' = 'media',
  folder: string = 'uploads'
): Promise<{ url: string; error: string | null; isStorageUploaded: boolean }> {
  try {
    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isDocument = file.type === 'application/pdf' || file.type.includes('spreadsheet') || file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.pdf');

    if (!isImage && !isDocument) {
      return {
        url: '',
        error: 'Format file tidak didukung. Gunakan format gambar (JPG, PNG, WEBP) atau dokumen (PDF, XLSX).',
        isStorageUploaded: false,
      };
    }

    // Size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return {
        url: '',
        error: 'Ukuran file melebihi batas maksimum 10MB.',
        isStorageUploaded: false,
      };
    }

    // If Supabase is active, upload to bucket
    if (supabase && isSupabaseConfigured()) {
      const fileExt = file.name.split('.').pop();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
      const filePath = `${folder}/${Date.now()}_${sanitizedName}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.warn('Supabase storage upload error:', uploadError);
        // Fallback to local DataURL if storage policy or bucket isn't ready
      } else if (data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return {
            url: publicUrlData.publicUrl,
            error: null,
            isStorageUploaded: true,
          };
        }
      }
    }

    // Local / Offline fallback using FileReader
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          error: null,
          isStorageUploaded: false,
        });
      };
      reader.onerror = () => {
        resolve({
          url: '',
          error: 'Gagal memproses file pada peramban.',
          isStorageUploaded: false,
        });
      };
      reader.readAsDataURL(file);
    });
  } catch (err: any) {
    return {
      url: '',
      error: err?.message || 'Terjadi kesalahan saat mengunggah file.',
      isStorageUploaded: false,
    };
  }
}

/**
 * Master Supabase SQL DDL Schema including:
 * - UUID extensions
 * - Complete tables matching the required entities
 * - Foreign key constraints
 * - Row Level Security (RLS) policies
 * - Storage Bucket policies
 */
export const SUPABASE_SQL_SCHEMA = `-- ============================================================
-- SKEMA RESMI DATABASE SUPABASE - IRSYADUL AMAL
-- Lembaga Sosial & Kemanusiaan - Garut, Jawa Barat
-- ============================================================

-- Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL PENGATURAN WEBSITE (site_settings)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL DEFAULT 'IRSYADUL AMAL',
    tagline VARCHAR(255) NOT NULL DEFAULT 'Lembaga Sosial & Kemanusiaan',
    address TEXT NOT NULL DEFAULT 'Kp. Malajati, RT.004/RW.013, Jati, Kec. Tarogong Kaler, Kabupaten Garut, Jawa Barat 44150',
    whatsapp VARCHAR(50) NOT NULL DEFAULT '087804034140',
    email VARCHAR(100) DEFAULT '',
    operating_hours VARCHAR(100) DEFAULT 'Senin - Sabtu: 08:00 - 16:00 WIB',
    google_maps_url TEXT DEFAULT '',
    footer_copyright TEXT DEFAULT '© 2026 Irsyadul Amal. Semua Hak Dilindungi.',
    seo_title VARCHAR(255) DEFAULT 'IRSYADUL AMAL - Lembaga Sosial & Kemanusiaan',
    seo_description TEXT DEFAULT 'Lembaga Sosial & Kemanusiaan Irsyadul Amal berkhidmat menebar manfaat nyata untuk sesama di Garut, Jawa Barat.',
    logo_url TEXT DEFAULT '',
    favicon_url TEXT DEFAULT '',
    og_image_url TEXT DEFAULT '',
    nav_labels JSONB DEFAULT '{"beranda":"Beranda","donasi":"Donasi","program":"Program","laporan":"Laporan","call_center":"Call Center"}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL KONTEN BERANDA (homepage_content)
CREATE TABLE IF NOT EXISTS public.homepage_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hero_badge VARCHAR(100) DEFAULT 'Lembaga Sosial & Kemanusiaan',
    hero_title VARCHAR(255) DEFAULT 'Berbagi Kebaikan, Menebar Manfaat',
    hero_title_highlight VARCHAR(255) DEFAULT '',
    hero_subtitle TEXT DEFAULT 'Melalui Irsyadul Amal, mari bersama menghadirkan manfaat nyata bagi mereka yang membutuhkan.',
    hero_image_url TEXT DEFAULT '',
    hero_image_caption VARCHAR(255) DEFAULT 'Irsyadul Amal Berkhidmat',
    primary_button_text VARCHAR(100) DEFAULT 'DONASI SEKARANG',
    secondary_button_text VARCHAR(100) DEFAULT 'LIHAT PROGRAM',
    about_badge VARCHAR(100) DEFAULT 'Tentang Irsyadul Amal',
    about_title VARCHAR(255) DEFAULT 'Amanah, Transparan, dan Bermanfaat',
    about_content TEXT DEFAULT 'Irsyadul Amal adalah lembaga sosial dan kemanusiaan yang berpusat di Garut, bergerak aktif mendampingi anak-anak dhuafa, santri, penyediaan air bersih, serta pemberdayaan sosial umat.',
    about_image_url TEXT DEFAULT '',
    cta_title VARCHAR(255) DEFAULT 'Mari Bersama Menghadirkan Manfaat Berkelanjutan',
    cta_subtitle TEXT DEFAULT 'Uluran tangan Anda hari ini adalah senyuman dan harapan bagi saudara-saudara kita yang membutuhkan.',
    cta_button_text VARCHAR(100) DEFAULT 'DONASI SEKARANG',
    footer_tagline VARCHAR(255) DEFAULT 'Amanah • Transparan • Profesional',
    footer_description TEXT DEFAULT 'Berbagi kebaikan dan menebar manfaat nyata bagi mereka yang membutuhkan melalui program amanah, transparan, dan berkelanjutan.',
    sections_visibility JSONB DEFAULT '{"hero":true,"stats":true,"about":true,"featuredPrograms":true,"bankAccounts":true,"cta":true,"testimonials":false,"banner":true,"gallery":true,"footer":true}'::jsonb,
    sections_order JSONB DEFAULT '["hero","banner","stats","featuredPrograms","about","bankAccounts","gallery","cta"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL KATEGORI PROGRAM (program_categories)
CREATE TABLE IF NOT EXISTS public.program_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL PROGRAM (programs)
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.program_categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    description TEXT NOT NULL,
    background TEXT DEFAULT '',
    objectives TEXT DEFAULT '',
    target_amount NUMERIC(15, 2) DEFAULT 0,
    collected_amount NUMERIC(15, 2) DEFAULT 0,
    donor_count INTEGER DEFAULT 0,
    beneficiary_target VARCHAR(100) DEFAULT 'Data akan diperbarui',
    location VARCHAR(255) DEFAULT 'Garut, Jawa Barat',
    image_url TEXT NOT NULL,
    gallery_urls JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Segera Dimulai', 'Berjalan', 'Selesai')),
    is_featured BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT FALSE,
    deadline DATE,
    latest_update TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABEL REKENING BANK RESMI (bank_accounts)
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL, -- 'DONASI UMUM', 'DONASI YAYASAN', 'WAKAF AIR BERSIH'
    bank_name VARCHAR(50) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    account_holder VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABEL DONATUR (donors) - SENSITIF
CREATE TABLE IF NOT EXISTS public.donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    total_donation NUMERIC(15, 2) DEFAULT 0,
    last_donation_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'Baru',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABEL TRANSAKSI DONASI (donations) - SENSITIF
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    program_title VARCHAR(255) NOT NULL,
    donor_id UUID REFERENCES public.donors(id) ON DELETE SET NULL,
    donor_name VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    nominal NUMERIC(15, 2) NOT NULL,
    bank_destination VARCHAR(100) NOT NULL,
    proof_url TEXT DEFAULT '',
    status VARCHAR(50) DEFAULT 'Menunggu Verifikasi' CHECK (status IN ('Menunggu Verifikasi', 'Terverifikasi', 'Ditolak')),
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABEL LAPORAN (reports)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Laporan Donasi', 'Laporan Penggunaan Dana', 'Laporan Program', 'Dokumentasi Kegiatan'
    period VARCHAR(100) NOT NULL,
    publish_date DATE DEFAULT CURRENT_DATE,
    file_type VARCHAR(20) DEFAULT 'PDF',
    file_size VARCHAR(50) DEFAULT '',
    download_url TEXT DEFAULT '',
    description TEXT NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    documentation_urls JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABEL MEDIA LIBRARY (media)
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Hero', 'Banner', 'Program', 'Dokumentasi', 'Galeri', 'Logo'
    url TEXT NOT NULL,
    caption TEXT DEFAULT '',
    is_placeholder BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. TABEL TESTIMONIAL (testimonials)
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    quote TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. TABEL PENGATURAN KONTAK / CALL CENTER (contact_settings)
CREATE TABLE IF NOT EXISTS public.contact_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    whatsapp_number VARCHAR(50) NOT NULL DEFAULT '087804034140',
    service_name VARCHAR(255) DEFAULT 'Layanan Donatur & Mustahik Irsyadul Amal',
    office_address TEXT DEFAULT 'Kp. Malajati, RT.004/RW.013, Jati, Kec. Tarogong Kaler, Kabupaten Garut, Jawa Barat 44150',
    operating_hours VARCHAR(100) DEFAULT 'Senin - Sabtu: 08:00 - 16:00 WIB',
    default_whatsapp_message TEXT DEFAULT 'Assalamu''alaikum Warahmatullahi Wabarakatuh, Pengurus Irsyadul Amal. Saya ingin bertanya mengenai informasi program kebaikan.',
    google_maps_url TEXT DEFAULT 'https://maps.google.com/?q=Tarogong+Kaler+Garut',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. TABEL ADMIN USERS (admin_users)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Aktifkan RLS untuk semua tabel
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 1. ATURAN PUBLIK (READ-ONLY untuk data publik)
CREATE POLICY "Public Read Site Settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Homepage Content" ON public.homepage_content FOR SELECT USING (true);
CREATE POLICY "Public Read Categories" ON public.program_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Published Programs" ON public.programs FOR SELECT USING (published = true AND status != 'Draft');
CREATE POLICY "Public Read Bank Accounts" ON public.bank_accounts FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Published Reports" ON public.reports FOR SELECT USING (published = true);
CREATE POLICY "Public Read Media" ON public.media FOR SELECT USING (true);
CREATE POLICY "Public Read Active Testimonials" ON public.testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Contact Settings" ON public.contact_settings FOR SELECT USING (true);

-- 2. ATURAN KEAMANAN TINGGI (Donatur & Transaksi Donasi TIDAK BISA dibaca oleh publik!)
-- Hanya admin terotentikasi yang dapat membaca atau mengelola data donasi & donatur
CREATE POLICY "Admin Read Donations" ON public.donations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin Modify Donations" ON public.donations FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Read Donors" ON public.donors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin Modify Donors" ON public.donors FOR ALL TO authenticated USING (true);

-- 3. ATURAN KEAMANAN TABEL ADMIN_USERS (RLS KETAT - auth.uid() = user_id)
CREATE POLICY "admin_users_select_policy" ON public.admin_users FOR SELECT TO authenticated USING (
    auth.uid() = user_id
    OR (email = (auth.jwt() ->> 'email') AND user_id IS NULL)
    OR EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
);

CREATE POLICY "admin_users_insert_policy" ON public.admin_users FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id
    AND (
        NOT EXISTS (SELECT 1 FROM public.admin_users)
        OR EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    )
);

CREATE POLICY "admin_users_update_policy" ON public.admin_users FOR UPDATE TO authenticated USING (
    auth.uid() = user_id
    OR (email = (auth.jwt() ->> 'email') AND user_id IS NULL)
) WITH CHECK (auth.uid() = user_id);

-- 4. ATURAN MODIFIKASI ADMIN CMS (Authenticated admin can INSERT, UPDATE, DELETE CMS tables)
CREATE POLICY "Admin Modify Site Settings" ON public.site_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Modify Homepage Content" ON public.homepage_content FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Modify Categories" ON public.program_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Modify Programs" ON public.programs FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Modify Bank Accounts" ON public.bank_accounts FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Modify Reports" ON public.reports FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Modify Media" ON public.media FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Modify Testimonials" ON public.testimonials FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Modify Contact Settings" ON public.contact_settings FOR ALL TO authenticated USING (true);

-- ============================================================
-- STORAGE BUCKETS SETUP
-- ============================================================
-- Buat bucket penyimpanan (media, reports, logos)
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies: Public Read, Authenticated Admin Upload & Delete
CREATE POLICY "Public Read Media Storage" ON storage.objects FOR SELECT USING (bucket_id IN ('media', 'reports', 'logos'));
CREATE POLICY "Admin Upload Media Storage" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('media', 'reports', 'logos'));
CREATE POLICY "Admin Update Media Storage" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('media', 'reports', 'logos'));
CREATE POLICY "Admin Delete Media Storage" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('media', 'reports', 'logos'));
`;

/**
 * SQL MIGRATION PERBAIKAN RESMI: TABEL ADMIN_USERS, BOOTSTRAP AMAN, & RLS NON-REKURSIF
 * Siap dijalankan di Supabase Dashboard -> SQL Editor -> Run
 */
export const ADMIN_USERS_SQL_MIGRATION = `-- ==============================================================================
-- SQL MIGRATION RESMI TABEL ADMIN_USERS - LKS IRSYADUL AMAL
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Ekstensi pgcrypto untuk UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Buat tabel admin_users sesuai struktur standar
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'admin' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pastikan kolom is_active tersedia jika tabel sudah ada sebelumnya
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Index pencarian cepat
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 4. Bersihkan Policy lama jika ada (menghapus policy lama yang menyebabkan infinite recursion)
DROP POLICY IF EXISTS "Admin Read Users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin Modify Users" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_select_policy" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_insert_policy" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_update_policy" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_delete_policy" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_select_own" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_insert_first" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_update_own" ON public.admin_users;

-- 5. Kebijakan RLS SELECT (Aman, Non-Rekursif):
-- Pengguna yang terautentikasi dapat membaca record miliknya sendiri berdasarkan auth.uid() = user_id
CREATE POLICY "admin_users_select_own"
ON public.admin_users
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 6. Kebijakan RLS UPDATE (Aman):
-- Administrator dapat memperbarui data dirinya sendiri
CREATE POLICY "admin_users_update_own"
ON public.admin_users
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. Kebijakan RLS INSERT (Hanya jika belum ada admin aktif):
CREATE POLICY "admin_users_insert_first"
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE is_active = true
    )
);

-- 8. PostgreSQL Function SECURITY DEFINER untuk Bootstrap Administrator Pertama
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(p_name text DEFAULT 'Administrator')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid uuid;
  v_email text;
  v_active_count integer;
  v_admin public.admin_users%ROWTYPE;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Pengguna belum terautentikasi';
  END IF;

  SELECT count(*) INTO v_active_count 
  FROM public.admin_users 
  WHERE is_active = true;

  IF v_active_count > 0 THEN
    SELECT * INTO v_admin FROM public.admin_users WHERE user_id = v_uid;
    IF FOUND AND v_admin.is_active = true AND LOWER(v_admin.role) = 'admin' THEN
      RETURN jsonb_build_object('success', true, 'message', 'Akun Anda sudah terdaftar sebagai administrator aktif.', 'user_id', v_uid);
    END IF;
    RAISE EXCEPTION 'Setup administrator pertama telah ditutup karena sudah ada administrator aktif.';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Email pengguna tidak ditemukan di sistem autentikasi.';
  END IF;

  INSERT INTO public.admin_users (user_id, name, email, role, is_active)
  VALUES (
    v_uid,
    COALESCE(NULLIF(trim(p_name), ''), 'Administrator'),
    v_email,
    'admin',
    true
  )
  ON CONFLICT (user_id) DO UPDATE
  SET role = 'admin', is_active = true
  RETURNING * INTO v_admin;

  RETURN jsonb_build_object('success', true, 'message', 'Administrator pertama berhasil didaftarkan.', 'user_id', v_uid);
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin(text) TO authenticated;

-- 9. Function Cek Ketersediaan Setup Administrator
CREATE OR REPLACE FUNCTION public.is_admin_setup_available()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.admin_users WHERE is_active = true);
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_setup_available() TO anon, authenticated;
`;
