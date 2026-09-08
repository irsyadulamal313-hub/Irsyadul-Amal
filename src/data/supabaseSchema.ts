// Supabase SQL Schema for IRSYADUL AMAL Database
export const SUPABASE_SQL_SCHEMA = `-- ===================================================
-- SKEMA DATABASE SUPABASE (POSTGRESQL) - IRSYADUL AMAL
-- Lembaga Sosial & Kemanusiaan
-- Alamat: Kp. Malajati, Garut, Jawa Barat 44150
-- WhatsApp: 087804034140
-- ===================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
CREATE TYPE user_role AS ENUM ('admin', 'super_admin', 'staff');
CREATE TYPE program_status AS ENUM ('DRAFT', 'SEGERA DIMULAI', 'BERJALAN', 'SELESAI');
CREATE TYPE donation_status AS ENUM ('Menunggu Verifikasi', 'Terverifikasi', 'Ditolak');
CREATE TYPE report_status AS ENUM ('DRAFT', 'DIPUBLIKASIKAN');

-- 3. SITE SETTINGS (Identitas, Kontak, SEO, Footer)
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    foundation_name VARCHAR(255) NOT NULL DEFAULT 'IRSYADUL AMAL',
    tagline VARCHAR(255) NOT NULL DEFAULT 'Lembaga Sosial & Kemanusiaan',
    address TEXT NOT NULL,
    whatsapp VARCHAR(50) NOT NULL DEFAULT '087804034140',
    email VARCHAR(100) NOT NULL DEFAULT 'irsyadulamal313@gmail.com',
    operating_hours VARCHAR(100) DEFAULT 'Setiap Hari, 08:00 - 17:00 WIB',
    google_maps_url TEXT,
    wa_confirmation_template TEXT,
    footer_copyright VARCHAR(255) DEFAULT '© 2026 Irsyadul Amal. Semua Hak Dilindungi.',
    seo_title VARCHAR(255) DEFAULT 'IRSYADUL AMAL - Lembaga Sosial & Kemanusiaan',
    seo_description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. HOMEPAGE CONTENT (Hero, About, CTA, dsb)
CREATE TABLE IF NOT EXISTS homepage_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hero_badge VARCHAR(255) DEFAULT 'Lembaga Sosial & Kemanusiaan Terpercaya',
    hero_title VARCHAR(255) DEFAULT 'Berbagi Kebaikan,',
    hero_title_highlight VARCHAR(255) DEFAULT 'Menebar Manfaat',
    hero_subtitle TEXT,
    hero_image_url TEXT,
    hero_image_caption TEXT,
    primary_button_text VARCHAR(100) DEFAULT 'DONASI SEKARANG',
    secondary_button_text VARCHAR(100) DEFAULT 'LIHAT PROGRAM',
    about_title VARCHAR(255) DEFAULT 'Tentang Irsyadul Amal',
    about_subtitle VARCHAR(255),
    about_story TEXT,
    cta_title VARCHAR(255) DEFAULT 'Bersama Menghadirkan Senyum dan Harapan',
    cta_subtitle TEXT,
    cta_button_text VARCHAR(100) DEFAULT 'DONASI SEKARANG',
    is_published BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PROGRAM CATEGORIES
CREATE TABLE IF NOT EXISTS program_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PROGRAMS (Semua Program Donasi)
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES program_categories(id) ON DELETE SET NULL,
    status program_status DEFAULT 'BERJALAN',
    location VARCHAR(255) DEFAULT 'Kabupaten Garut',
    deadline VARCHAR(100) DEFAULT 'Program Berkelanjutan',
    description TEXT NOT NULL,
    full_story TEXT,
    background TEXT,
    objective TEXT,
    target_recipients VARCHAR(255) DEFAULT 'Data akan diperbarui',
    target_amount NUMERIC(15, 2) DEFAULT 0,
    target_amount_text VARCHAR(100) DEFAULT 'Target akan diperbarui',
    collected_amount NUMERIC(15, 2) DEFAULT 0,
    collected_amount_text VARCHAR(100) DEFAULT 'Data donasi akan diperbarui',
    donors_count INT DEFAULT 0,
    donors_count_text VARCHAR(100) DEFAULT 'Data akan diperbarui',
    latest_update_text TEXT,
    image_url TEXT NOT NULL,
    gallery TEXT[], -- Array URL foto
    documentations TEXT[], -- Array URL dokumentasi
    is_draft BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. BANK ACCOUNTS (Rekening Resmi Donasi)
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(100) NOT NULL UNIQUE,
    account_holder VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'DONASI UMUM', 'DONASI YAYASAN', 'WAKAF AIR BERSIH'
    description TEXT,
    logo_code VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. DONATIONS (Data Transaksi Donasi Masuk)
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_name VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50),
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    program_title VARCHAR(255) NOT NULL,
    nominal NUMERIC(15, 2) NOT NULL,
    bank_destination VARCHAR(100) NOT NULL,
    status donation_status DEFAULT 'Menunggu Verifikasi',
    proof_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. DONORS (Data Master Donatur)
CREATE TABLE IF NOT EXISTS donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    total_donation NUMERIC(15, 2) DEFAULT 0,
    last_donation_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. OFFICIAL REPORTS (Laporan Pertanggungjawaban)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Laporan Donasi', 'Laporan Penggunaan Dana', dsb.
    period VARCHAR(100) NOT NULL,
    publish_date DATE DEFAULT CURRENT_DATE,
    file_size VARCHAR(50),
    file_type VARCHAR(50),
    download_url TEXT,
    description TEXT NOT NULL,
    status report_status DEFAULT 'DIPUBLIKASIKAN',
    documentation_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. DOCUMENTATIONS (Dokumentasi Kegiatan Lapangan)
CREATE TABLE IF NOT EXISTS documentations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    program_name VARCHAR(255),
    category VARCHAR(100),
    activity_date VARCHAR(100),
    location VARCHAR(255),
    image_url TEXT NOT NULL,
    video_url TEXT,
    story TEXT,
    target_beneficiary VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. TESTIMONIALS (Testimonial Penerima Manfaat / Mitra)
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    quote TEXT NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. MEDIA (Media Manager)
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Hero', 'Program', 'Dokumentasi', 'Galeri', 'Banner'
    url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. ADMIN USERS (Akses Pengelola)
CREATE TABLE IF NOT EXISTS admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

-- Kebijakan Baca Publik (Anon)
CREATE POLICY "Publik dapat membaca settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Publik dapat membaca homepage" ON homepage_content FOR SELECT USING (true);
CREATE POLICY "Publik dapat membaca program published" ON programs FOR SELECT USING (is_draft = false);
CREATE POLICY "Publik dapat membaca rekening aktif" ON bank_accounts FOR SELECT USING (is_active = true);
CREATE POLICY "Publik dapat membaca laporan published" ON reports FOR SELECT USING (status = 'DIPUBLIKASIKAN');
CREATE POLICY "Publik dapat membaca dokumentasi" ON documentations FOR SELECT USING (true);
CREATE POLICY "Publik dapat submit donasi" ON donations FOR INSERT WITH CHECK (true);

-- Kebijakan Tulis Admin (Authenticated)
CREATE POLICY "Admin dapat mengelola semua data" ON site_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin dapat mengelola homepage" ON homepage_content FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin dapat mengelola programs" ON programs FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin dapat mengelola rekening" ON bank_accounts FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin dapat mengelola laporan" ON reports FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin dapat mengelola donasi" ON donations FOR ALL TO authenticated USING (true);
`;

export const SUPABASE_SCHEMA_SQL = SUPABASE_SQL_SCHEMA;

