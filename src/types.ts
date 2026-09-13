export type NavPage = 'beranda' | 'donasi' | 'program' | 'laporan' | 'call_center';

export type ProgramCategory = 'Semua' | 'Pendidikan' | 'Sosial' | 'Wakaf' | 'Kemanusiaan' | "Al-Qur'an" | string;

export type ProgramStatus = 'BERJALAN' | 'SEGERA DIMULAI' | 'SELESAI' | 'DRAFT';

export interface ProgramItem {
  id: string;
  slug?: string;
  title: string;
  category: string;
  status: ProgramStatus;
  description: string;
  fullStory?: string;
  background?: string;
  objective?: string;
  location?: string;
  deadline?: string;
  targetRecipients?: string; // e.g., "Data akan diperbarui"
  targetAmountText?: string; // e.g., "Target akan diperbarui"
  collectedAmountText?: string; // e.g., "Data donasi akan diperbarui"
  progressPercent?: number; // 0-100 or undefined
  donorsCountText?: string; // e.g., "Data akan diperbarui"
  latestUpdateText?: string; // e.g., "Akan diperbarui oleh admin"
  imageUrl: string;
  gallery?: string[];
  documentations?: string[];
  isDraft?: boolean;
  order?: number;
}

export interface BankAccountItem {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  category: 'DONASI UMUM' | 'DONASI YAYASAN' | 'WAKAF AIR BERSIH' | string;
  description?: string;
  logoCode?: 'bsi' | 'bri' | 'mandiri' | string;
  isActive?: boolean;
  order?: number;
}

export interface BankCategoryGroup {
  category: 'DONASI UMUM' | 'DONASI YAYASAN' | 'WAKAF AIR BERSIH' | string;
  description: string;
  accounts: BankAccountItem[];
}

export interface OfficialReportItem {
  id: string;
  title: string;
  category: 'Laporan Donasi' | 'Laporan Penggunaan Dana' | 'Laporan Program' | 'Dokumentasi Kegiatan' | string;
  period: string;
  publishDate?: string;
  fileSize?: string;
  fileType?: string;
  downloadUrl?: string;
  fileUrl?: string;
  description: string;
  published: boolean;
  documentationUrls?: string[];
}

export interface DocumentationItem {
  id: string;
  title: string;
  caption?: string;
  programName?: string;
  category?: string;
  date?: string;
  location?: string;
  imageUrl: string;
  story?: string;
  targetBeneficiary?: string;
  videoUrl?: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  thumbnail_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MusicSettings {
  music_enabled: boolean;
  youtube_url: string;
  autoplay_enabled: boolean;
  loop_enabled: boolean;
  default_volume: number; // 0 to 100
  title?: string;
  updated_at?: string;
}

export interface DonorRecord {
  id: string;
  donorName: string;
  programTitle: string;
  amountText: string;
  dateText: string;
  bankDestination: string;
  verified: boolean;
}

export interface DonationTransaction {
  id: string;
  date: string;
  donorName: string;
  whatsapp?: string;
  program: string;
  nominal: number;
  bank: string;
  status: 'Menunggu Verifikasi' | 'Terverifikasi' | 'Ditolak';
  proofUrl?: string;
  notes?: string;
}

export interface DonorProfile {
  id: string;
  name: string;
  whatsapp: string;
  program: string;
  totalDonation: number;
  lastDonationDate: string;
  status: 'Aktif' | 'Baru' | 'Donatur Tetap';
}

export interface MediaItem {
  id: string;
  title: string;
  category: 'Hero' | 'Program' | 'Dokumentasi' | 'Galeri' | 'Banner' | 'Lainnya';
  url: string;
  uploadedAt: string;
  caption?: string;
  isPlaceholder?: boolean;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatarUrl?: string;
  isActive: boolean;
  date?: string;
}

export interface SectionVisibility {
  hero: boolean;
  stats: boolean;
  featuredPrograms: boolean;
  bankAccounts: boolean;
  videos?: boolean;
  documentations?: boolean;
  about: boolean;
  banner: boolean;
  cta: boolean;
  testimonials: boolean;
  gallery: boolean;
  footer: boolean;
}

export interface HomepageContent {
  heroBadge: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroImageCaption: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutStory: string;
  valuesTitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
  videoSectionTitle?: string;
  videoSectionSubtitle?: string;
  videoSectionEnabled?: boolean;
  documentationSectionTitle?: string;
  documentationSectionSubtitle?: string;
  documentationSectionEnabled?: boolean;
  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerImageUrl?: string;
  bannerButtonText?: string;
  bannerButtonLink?: string;
  bannerEnabled?: boolean;
  sectionsVisibility?: Partial<SectionVisibility>;
  sectionsOrder?: string[];
  statsTotalDonations?: string;
  statsActivePrograms?: string;
  statsBeneficiaries?: string;
  statsDonors?: string;
}

export interface SiteSettings {
  name: string;
  tagline: string;
  address: string;
  whatsapp: string;
  whatsappUrl?: string;
  email: string;
  operatingHours: string;
  googleMapsUrl?: string;
  waConfirmationTemplate?: string;
  footerCopyright?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  institutionName?: string;
  operationalHours?: string;
  whatsappConfirmationTemplate?: string;
  whatsappDefaultMessage?: string;
  logo?: string;
  navLabels?: {
    beranda: string;
    donasi: string;
    program: string;
    laporan: string;
    call_center: string;
  };
  seoTitle?: string;
  seoDescription?: string;
}

export type AdminRole = 'Super Admin' | 'Pengurus' | 'Admin Program' | 'Admin Keuangan' | 'Admin Media';

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: 'Aktif' | 'Nonaktif';
  lastLogin?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt?: string;
  content: string;
  author?: string;
  publishDate?: string;
  imageUrl: string;
  published?: boolean;
  status?: 'published' | 'draft' | string;
  publishedAt?: string;
  views?: number;
}

export interface MediaAsset {
  id: string;
  title?: string;
  name?: string;
  category?: 'Program' | 'Hero' | 'Dokumentasi' | 'Banner' | 'Galeri' | 'Lainnya' | string;
  url: string;
  size?: string;
  sizeText?: string;
  uploadedAt?: string;
  uploadDate?: string;
  isPlaceholder?: boolean;
}

export interface FoundationSettings {
  name: string;
  tagline: string;
  address: string;
  whatsapp: string;
  whatsappUrl: string;
  email: string;
}

