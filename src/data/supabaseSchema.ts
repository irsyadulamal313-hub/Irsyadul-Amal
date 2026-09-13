// Supabase SQL Master Schema for IRSYADUL AMAL Database
// Lembaga Sosial & Kemanusiaan - Garut, Jawa Barat
export const SUPABASE_SQL_SCHEMA = `-- ===================================================
-- SKEMA MASTER DATABASE SUPABASE (POSTGRESQL) - IRSYADUL AMAL
-- Lembaga Sosial & Kemanusiaan
-- Alamat: Kp. Malajati, Garut, Jawa Barat 44150
-- WhatsApp: 087804034140
-- ===================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SITE SETTINGS (Identitas, Kontak, SEO, Footer, Navigasi)
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL DEFAULT 'IRSYADUL AMAL',
    foundation_name VARCHAR(255) NOT NULL DEFAULT 'IRSYADUL AMAL',
    tagline VARCHAR(255) NOT NULL DEFAULT 'Lembaga Sosial & Kemanusiaan',
    address TEXT NOT NULL DEFAULT 'Kp. Malajati, RT.004/RW.013, Jati, Kec. Tarogong Kaler, Kabupaten Garut, Jawa Barat 44150',
    whatsapp VARCHAR(50) NOT NULL DEFAULT '087804034140',
    email VARCHAR(100) NOT NULL DEFAULT 'irsyadulamal313@gmail.com',
    operating_hours VARCHAR(100) DEFAULT 'Setiap Hari, 08:00 - 17:00 WIB',
    google_maps_url TEXT,
    wa_confirmation_template TEXT,
    footer_copyright VARCHAR(255) DEFAULT '© 2026 Irsyadul Amal. Semua Hak Dilindungi.',
    seo_title VARCHAR(255) DEFAULT 'IRSYADUL AMAL - Lembaga Sosial & Kemanusiaan',
    seo_description TEXT DEFAULT 'Lembaga sosial & kemanusiaan terpercaya di Garut. Menyalurkan bantuan yatim, dhuafa, dan program air bersih.',
    logo_url TEXT,
    nav_labels JSONB DEFAULT '{"beranda": "Beranda", "donasi": "Donasi", "program": "Program", "laporan": "Laporan", "call_center": "Call Center"}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. HOMEPAGE CONTENT (Hero, Statistik, About, Video, Dokumentasi, Banner, CTA, Navigasi Urutan)
CREATE TABLE IF NOT EXISTS homepage_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hero_badge VARCHAR(255) DEFAULT 'Lembaga Sosial & Kemanusiaan Terpercaya',
    hero_title VARCHAR(255) DEFAULT 'Berbagi Kebaikan,',
    hero_title_highlight VARCHAR(255) DEFAULT 'Menebar Manfaat',
    hero_subtitle TEXT DEFAULT 'Melalui Irsyadul Amal, mari bersama menghadirkan manfaat nyata bagi mereka yang membutuhkan di pelosok Garut dan sekitarnya.',
    hero_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    hero_image_caption TEXT DEFAULT 'Penyaluran santunan dan pembinaan yatim dhuafa Garut',
    primary_button_text VARCHAR(100) DEFAULT 'DONASI SEKARANG',
    secondary_button_text VARCHAR(100) DEFAULT 'LIHAT PROGRAM',
    about_title VARCHAR(255) DEFAULT 'Tentang Irsyadul Amal',
    about_subtitle VARCHAR(255) DEFAULT 'Amanah, Transparan, dan Bermanfaat Nyata',
    about_story TEXT DEFAULT 'LKS IRSYADUL AMAL adalah lembaga nirlaba yang berfokus pada pemberdayaan sosial kemanusiaan, pemenuhan hak-hak anak yatim dhuafa, serta penyediaan fasilitas air bersih di wilayah pelosok Jawa Barat.',
    about_content TEXT,
    values_title VARCHAR(255) DEFAULT 'Nilai Utama Kami',
    cta_title VARCHAR(255) DEFAULT 'Bersama Menghadirkan Senyum dan Harapan',
    cta_subtitle TEXT DEFAULT 'Setiap rupiah infaq dan sedekah Anda adalah harapan baru bagi yatim dhuafa.',
    cta_button_text VARCHAR(100) DEFAULT 'DONASI SEKARANG',
    video_section_title VARCHAR(255) DEFAULT 'Kenali Lebih Dekat IRSYADUL AMAL',
    video_section_subtitle TEXT DEFAULT 'Profil lembaga dan dokumentasi program dalam bentuk video.',
    video_section_enabled BOOLEAN DEFAULT TRUE,
    documentation_section_title VARCHAR(255) DEFAULT 'Dokumentasi Kegiatan',
    documentation_section_subtitle TEXT DEFAULT 'Jejak kegiatan dan manfaat yang telah dilaksanakan di lapangan.',
    documentation_section_enabled BOOLEAN DEFAULT TRUE,
    banner_title VARCHAR(255) DEFAULT 'Layanan Call Center & Konfirmasi Donasi Resmi',
    banner_subtitle TEXT DEFAULT 'Ada pertanyaan seputar program, konfirmasi transfer donasi, atau ingin menyalurkan zakat? Hubungi call center resmi kami.',
    banner_image_url TEXT,
    banner_button_text VARCHAR(100) DEFAULT 'HUBUNGI VIA WHATSAPP',
    banner_button_link VARCHAR(255) DEFAULT 'https://wa.me/6287804034140',
    banner_enabled BOOLEAN DEFAULT TRUE,
    sections_visibility JSONB DEFAULT '{"hero": true, "stats": true, "featuredPrograms": true, "videos": true, "documentations": true, "bankAccounts": true, "about": true, "banner": true, "cta": true, "testimonials": false, "gallery": true, "footer": true}'::jsonb,
    sections_order JSONB DEFAULT '["hero", "stats", "featuredPrograms", "videos", "documentations", "bankAccounts", "about", "banner", "cta", "testimonials"]'::jsonb,
    stats_total_donations VARCHAR(100) DEFAULT 'Data akan diperbarui',
    stats_active_programs VARCHAR(100) DEFAULT '4 Program Aktif',
    stats_beneficiaries VARCHAR(100) DEFAULT 'Garut & Sekitarnya',
    stats_donors VARCHAR(100) DEFAULT 'Sahabat Kebaikan',
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PROGRAM CATEGORIES
CREATE TABLE IF NOT EXISTS program_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PROGRAMS (Semua Program Donasi & Kemanusiaan)
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES program_categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100) NOT NULL DEFAULT 'Sosial',
    status VARCHAR(50) DEFAULT 'BERJALAN',
    location VARCHAR(255) DEFAULT 'Kabupaten Garut',
    deadline VARCHAR(100) DEFAULT 'Program Berkelanjutan',
    summary TEXT,
    description TEXT NOT NULL,
    full_story TEXT,
    background TEXT,
    objective TEXT,
    objectives TEXT,
    target_recipients VARCHAR(255) DEFAULT 'Data akan diperbarui',
    beneficiary_target VARCHAR(255),
    target_amount NUMERIC(15, 2) DEFAULT 0,
    target_amount_text VARCHAR(100) DEFAULT 'Target akan diperbarui',
    collected_amount NUMERIC(15, 2) DEFAULT 0,
    collected_amount_text VARCHAR(100) DEFAULT 'Data donasi akan diperbarui',
    donors_count INT DEFAULT 0,
    donors_count_text VARCHAR(100) DEFAULT 'Data akan diperbarui',
    donor_count INT DEFAULT 0,
    latest_update TEXT,
    latest_update_text TEXT,
    image_url TEXT NOT NULL,
    gallery TEXT[],
    gallery_urls JSONB DEFAULT '[]'::jsonb,
    documentations TEXT[],
    published BOOLEAN DEFAULT TRUE,
    is_draft BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    "order" INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. BANK ACCOUNTS (Rekening Resmi Donasi)
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(100) NOT NULL UNIQUE,
    account_holder VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'DONASI UMUM',
    description TEXT,
    logo_code VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    display_order INT DEFAULT 0,
    "order" INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. DONATIONS (Data Transaksi Donasi Masuk)
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_name VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50),
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    program_title VARCHAR(255) NOT NULL,
    nominal NUMERIC(15, 2) NOT NULL,
    bank_destination VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Menunggu Verifikasi',
    proof_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. DONORS (Data Master Donatur)
CREATE TABLE IF NOT EXISTS donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    program VARCHAR(255),
    total_donation NUMERIC(15, 2) DEFAULT 0,
    last_donation_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. OFFICIAL REPORTS (Laporan Pertanggungjawaban Resmi)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Laporan Donasi',
    period VARCHAR(100) NOT NULL,
    publish_date VARCHAR(100) DEFAULT CURRENT_DATE::text,
    file_size VARCHAR(50) DEFAULT '1.8 MB',
    file_type VARCHAR(50) DEFAULT 'PDF',
    download_url TEXT,
    file_url TEXT,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'DIPUBLIKASIKAN',
    published BOOLEAN DEFAULT TRUE,
    documentation_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. DOCUMENTATIONS (Dokumentasi Lapangan & Carousel Beranda)
CREATE TABLE IF NOT EXISTS documentations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    caption TEXT,
    program_name VARCHAR(255),
    category VARCHAR(100) DEFAULT 'Dokumentasi',
    activity_date VARCHAR(100) DEFAULT 'Dokumentasi Lapangan',
    location VARCHAR(255) DEFAULT 'Garut',
    image_url TEXT NOT NULL,
    video_url TEXT,
    story TEXT,
    target_beneficiary VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. VIDEOS (Video YouTube Beranda & Profil Lembaga)
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    youtube_url TEXT NOT NULL,
    thumbnail_url TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. MUSIC SETTINGS (Pengaturan Audio Nasyid YouTube Beranda)
CREATE TABLE IF NOT EXISTS music_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    music_enabled BOOLEAN DEFAULT TRUE,
    youtube_url TEXT NOT NULL DEFAULT 'https://www.youtube.com/watch?v=M5f9G6D99-A',
    autoplay_enabled BOOLEAN DEFAULT TRUE,
    loop_enabled BOOLEAN DEFAULT TRUE,
    default_volume INT DEFAULT 50,
    title VARCHAR(255) DEFAULT 'Instrumental Nasyid & Religi Penyejuk Hati',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. TESTIMONIALS (Testimonial Penerima Manfaat / Donatur)
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    quote TEXT NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. MEDIA (Penyimpanan Metadata Foto & File)
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Lainnya',
    url TEXT NOT NULL,
    caption TEXT,
    is_placeholder BOOLEAN DEFAULT FALSE,
    uploaded_at VARCHAR(50) DEFAULT CURRENT_DATE::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. ADMIN USERS (Akses Pengelola Dashboard)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'Super Admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================
-- IDEMPOTENT COLUMN ADDITIONS (UPGRADE SAFEGUARD)
-- Menjamin jika tabel sudah ada, seluruh kolom baru otomatis ditambahkan
-- ===================================================
DO $$
BEGIN
    -- site_settings
    ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT 'IRSYADUL AMAL';
    ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS foundation_name VARCHAR(255) DEFAULT 'IRSYADUL AMAL';
    ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;
    ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS nav_labels JSONB;
    ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS wa_confirmation_template TEXT;

    -- homepage_content
    ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS video_section_title VARCHAR(255) DEFAULT 'Kenali Lebih Dekat IRSYADUL AMAL';
    ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS video_section_subtitle TEXT DEFAULT 'Profil lembaga dan dokumentasi program dalam bentuk video.';
    ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS video_section_enabled BOOLEAN DEFAULT TRUE;
    ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS documentation_section_title VARCHAR(255) DEFAULT 'Dokumentasi Kegiatan';
    ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS documentation_section_subtitle TEXT DEFAULT 'Jejak kegiatan dan manfaat yang telah dilaksanakan di lapangan.';
    ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS documentation_section_enabled BOOLEAN DEFAULT TRUE;
    ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS banner_title VARCHAR(255);
    ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS banner_subtitle TEXT;
    ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS banner_image_url TEXT;
    ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS banner_button_text VARCHAR(100);
    ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS banner_button_link VARCHAR(255);
    ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS banner_enabled BOOLEAN DEFAULT TRUE;
    ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS sections_visibility JSONB;
    ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS sections_order JSONB;
    ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS stats_total_donations VARCHAR(100);
    ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS stats_active_programs VARCHAR(100);
    ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS stats_beneficiaries VARCHAR(100);
    ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS stats_donors VARCHAR(100);
    ALTER TABLE homepage_content ADD COLUMN IF NOT EXISTS about_content TEXT;

    -- programs
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS category_name VARCHAR(100) DEFAULT 'Sosial';
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS summary TEXT;
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS full_story TEXT;
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS background TEXT;
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS objective TEXT;
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS objectives TEXT;
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS target_recipients VARCHAR(255) DEFAULT 'Data akan diperbarui';
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS beneficiary_target VARCHAR(255);
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS target_amount_text VARCHAR(100);
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS collected_amount_text VARCHAR(100);
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS donors_count_text VARCHAR(100);
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS latest_update TEXT;
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS latest_update_text TEXT;
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS gallery_urls JSONB;
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT TRUE;
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS "order" INT DEFAULT 0;

    -- bank_accounts
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS "order" INT DEFAULT 0;
    ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    -- reports
    ALTER TABLE reports ADD COLUMN IF NOT EXISTS download_url TEXT;
    ALTER TABLE reports ADD COLUMN IF NOT EXISTS file_url TEXT;
    ALTER TABLE reports ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT TRUE;
    ALTER TABLE reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    -- documentations
    ALTER TABLE documentations ADD COLUMN IF NOT EXISTS story TEXT;
    ALTER TABLE documentations ADD COLUMN IF NOT EXISTS target_beneficiary VARCHAR(255);
    ALTER TABLE documentations ADD COLUMN IF NOT EXISTS video_url TEXT;

    -- music_settings
    ALTER TABLE music_settings ADD COLUMN IF NOT EXISTS default_volume INT DEFAULT 50;
    ALTER TABLE music_settings ADD COLUMN IF NOT EXISTS autoplay_enabled BOOLEAN DEFAULT TRUE;
    ALTER TABLE music_settings ADD COLUMN IF NOT EXISTS loop_enabled BOOLEAN DEFAULT TRUE;
END $$;

-- ===================================================
-- STORAGE BUCKETS (Supabase Storage: media, reports, logos)
-- ===================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('media', 'media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('reports', 'reports', true, 20971520, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']),
    ('logos', 'logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies
DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete media" ON storage.objects;

CREATE POLICY "Public can view media" ON storage.objects 
FOR SELECT USING (bucket_id IN ('media', 'reports', 'logos'));

CREATE POLICY "Authenticated users can upload media" ON storage.objects 
FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('media', 'reports', 'logos'));

CREATE POLICY "Authenticated users can update media" ON storage.objects 
FOR UPDATE TO authenticated USING (bucket_id IN ('media', 'reports', 'logos'));

CREATE POLICY "Authenticated users can delete media" ON storage.objects 
FOR DELETE TO authenticated USING (bucket_id IN ('media', 'reports', 'logos'));

-- ===================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 1. Kebijakan Baca Publik (Anon & Authenticated)
DROP POLICY IF EXISTS "Publik dapat membaca settings" ON site_settings;
CREATE POLICY "Publik dapat membaca settings" ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Publik dapat membaca homepage" ON homepage_content;
CREATE POLICY "Publik dapat membaca homepage" ON homepage_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Publik dapat membaca program categories" ON program_categories;
CREATE POLICY "Publik dapat membaca program categories" ON program_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Publik dapat membaca program published" ON programs;
CREATE POLICY "Publik dapat membaca program published" ON programs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Publik dapat membaca rekening aktif" ON bank_accounts;
CREATE POLICY "Publik dapat membaca rekening aktif" ON bank_accounts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Publik dapat membaca laporan published" ON reports;
CREATE POLICY "Publik dapat membaca laporan published" ON reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Publik dapat membaca dokumentasi" ON documentations;
CREATE POLICY "Publik dapat membaca dokumentasi" ON documentations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Publik dapat membaca video aktif" ON videos;
CREATE POLICY "Publik dapat membaca video aktif" ON videos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Publik dapat membaca music settings" ON music_settings;
CREATE POLICY "Publik dapat membaca music settings" ON music_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Publik dapat membaca testimonials" ON testimonials;
CREATE POLICY "Publik dapat membaca testimonials" ON testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Publik dapat membaca media" ON media;
CREATE POLICY "Publik dapat membaca media" ON media FOR SELECT USING (true);

DROP POLICY IF EXISTS "Publik dapat submit donasi" ON donations;
CREATE POLICY "Publik dapat submit donasi" ON donations FOR INSERT WITH CHECK (true);

-- 2. Kebijakan Tulis Admin (Authenticated Users)
DROP POLICY IF EXISTS "Admin dapat mengelola settings" ON site_settings;
CREATE POLICY "Admin dapat mengelola settings" ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin dapat mengelola homepage" ON homepage_content;
CREATE POLICY "Admin dapat mengelola homepage" ON homepage_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin dapat mengelola program categories" ON program_categories;
CREATE POLICY "Admin dapat mengelola program categories" ON program_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin dapat mengelola programs" ON programs;
CREATE POLICY "Admin dapat mengelola programs" ON programs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin dapat mengelola rekening" ON bank_accounts;
CREATE POLICY "Admin dapat mengelola rekening" ON bank_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin dapat mengelola laporan" ON reports;
CREATE POLICY "Admin dapat mengelola laporan" ON reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin dapat mengelola dokumentasi" ON documentations;
CREATE POLICY "Admin dapat mengelola dokumentasi" ON documentations FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin dapat mengelola videos" ON videos;
CREATE POLICY "Admin dapat mengelola videos" ON videos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin dapat mengelola music settings" ON music_settings;
CREATE POLICY "Admin dapat mengelola music settings" ON music_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin dapat mengelola testimonials" ON testimonials;
CREATE POLICY "Admin dapat mengelola testimonials" ON testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin dapat mengelola media" ON media;
CREATE POLICY "Admin dapat mengelola media" ON media FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin dapat mengelola donasi" ON donations;
CREATE POLICY "Admin dapat mengelola donasi" ON donations FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin dapat mengelola donors" ON donors;
CREATE POLICY "Admin dapat mengelola donors" ON donors FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin dapat mengelola admin_users" ON admin_users;
CREATE POLICY "Admin dapat mengelola admin_users" ON admin_users FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ===================================================
-- INITIAL DATA SEEDING (Hanya diinsert jika tabel masih kosong)
-- ===================================================
INSERT INTO site_settings (id, name, foundation_name, tagline, address, whatsapp, email, operating_hours)
SELECT 
    '00000000-0000-0000-0000-000000000001',
    'IRSYADUL AMAL',
    'IRSYADUL AMAL',
    'Lembaga Sosial & Kemanusiaan',
    'Kp. Malajati, RT.004/RW.013, Jati, Kec. Tarogong Kaler, Kabupaten Garut, Jawa Barat 44150',
    '087804034140',
    'irsyadulamal313@gmail.com',
    'Setiap Hari, 08:00 - 17:00 WIB'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

INSERT INTO homepage_content (id, hero_badge, hero_title, hero_title_highlight, hero_subtitle)
SELECT 
    '00000000-0000-0000-0000-000000000001',
    'Lembaga Sosial & Kemanusiaan Terpercaya',
    'Berbagi Kebaikan,',
    'Menebar Manfaat',
    'Melalui Irsyadul Amal, mari bersama menghadirkan manfaat nyata bagi mereka yang membutuhkan di pelosok Garut dan sekitarnya.'
WHERE NOT EXISTS (SELECT 1 FROM homepage_content);

INSERT INTO music_settings (id, music_enabled, youtube_url, default_volume, title)
SELECT 
    '00000000-0000-0000-0000-000000000001',
    true,
    'https://www.youtube.com/watch?v=M5f9G6D99-A',
    50,
    'Instrumental Nasyid & Religi Penyejuk Hati'
WHERE NOT EXISTS (SELECT 1 FROM music_settings);

INSERT INTO program_categories (name, slug, description)
VALUES 
    ('Sosial', 'sosial', 'Bantuan kemanusiaan dan santunan masyarakat prasejahtera'),
    ('Pendidikan', 'pendidikan', 'Beasiswa dan perlengkapan sekolah santri & anak yatim'),
    ('Kesehatan', 'kesehatan', 'Bantuan biaya medis & nutrisi gizi sehat'),
    ('Dakwah & Wakaf', 'dakwah-wakaf', 'Pembangunan sarana ibadah dan sumur air bersih')
ON CONFLICT (slug) DO NOTHING;

-- ===================================================
-- FUNGSI BOOTSTRAP ADMINISTRATOR
-- ===================================================
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(p_name text DEFAULT 'Administrator')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid uuid;
  v_email text;
  v_count int;
  v_admin record;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Harus terautentikasi terlebih dahulu.');
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
  SELECT count(*) INTO v_count FROM public.admin_users WHERE is_active = true;

  IF v_count > 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Administrator utama sudah pernah didaftarkan.');
  END IF;

  INSERT INTO public.admin_users (user_id, name, email, role, is_active)
  VALUES (
    v_uid,
    COALESCE(NULLIF(trim(p_name), ''), 'Administrator'),
    v_email,
    'Super Admin',
    true
  )
  ON CONFLICT (user_id) DO UPDATE
  SET role = 'Super Admin', is_active = true
  RETURNING * INTO v_admin;

  RETURN jsonb_build_object('success', true, 'message', 'Administrator pertama berhasil didaftarkan.', 'user_id', v_uid);
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin(text) TO authenticated;

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

export const SUPABASE_SCHEMA_SQL = SUPABASE_SQL_SCHEMA;
