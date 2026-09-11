import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  HomepageContent,
  SiteSettings,
  ProgramItem,
  BankAccountItem,
  BankCategoryGroup,
  OfficialReportItem,
  DocumentationItem,
  DonationTransaction,
  DonorProfile,
  TestimonialItem,
  MediaItem,
  VideoItem,
  MusicSettings,
} from '../types';
import {
  INITIAL_SITE_SETTINGS,
  INITIAL_HOMEPAGE_CONTENT,
  INITIAL_CATEGORIES,
  INITIAL_BANK_ACCOUNTS_DATA,
  INITIAL_PROGRAMS_DATA,
  INITIAL_REPORTS_DATA,
  INITIAL_DOCUMENTATION_DATA,
  INITIAL_DONATIONS_DATA,
  INITIAL_DONORS_DATA,
  INITIAL_TESTIMONIALS_DATA,
  INITIAL_MEDIA_DATA,
  INITIAL_VIDEOS_DATA,
  INITIAL_MUSIC_SETTINGS,
} from './cmsInitialData';

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { signOutAdminAuth, verifyCurrentAdminSession } from '../lib/adminAuth';
import {
  fetchSiteSettingsFromSupabase,
  saveSiteSettingsToSupabase,
  fetchHomepageContentFromSupabase,
  saveHomepageContentToSupabase,
  fetchProgramsFromSupabase,
  upsertProgramToSupabase,
  deleteProgramFromSupabase,
  fetchBankAccountsFromSupabase,
  upsertBankAccountToSupabase,
  deleteBankAccountFromSupabase,
  fetchReportsFromSupabase,
  upsertReportToSupabase,
  deleteReportFromSupabase,
  fetchVideosFromSupabase,
  upsertVideoToSupabase,
  deleteVideoFromSupabase,
  fetchDocumentationsFromSupabase,
  upsertDocumentationToSupabase,
  deleteDocumentationFromSupabase,
  fetchMusicSettingsFromSupabase,
  saveMusicSettingsToSupabase,
} from '../lib/cmsSupabaseService';

const LOCAL_STORAGE_KEY = 'irsyadul_amal_cms_state_v1';

export interface AdminUser {
  id?: string;
  email: string;
  name: string;
  role: 'Admin' | 'super_admin' | 'admin' | string;
  username?: string;
}

interface CMSContextType {
  siteSettings: SiteSettings;
  homepageContent: HomepageContent;
  draftHomepageContent: HomepageContent | null;
  isDraftModeActive: boolean;
  programs: ProgramItem[];
  categories: string[];
  bankAccounts: BankAccountItem[];
  bankGroups: BankCategoryGroup[];
  reports: OfficialReportItem[];
  documentations: DocumentationItem[];
  videos: VideoItem[];
  musicSettings: MusicSettings;
  donations: DonationTransaction[];
  donors: DonorProfile[];
  testimonials: TestimonialItem[];
  media: MediaItem[];
  isAdminLoggedIn: boolean;
  adminUser: AdminUser | null;
  isSupabaseConnected: boolean;
  isSupabaseLoading: boolean;
  syncAllToSupabase: () => Promise<{ success: boolean; message: string }>;
  refetchAllCMSData: () => Promise<void>;

  // Actions
  loginAdmin: (emailOrUser: string, pass: string) => { success: boolean; message?: string };
  logoutAdmin: () => void;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<{ success: boolean; error?: any }>;
  updateHomepageContent: (content: Partial<HomepageContent>, publishImmediately?: boolean) => Promise<{ success: boolean; error?: any }>;
  saveHomepageDraft: (content: HomepageContent) => void;
  publishHomepageDraft: () => Promise<{ success: boolean; error?: any }>;
  discardHomepageDraft: () => void;
  
  // Programs
  addProgram: (program: ProgramItem) => Promise<{ success: boolean; data?: ProgramItem; error?: any }>;
  updateProgram: (program: ProgramItem) => Promise<{ success: boolean; data?: ProgramItem; error?: any }>;
  deleteProgram: (id: string) => Promise<{ success: boolean; error?: any }>;
  duplicateProgram: (id: string) => Promise<{ success: boolean; data?: ProgramItem; error?: any }>;
  
  // Categories
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  
  // Bank accounts
  addBankAccount: (acc: BankAccountItem) => Promise<{ success: boolean; data?: BankAccountItem; error?: any }>;
  updateBankAccount: (acc: BankAccountItem) => Promise<{ success: boolean; data?: BankAccountItem; error?: any }>;
  deleteBankAccount: (id: string) => Promise<{ success: boolean; error?: any }>;
  toggleBankAccountActive: (id: string) => Promise<{ success: boolean; error?: any }>;
  
  // Reports
  addReport: (report: OfficialReportItem) => Promise<{ success: boolean; data?: OfficialReportItem; error?: any }>;
  updateReport: (report: OfficialReportItem) => Promise<{ success: boolean; data?: OfficialReportItem; error?: any }>;
  deleteReport: (id: string) => Promise<{ success: boolean; error?: any }>;
  
  // Videos
  addVideo: (video: VideoItem) => Promise<{ success: boolean; data?: VideoItem; error?: any }>;
  updateVideo: (video: VideoItem) => Promise<{ success: boolean; data?: VideoItem; error?: any }>;
  deleteVideo: (id: string) => Promise<{ success: boolean; error?: any }>;
  toggleVideoActive: (id: string) => Promise<{ success: boolean; error?: any }>;
  reorderVideos: (videos: VideoItem[]) => Promise<{ success: boolean; error?: any }>;

  // Background Music
  updateMusicSettings: (settings: Partial<MusicSettings>) => Promise<{ success: boolean; error?: any }>;

  // Documentations
  addDocumentation: (doc: DocumentationItem) => Promise<{ success: boolean; data?: DocumentationItem; error?: any }>;
  updateDocumentation: (doc: DocumentationItem) => Promise<{ success: boolean; data?: DocumentationItem; error?: any }>;
  deleteDocumentation: (id: string) => Promise<{ success: boolean; error?: any }>;
  toggleDocumentationActive: (id: string) => Promise<{ success: boolean; error?: any }>;
  reorderDocumentations: (docs: DocumentationItem[]) => Promise<{ success: boolean; error?: any }>;
  
  // Donations
  addDonation: (don: DonationTransaction) => void;
  updateDonationStatus: (id: string, status: 'Menunggu Verifikasi' | 'Terverifikasi' | 'Ditolak') => void;
  deleteDonation: (id: string) => void;
  
  // Donors
  addDonor: (donor: DonorProfile) => void;
  deleteDonor: (id: string) => void;
  
  // Testimonials
  addTestimonial: (t: TestimonialItem) => void;
  updateTestimonial: (t: TestimonialItem) => void;
  deleteTestimonial: (id: string) => void;
  
  // Media
  addMedia: (m: MediaItem) => void;
  updateMedia: (m: MediaItem) => void;
  deleteMedia: (id: string) => void;
  mediaAssets: MediaItem[];
  addMediaAsset: (m: any) => void;
  updateMediaAsset: (m: any) => void;
  deleteMediaAsset: (id: string) => void;
  
  // System
  resetToDefaultData: () => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state directly with default schemas; Supabase will populate them on mount
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [homepageContent, setHomepageContent] = useState<HomepageContent>(INITIAL_HOMEPAGE_CONTENT);
  const [draftHomepageContent, setDraftHomepageContent] = useState<HomepageContent | null>(null);
  const [isDraftModeActive, setIsDraftModeActive] = useState(false);
  const [programs, setPrograms] = useState<ProgramItem[]>(INITIAL_PROGRAMS_DATA);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [bankAccounts, setBankAccounts] = useState<BankAccountItem[]>(INITIAL_BANK_ACCOUNTS_DATA);
  const [reports, setReports] = useState<OfficialReportItem[]>(INITIAL_REPORTS_DATA);
  const [documentations, setDocumentations] = useState<DocumentationItem[]>(INITIAL_DOCUMENTATION_DATA);
  const [videos, setVideos] = useState<VideoItem[]>(INITIAL_VIDEOS_DATA);
  const [musicSettings, setMusicSettings] = useState<MusicSettings>(INITIAL_MUSIC_SETTINGS);
  const [donations, setDonations] = useState<DonationTransaction[]>(INITIAL_DONATIONS_DATA);
  const [donors, setDonors] = useState<DonorProfile[]>(INITIAL_DONORS_DATA);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(INITIAL_TESTIMONIALS_DATA);
  const [media, setMedia] = useState<MediaItem[]>(INITIAL_MEDIA_DATA);

  // Auth State (Directly synchronized with Supabase Auth session)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Synchronize admin session with Supabase Auth
  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      const verified = await verifyCurrentAdminSession();
      if (isMounted) {
        if (verified.isValid && verified.user) {
          setAdminUser({
            id: verified.user.id,
            email: verified.user.email,
            name: verified.user.name,
            role: verified.user.role,
            username: verified.user.name,
          });
        } else {
          setAdminUser(null);
        }
      }
    };

    syncSession();

    const client = getSupabase();
    if (client) {
      const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;
        if (event === 'SIGNED_IN' && session?.user) {
          const verified = await verifyCurrentAdminSession();
          if (verified.isValid && verified.user) {
            setAdminUser({
              id: verified.user.id,
              email: verified.user.email,
              name: verified.user.name,
              role: verified.user.role,
              username: verified.user.name,
            });
          } else {
            setAdminUser(null);
          }
        } else if (event === 'SIGNED_OUT') {
          setAdminUser(null);
        }
      });

      return () => {
        isMounted = false;
        authListener?.subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Supabase dynamic state loader
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(false);
  const isSupabaseConnected = isSupabaseConfigured();

  const refetchAllCMSData = async () => {
    if (!isSupabaseConfigured()) return;
    setIsSupabaseLoading(true);

    try {
      const [settingsRes, homepageRes, programsRes, banksRes, reportsRes, videosRes, docsRes, musicRes] = await Promise.all([
        fetchSiteSettingsFromSupabase(),
        fetchHomepageContentFromSupabase(),
        fetchProgramsFromSupabase(),
        fetchBankAccountsFromSupabase(),
        fetchReportsFromSupabase(),
        fetchVideosFromSupabase(),
        fetchDocumentationsFromSupabase(),
        fetchMusicSettingsFromSupabase(),
      ]);

      if (settingsRes.data && Object.keys(settingsRes.data).length > 0) {
        setSiteSettings((prev) => ({ ...prev, ...settingsRes.data }));
      }

      if (homepageRes.data && Object.keys(homepageRes.data).length > 0) {
        setHomepageContent((prev) => ({ ...prev, ...homepageRes.data }));
      }

      if (Array.isArray(programsRes.data)) {
        setPrograms(programsRes.data);
      }

      if (Array.isArray(banksRes.data)) {
        setBankAccounts(banksRes.data);
      }

      if (Array.isArray(reportsRes.data)) {
        setReports(reportsRes.data);
      }

      if (Array.isArray(videosRes.data)) {
        setVideos(videosRes.data);
      }

      if (Array.isArray(docsRes.data)) {
        setDocumentations(docsRes.data);
      }

      if (musicRes.data) {
        setMusicSettings((prev) => ({ ...prev, ...musicRes.data }));
      }
    } catch (err) {
      console.warn('[CMS] Error loading data from Supabase:', err);
    } finally {
      setIsSupabaseLoading(false);
    }
  };

  useEffect(() => {
    refetchAllCMSData();
  }, []);

  // Derived bank category groups
  const bankGroups: BankCategoryGroup[] = useMemo(() => {
    const activeAccounts = bankAccounts.filter((a) => a.isActive !== false);
    
    // Grouping
    const umumAccounts = activeAccounts.filter((a) => a.category === 'DONASI UMUM');
    const yayasanAccounts = activeAccounts.filter((a) => a.category === 'DONASI YAYASAN');
    const wakafAccounts = activeAccounts.filter((a) => a.category === 'WAKAF AIR BERSIH');

    return [
      {
        category: 'DONASI UMUM',
        description: 'Penyaluran infaq, sedekah umum, dan operasional bantuan kemanusiaan tanggap bencana.',
        accounts: umumAccounts,
      },
      {
        category: 'DONASI YAYASAN',
        description: 'Dana amanah pengembangan program dakwah, sosial pembinaan umat, dan kelembagaan.',
        accounts: yayasanAccounts,
      },
      {
        category: 'WAKAF AIR BERSIH',
        description: 'Program khusus pembangunan sumur bor, pipanisasi mata air, dan fasilitas sanitasi warga prasejahtera.',
        accounts: wakafAccounts,
      },
    ];
  }, [bankAccounts]);

  // Auth methods - Synchronized with Supabase Auth
  const loginAdmin = (userOrEmail: string | AdminUser, _pass?: string) => {
    if (typeof userOrEmail === 'object' && userOrEmail !== null) {
      setAdminUser(userOrEmail);
      return { success: true };
    }
    const cleanEmail = (typeof userOrEmail === 'string' ? userOrEmail : '').trim();
    if (cleanEmail) {
      setAdminUser({
        email: cleanEmail,
        name: 'Administrator',
        role: 'admin',
        username: 'admin',
      });
      return { success: true };
    }
    return {
      success: false,
      message: 'Email admin tidak valid.',
    };
  };

  const logoutAdmin = () => {
    signOutAdminAuth();
    setAdminUser(null);
  };

  // Setting actions
  const updateSiteSettings = async (settings: Partial<SiteSettings>): Promise<{ success: boolean; error?: any }> => {
    const updated = { ...siteSettings, ...settings };
    // Update whatsappUrl if whatsapp changed
    if (settings.whatsapp) {
      const cleanWa = settings.whatsapp.replace(/\D/g, '');
      const normalized = cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa;
      updated.whatsappUrl = `https://wa.me/${normalized}`;
    }
    if (isSupabaseConfigured()) {
      const res = await saveSiteSettingsToSupabase(updated);
      if (!res.success) {
        return { success: false, error: res.error };
      }
    }
    setSiteSettings(updated);
    return { success: true };
  };

  const updateHomepageContent = async (
    content: Partial<HomepageContent>,
    publishImmediately = true
  ): Promise<{ success: boolean; error?: any }> => {
    if (publishImmediately) {
      const updated = { ...homepageContent, ...content };
      if (isSupabaseConfigured()) {
        const res = await saveHomepageContentToSupabase(updated);
        if (!res.success) {
          return { success: false, error: res.error };
        }
      }
      setHomepageContent(updated);
      setDraftHomepageContent(null);
      setIsDraftModeActive(false);
      return { success: true };
    } else {
      setDraftHomepageContent((prev) => ({ ...(prev || homepageContent), ...content }));
      setIsDraftModeActive(true);
      return { success: true };
    }
  };

  const saveHomepageDraft = (content: HomepageContent) => {
    setDraftHomepageContent(content);
    setIsDraftModeActive(true);
  };

  const publishHomepageDraft = async (): Promise<{ success: boolean; error?: any }> => {
    if (draftHomepageContent) {
      if (isSupabaseConfigured()) {
        const res = await saveHomepageContentToSupabase(draftHomepageContent);
        if (!res.success) {
          return { success: false, error: res.error };
        }
      }
      setHomepageContent(draftHomepageContent);
      setDraftHomepageContent(null);
      setIsDraftModeActive(false);
      return { success: true };
    }
    return { success: true };
  };

  const discardHomepageDraft = () => {
    setDraftHomepageContent(null);
    setIsDraftModeActive(false);
  };

  // Program actions
  const addProgram = async (program: ProgramItem): Promise<{ success: boolean; data?: ProgramItem; error?: any }> => {
    if (isSupabaseConfigured()) {
      const res = await upsertProgramToSupabase(program);
      if (!res.success) {
        return { success: false, error: res.error };
      }
      const saved = res.data || program;
      setPrograms((prev) => [saved, ...prev.filter((p) => p.id !== program.id && p.id !== saved.id)]);
      return { success: true, data: saved };
    } else {
      setPrograms((prev) => [program, ...prev]);
      return { success: true, data: program };
    }
  };

  const updateProgram = async (program: ProgramItem): Promise<{ success: boolean; data?: ProgramItem; error?: any }> => {
    if (isSupabaseConfigured()) {
      const res = await upsertProgramToSupabase(program);
      if (!res.success) {
        return { success: false, error: res.error };
      }
      const saved = res.data || program;
      setPrograms((prev) => prev.map((p) => (p.id === program.id || p.slug === program.slug ? saved : p)));
      return { success: true, data: saved };
    } else {
      setPrograms((prev) => prev.map((p) => (p.id === program.id ? program : p)));
      return { success: true, data: program };
    }
  };

  const deleteProgram = async (id: string): Promise<{ success: boolean; error?: any }> => {
    if (isSupabaseConfigured()) {
      const res = await deleteProgramFromSupabase(id);
      if (!res.success) {
        return { success: false, error: res.error };
      }
    }
    setPrograms((prev) => prev.filter((p) => p.id !== id && p.slug !== id));
    return { success: true };
  };

  const duplicateProgram = async (id: string): Promise<{ success: boolean; data?: ProgramItem; error?: any }> => {
    const target = programs.find((p) => p.id === id);
    if (!target) return { success: false, error: 'Program tidak ditemukan' };
    const duplicated: ProgramItem = {
      ...target,
      id: `prog-${Date.now()}`,
      title: `${target.title} (Salinan)`,
      slug: `${target.slug || 'program'}-salinan-${Date.now().toString().slice(-4)}`,
      status: 'DRAFT',
      isDraft: true,
    };
    return addProgram(duplicated);
  };

  // Category actions
  const addCategory = (category: string) => {
    const trimmed = category.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
    }
  };

  const deleteCategory = (category: string) => {
    setCategories((prev) => prev.filter((c) => c !== category));
  };

  // Bank account actions
  const addBankAccount = async (acc: BankAccountItem): Promise<{ success: boolean; data?: BankAccountItem; error?: any }> => {
    if (isSupabaseConfigured()) {
      const res = await upsertBankAccountToSupabase(acc);
      if (!res.success) {
        return { success: false, error: res.error };
      }
      const saved = res.data || acc;
      setBankAccounts((prev) => [...prev.filter((b) => b.id !== acc.id && b.id !== saved.id), saved]);
      return { success: true, data: saved };
    } else {
      setBankAccounts((prev) => [...prev, acc]);
      return { success: true, data: acc };
    }
  };

  const updateBankAccount = async (acc: BankAccountItem): Promise<{ success: boolean; data?: BankAccountItem; error?: any }> => {
    if (isSupabaseConfigured()) {
      const res = await upsertBankAccountToSupabase(acc);
      if (!res.success) {
        return { success: false, error: res.error };
      }
      const saved = res.data || acc;
      setBankAccounts((prev) => prev.map((b) => (b.id === acc.id || b.accountNumber === acc.accountNumber ? saved : b)));
      return { success: true, data: saved };
    } else {
      setBankAccounts((prev) => prev.map((b) => (b.id === acc.id ? acc : b)));
      return { success: true, data: acc };
    }
  };

  const deleteBankAccount = async (id: string): Promise<{ success: boolean; error?: any }> => {
    if (isSupabaseConfigured()) {
      const res = await deleteBankAccountFromSupabase(id);
      if (!res.success) {
        return { success: false, error: res.error };
      }
    }
    setBankAccounts((prev) => prev.filter((b) => b.id !== id && b.accountNumber !== id));
    return { success: true };
  };

  const toggleBankAccountActive = async (id: string): Promise<{ success: boolean; error?: any }> => {
    const target = bankAccounts.find((b) => b.id === id);
    if (!target) return { success: false, error: 'Rekening tidak ditemukan' };
    const toggled = { ...target, isActive: target.isActive === false ? true : false };
    return updateBankAccount(toggled);
  };

  // Report actions
  const addReport = async (report: OfficialReportItem): Promise<{ success: boolean; data?: OfficialReportItem; error?: any }> => {
    if (isSupabaseConfigured()) {
      const res = await upsertReportToSupabase(report);
      if (!res.success) {
        return { success: false, error: res.error };
      }
      const saved = res.data || report;
      setReports((prev) => [saved, ...prev.filter((r) => r.id !== report.id && r.id !== saved.id)]);
      return { success: true, data: saved };
    } else {
      setReports((prev) => [report, ...prev]);
      return { success: true, data: report };
    }
  };

  const updateReport = async (report: OfficialReportItem): Promise<{ success: boolean; data?: OfficialReportItem; error?: any }> => {
    if (isSupabaseConfigured()) {
      const res = await upsertReportToSupabase(report);
      if (!res.success) {
        return { success: false, error: res.error };
      }
      const saved = res.data || report;
      setReports((prev) => prev.map((r) => (r.id === report.id ? saved : r)));
      return { success: true, data: saved };
    } else {
      setReports((prev) => prev.map((r) => (r.id === report.id ? report : r)));
      return { success: true, data: report };
    }
  };

  const deleteReport = async (id: string): Promise<{ success: boolean; error?: any }> => {
    const target = reports.find((r) => r.id === id);
    if (isSupabaseConfigured()) {
      const res = await deleteReportFromSupabase(id, target?.title);
      if (!res.success) {
        return { success: false, error: res.error };
      }
    }
    setReports((prev) => prev.filter((r) => r.id !== id));
    return { success: true };
  };

  // Documentation actions
  const addDocumentation = async (doc: DocumentationItem): Promise<{ success: boolean; data?: DocumentationItem; error?: any }> => {
    if (isSupabaseConfigured()) {
      const res = await upsertDocumentationToSupabase(doc);
      if (!res.success) {
        return { success: false, error: res.error };
      }
      const saved = res.data || doc;
      setDocumentations((prev) => [saved, ...prev.filter((d) => d.id !== doc.id && d.id !== saved.id)]);
      return { success: true, data: saved };
    } else {
      setDocumentations((prev) => [doc, ...prev]);
      return { success: true, data: doc };
    }
  };

  const updateDocumentation = async (doc: DocumentationItem): Promise<{ success: boolean; data?: DocumentationItem; error?: any }> => {
    if (isSupabaseConfigured()) {
      const res = await upsertDocumentationToSupabase(doc);
      if (!res.success) {
        return { success: false, error: res.error };
      }
      const saved = res.data || doc;
      setDocumentations((prev) => prev.map((d) => (d.id === doc.id ? saved : d)));
      return { success: true, data: saved };
    } else {
      setDocumentations((prev) => prev.map((d) => (d.id === doc.id ? doc : d)));
      return { success: true, data: doc };
    }
  };

  const deleteDocumentation = async (id: string): Promise<{ success: boolean; error?: any }> => {
    const target = documentations.find((d) => d.id === id);
    if (isSupabaseConfigured()) {
      const res = await deleteDocumentationFromSupabase(id, target?.imageUrl);
      if (!res.success) {
        return { success: false, error: res.error };
      }
    }
    setDocumentations((prev) => prev.filter((d) => d.id !== id));
    return { success: true };
  };

  const toggleDocumentationActive = async (id: string): Promise<{ success: boolean; error?: any }> => {
    const target = documentations.find((d) => d.id === id);
    if (!target) return { success: false, error: 'Dokumentasi tidak ditemukan' };
    const toggled = { ...target, is_active: target.is_active === false ? true : false };
    return updateDocumentation(toggled);
  };

  const reorderDocumentations = async (newDocs: DocumentationItem[]): Promise<{ success: boolean; error?: any }> => {
    const updated = newDocs.map((doc, idx) => ({ ...doc, sort_order: idx + 1 }));
    setDocumentations(updated);
    if (isSupabaseConfigured()) {
      for (const doc of updated) {
        await upsertDocumentationToSupabase(doc);
      }
    }
    return { success: true };
  };

  // Video actions
  const addVideo = async (video: VideoItem): Promise<{ success: boolean; data?: VideoItem; error?: any }> => {
    if (isSupabaseConfigured()) {
      const res = await upsertVideoToSupabase(video);
      if (!res.success) {
        return { success: false, error: res.error };
      }
      const saved = res.data || video;
      setVideos((prev) => [saved, ...prev.filter((v) => v.id !== video.id && v.id !== saved.id)]);
      return { success: true, data: saved };
    } else {
      setVideos((prev) => [video, ...prev]);
      return { success: true, data: video };
    }
  };

  const updateVideo = async (video: VideoItem): Promise<{ success: boolean; data?: VideoItem; error?: any }> => {
    if (isSupabaseConfigured()) {
      const res = await upsertVideoToSupabase(video);
      if (!res.success) {
        return { success: false, error: res.error };
      }
      const saved = res.data || video;
      setVideos((prev) => prev.map((v) => (v.id === video.id ? saved : v)));
      return { success: true, data: saved };
    } else {
      setVideos((prev) => prev.map((v) => (v.id === video.id ? video : v)));
      return { success: true, data: video };
    }
  };

  const deleteVideo = async (id: string): Promise<{ success: boolean; error?: any }> => {
    const target = videos.find((v) => v.id === id);
    if (isSupabaseConfigured()) {
      const res = await deleteVideoFromSupabase(id, target?.youtube_url);
      if (!res.success) {
        return { success: false, error: res.error };
      }
    }
    setVideos((prev) => prev.filter((v) => v.id !== id));
    return { success: true };
  };

  const toggleVideoActive = async (id: string): Promise<{ success: boolean; error?: any }> => {
    const target = videos.find((v) => v.id === id);
    if (!target) return { success: false, error: 'Video tidak ditemukan' };
    const toggled = { ...target, is_active: !target.is_active };
    return updateVideo(toggled);
  };

  const reorderVideos = async (newVideos: VideoItem[]): Promise<{ success: boolean; error?: any }> => {
    const updated = newVideos.map((video, idx) => ({ ...video, sort_order: idx + 1 }));
    setVideos(updated);
    if (isSupabaseConfigured()) {
      for (const vid of updated) {
        await upsertVideoToSupabase(vid);
      }
    }
    return { success: true };
  };

  // Music settings actions
  const updateMusicSettings = async (settings: Partial<MusicSettings>): Promise<{ success: boolean; error?: any }> => {
    const updated = { ...musicSettings, ...settings, updated_at: new Date().toISOString() };
    if (isSupabaseConfigured()) {
      const res = await saveMusicSettingsToSupabase(updated);
      if (!res.success) {
        return { success: false, error: res.error };
      }
    }
    setMusicSettings(updated);
    return { success: true };
  };

  // Donation actions
  const addDonation = (don: DonationTransaction) => {
    setDonations((prev) => [don, ...prev]);
  };

  const updateDonationStatus = (
    id: string,
    status: 'Menunggu Verifikasi' | 'Terverifikasi' | 'Ditolak'
  ) => {
    setDonations((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  };

  const deleteDonation = (id: string) => {
    setDonations((prev) => prev.filter((d) => d.id !== id));
  };

  // Donor actions
  const addDonor = (donor: DonorProfile) => {
    setDonors((prev) => [donor, ...prev]);
  };

  const deleteDonor = (id: string) => {
    setDonors((prev) => prev.filter((d) => d.id !== id));
  };

  // Testimonial actions
  const addTestimonial = (t: TestimonialItem) => {
    setTestimonials((prev) => [t, ...prev]);
  };

  const updateTestimonial = (t: TestimonialItem) => {
    setTestimonials((prev) => prev.map((item) => (item.id === t.id ? t : item)));
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials((prev) => prev.filter((item) => item.id !== id));
  };

  // Media actions
  const addMedia = (m: MediaItem) => {
    setMedia((prev) => [m, ...prev]);
  };

  const updateMedia = (m: MediaItem) => {
    setMedia((prev) => prev.map((item) => (item.id === m.id ? m : item)));
  };

  const deleteMedia = (id: string) => {
    setMedia((prev) => prev.filter((item) => item.id !== id));
  };

  // Synchronize all CMS state to Supabase tables
  const syncAllToSupabase = async (): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Supabase URL & Anon Key belum terkonfigurasi pada file environment.',
      };
    }

    try {
      // 1. Site Settings
      await saveSiteSettingsToSupabase(siteSettings);
      // 2. Homepage Content
      await saveHomepageContentToSupabase(homepageContent);
      // 3. Programs
      for (const prog of programs) {
        await upsertProgramToSupabase(prog);
      }
      // 4. Bank Accounts
      for (const bank of bankAccounts) {
        await upsertBankAccountToSupabase(bank);
      }
      // 5. Reports
      for (const rep of reports) {
        await upsertReportToSupabase(rep);
      }
      // 6. Videos
      for (const vid of videos) {
        await upsertVideoToSupabase(vid);
      }
      // 7. Documentations
      for (const doc of documentations) {
        await upsertDocumentationToSupabase(doc);
      }
      // 8. Music Settings
      await saveMusicSettingsToSupabase(musicSettings);

      return {
        success: true,
        message: 'Seluruh data CMS (Pengaturan, Beranda, Program, Rekening, Laporan, Video, Dokumentasi, Musik) berhasil disinkronisasikan ke Supabase.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal sinkronisasi ke Supabase: ${err?.message || 'Terjadi kesalahan sistem'}`,
      };
    }
  };

  // Reset to default
  const resetToDefaultData = () => {
    setSiteSettings(INITIAL_SITE_SETTINGS);
    setHomepageContent(INITIAL_HOMEPAGE_CONTENT);
    setPrograms(INITIAL_PROGRAMS_DATA);
    setCategories(INITIAL_CATEGORIES);
    setBankAccounts(INITIAL_BANK_ACCOUNTS_DATA);
    setReports(INITIAL_REPORTS_DATA);
    setDocumentations(INITIAL_DOCUMENTATION_DATA);
    setVideos(INITIAL_VIDEOS_DATA);
    setMusicSettings(INITIAL_MUSIC_SETTINGS);
    setDonations(INITIAL_DONATIONS_DATA);
    setDonors(INITIAL_DONORS_DATA);
    setTestimonials(INITIAL_TESTIMONIALS_DATA);
    setMedia(INITIAL_MEDIA_DATA);
    setDraftHomepageContent(null);
    setIsDraftModeActive(false);

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(LOCAL_STORAGE_KEY)) {
        localStorage.removeItem(key);
      }
    });
  };

  const value = {
    siteSettings,
    homepageContent: isDraftModeActive && draftHomepageContent ? draftHomepageContent : homepageContent,
    draftHomepageContent,
    isDraftModeActive,
    programs,
    categories,
    bankAccounts,
    bankGroups,
    reports,
    documentations,
    videos,
    musicSettings,
    donations,
    donors,
    testimonials,
    media,
    isAdminLoggedIn: !!adminUser,
    adminUser,
    isSupabaseConnected,
    isSupabaseLoading,
    syncAllToSupabase,
    refetchAllCMSData,

    loginAdmin,
    logoutAdmin,
    updateSiteSettings,
    updateHomepageContent,
    saveHomepageDraft,
    publishHomepageDraft,
    discardHomepageDraft,

    addProgram,
    updateProgram,
    deleteProgram,
    duplicateProgram,

    addCategory,
    deleteCategory,

    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    toggleBankAccountActive,

    addReport,
    updateReport,
    deleteReport,

    addVideo,
    updateVideo,
    deleteVideo,
    toggleVideoActive,
    reorderVideos,

    updateMusicSettings,

    addDocumentation,
    updateDocumentation,
    deleteDocumentation,
    toggleDocumentationActive,
    reorderDocumentations,

    addDonation,
    updateDonationStatus,
    deleteDonation,

    addDonor,
    deleteDonor,

    addTestimonial,
    updateTestimonial,
    deleteTestimonial,

    addMedia,
    updateMedia,
    deleteMedia,
    mediaAssets: media,
    addMediaAsset: addMedia,
    updateMediaAsset: updateMedia,
    deleteMediaAsset: deleteMedia,

    resetToDefaultData,
  };

  return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>;
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};
