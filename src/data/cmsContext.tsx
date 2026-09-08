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
  donations: DonationTransaction[];
  donors: DonorProfile[];
  testimonials: TestimonialItem[];
  media: MediaItem[];
  isAdminLoggedIn: boolean;
  adminUser: AdminUser | null;
  isSupabaseConnected: boolean;
  isSupabaseLoading: boolean;
  syncAllToSupabase: () => Promise<{ success: boolean; message: string }>;

  // Actions
  loginAdmin: (emailOrUser: string, pass: string) => { success: boolean; message?: string };
  logoutAdmin: () => void;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  updateHomepageContent: (content: Partial<HomepageContent>, publishImmediately?: boolean) => void;
  saveHomepageDraft: (content: HomepageContent) => void;
  publishHomepageDraft: () => void;
  discardHomepageDraft: () => void;
  
  // Programs
  addProgram: (program: ProgramItem) => void;
  updateProgram: (program: ProgramItem) => void;
  deleteProgram: (id: string) => void;
  duplicateProgram: (id: string) => void;
  
  // Categories
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  
  // Bank accounts
  addBankAccount: (acc: BankAccountItem) => void;
  updateBankAccount: (acc: BankAccountItem) => void;
  deleteBankAccount: (id: string) => void;
  toggleBankAccountActive: (id: string) => void;
  
  // Reports
  addReport: (report: OfficialReportItem) => void;
  updateReport: (report: OfficialReportItem) => void;
  deleteReport: (id: string) => void;
  
  // Documentations
  addDocumentation: (doc: DocumentationItem) => void;
  updateDocumentation: (doc: DocumentationItem) => void;
  deleteDocumentation: (id: string) => void;
  
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
  // Load saved state or default
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_settings`);
      return saved ? JSON.parse(saved) : INITIAL_SITE_SETTINGS;
    } catch {
      return INITIAL_SITE_SETTINGS;
    }
  });

  const [homepageContent, setHomepageContent] = useState<HomepageContent>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_homepage`);
      return saved ? JSON.parse(saved) : INITIAL_HOMEPAGE_CONTENT;
    } catch {
      return INITIAL_HOMEPAGE_CONTENT;
    }
  });

  const [draftHomepageContent, setDraftHomepageContent] = useState<HomepageContent | null>(null);
  const [isDraftModeActive, setIsDraftModeActive] = useState(false);

  const [programs, setPrograms] = useState<ProgramItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_programs`);
      return saved ? JSON.parse(saved) : INITIAL_PROGRAMS_DATA;
    } catch {
      return INITIAL_PROGRAMS_DATA;
    }
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_categories`);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccountItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_banks`);
      return saved ? JSON.parse(saved) : INITIAL_BANK_ACCOUNTS_DATA;
    } catch {
      return INITIAL_BANK_ACCOUNTS_DATA;
    }
  });

  const [reports, setReports] = useState<OfficialReportItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_reports`);
      return saved ? JSON.parse(saved) : INITIAL_REPORTS_DATA;
    } catch {
      return INITIAL_REPORTS_DATA;
    }
  });

  const [documentations, setDocumentations] = useState<DocumentationItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_documentations`);
      return saved ? JSON.parse(saved) : INITIAL_DOCUMENTATION_DATA;
    } catch {
      return INITIAL_DOCUMENTATION_DATA;
    }
  });

  const [donations, setDonations] = useState<DonationTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_donations`);
      return saved ? JSON.parse(saved) : INITIAL_DONATIONS_DATA;
    } catch {
      return INITIAL_DONATIONS_DATA;
    }
  });

  const [donors, setDonors] = useState<DonorProfile[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_donors`);
      return saved ? JSON.parse(saved) : INITIAL_DONORS_DATA;
    } catch {
      return INITIAL_DONORS_DATA;
    }
  });

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_testimonials`);
      return saved ? JSON.parse(saved) : INITIAL_TESTIMONIALS_DATA;
    } catch {
      return INITIAL_TESTIMONIALS_DATA;
    }
  });

  const [media, setMedia] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_media`);
      return saved ? JSON.parse(saved) : INITIAL_MEDIA_DATA;
    } catch {
      return INITIAL_MEDIA_DATA;
    }
  });

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

  useEffect(() => {
    let isMounted = true;

    const loadSupabaseData = async () => {
      if (!isSupabaseConfigured()) return;
      setIsSupabaseLoading(true);

      try {
        const [settingsRes, homepageRes, programsRes, banksRes, reportsRes] = await Promise.all([
          fetchSiteSettingsFromSupabase(),
          fetchHomepageContentFromSupabase(),
          fetchProgramsFromSupabase(),
          fetchBankAccountsFromSupabase(),
          fetchReportsFromSupabase(),
        ]);

        if (!isMounted) return;

        if (settingsRes.data && Object.keys(settingsRes.data).length > 0) {
          setSiteSettings((prev) => ({ ...prev, ...settingsRes.data }));
        }

        if (homepageRes.data && Object.keys(homepageRes.data).length > 0) {
          setHomepageContent((prev) => ({ ...prev, ...homepageRes.data }));
        }

        if (programsRes.data && programsRes.data.length > 0) {
          setPrograms(programsRes.data);
        }

        if (banksRes.data && banksRes.data.length > 0) {
          setBankAccounts(banksRes.data);
        }

        if (reportsRes.data && reportsRes.data.length > 0) {
          setReports(reportsRes.data);
        }
      } catch (err) {
        console.warn('[CMS] Error loading data from Supabase:', err);
      } finally {
        if (isMounted) {
          setIsSupabaseLoading(false);
        }
      }
    };

    loadSupabaseData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_settings`, JSON.stringify(siteSettings));
    } catch (e) {
      console.error(e);
    }
  }, [siteSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_homepage`, JSON.stringify(homepageContent));
    } catch (e) {
      console.error(e);
    }
  }, [homepageContent]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_programs`, JSON.stringify(programs));
    } catch (e) {
      console.error(e);
    }
  }, [programs]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_categories`, JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_banks`, JSON.stringify(bankAccounts));
    } catch (e) {
      console.error(e);
    }
  }, [bankAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_reports`, JSON.stringify(reports));
    } catch (e) {
      console.error(e);
    }
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_documentations`, JSON.stringify(documentations));
    } catch (e) {
      console.error(e);
    }
  }, [documentations]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_donations`, JSON.stringify(donations));
    } catch (e) {
      console.error(e);
    }
  }, [donations]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_donors`, JSON.stringify(donors));
    } catch (e) {
      console.error(e);
    }
  }, [donors]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_testimonials`, JSON.stringify(testimonials));
    } catch (e) {
      console.error(e);
    }
  }, [testimonials]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_media`, JSON.stringify(media));
    } catch (e) {
      console.error(e);
    }
  }, [media]);

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
  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings((prev) => {
      const updated = { ...prev, ...settings };
      // Update whatsappUrl if whatsapp changed
      if (settings.whatsapp) {
        const cleanWa = settings.whatsapp.replace(/\D/g, '');
        const normalized = cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa;
        updated.whatsappUrl = `https://wa.me/${normalized}`;
      }
      saveSiteSettingsToSupabase(updated);
      return updated;
    });
  };

  const updateHomepageContent = (content: Partial<HomepageContent>, publishImmediately = true) => {
    if (publishImmediately) {
      setHomepageContent((prev) => {
        const updated = { ...prev, ...content };
        saveHomepageContentToSupabase(updated);
        return updated;
      });
      setDraftHomepageContent(null);
      setIsDraftModeActive(false);
    } else {
      setDraftHomepageContent((prev) => ({ ...(prev || homepageContent), ...content }));
      setIsDraftModeActive(true);
    }
  };

  const saveHomepageDraft = (content: HomepageContent) => {
    setDraftHomepageContent(content);
    setIsDraftModeActive(true);
  };

  const publishHomepageDraft = () => {
    if (draftHomepageContent) {
      setHomepageContent(draftHomepageContent);
      saveHomepageContentToSupabase(draftHomepageContent);
      setDraftHomepageContent(null);
      setIsDraftModeActive(false);
    }
  };

  const discardHomepageDraft = () => {
    setDraftHomepageContent(null);
    setIsDraftModeActive(false);
  };

  // Program actions
  const addProgram = (program: ProgramItem) => {
    setPrograms((prev) => [program, ...prev]);
    upsertProgramToSupabase(program);
  };

  const updateProgram = (program: ProgramItem) => {
    setPrograms((prev) => prev.map((p) => (p.id === program.id ? program : p)));
    upsertProgramToSupabase(program);
  };

  const deleteProgram = (id: string) => {
    setPrograms((prev) => prev.filter((p) => p.id !== id));
    deleteProgramFromSupabase(id);
  };

  const duplicateProgram = (id: string) => {
    const target = programs.find((p) => p.id === id);
    if (!target) return;
    const duplicated: ProgramItem = {
      ...target,
      id: `prog-${Date.now()}`,
      title: `${target.title} (Salinan)`,
      slug: `${target.slug || 'program'}-salinan-${Date.now().toString().slice(-4)}`,
      status: 'DRAFT',
      isDraft: true,
    };
    setPrograms((prev) => [duplicated, ...prev]);
    upsertProgramToSupabase(duplicated);
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
  const addBankAccount = (acc: BankAccountItem) => {
    setBankAccounts((prev) => [...prev, acc]);
    upsertBankAccountToSupabase(acc);
  };

  const updateBankAccount = (acc: BankAccountItem) => {
    setBankAccounts((prev) => prev.map((b) => (b.id === acc.id ? acc : b)));
    upsertBankAccountToSupabase(acc);
  };

  const deleteBankAccount = (id: string) => {
    setBankAccounts((prev) => prev.filter((b) => b.id !== id));
    deleteBankAccountFromSupabase(id);
  };

  const toggleBankAccountActive = (id: string) => {
    setBankAccounts((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const toggled = { ...b, isActive: b.isActive === false ? true : false };
          upsertBankAccountToSupabase(toggled);
          return toggled;
        }
        return b;
      })
    );
  };

  // Report actions
  const addReport = (report: OfficialReportItem) => {
    setReports((prev) => [report, ...prev]);
    upsertReportToSupabase(report);
  };

  const updateReport = (report: OfficialReportItem) => {
    setReports((prev) => prev.map((r) => (r.id === report.id ? report : r)));
    upsertReportToSupabase(report);
  };

  const deleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    deleteReportFromSupabase(id);
  };

  // Documentation actions
  const addDocumentation = (doc: DocumentationItem) => {
    setDocumentations((prev) => [doc, ...prev]);
  };

  const updateDocumentation = (doc: DocumentationItem) => {
    setDocumentations((prev) => prev.map((d) => (d.id === doc.id ? doc : d)));
  };

  const deleteDocumentation = (id: string) => {
    setDocumentations((prev) => prev.filter((d) => d.id !== id));
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

      return {
        success: true,
        message: 'Seluruh data CMS (Pengaturan, Beranda, Program, Rekening, Laporan) berhasil disinkronisasikan ke Supabase.',
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
    donations,
    donors,
    testimonials,
    media,
    isAdminLoggedIn: !!adminUser,
    adminUser,
    isSupabaseConnected,
    isSupabaseLoading,
    syncAllToSupabase,

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

    addDocumentation,
    updateDocumentation,
    deleteDocumentation,

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
