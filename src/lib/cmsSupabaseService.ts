import { getSupabase, isSupabaseConfigured } from './supabase';
import {
  SiteSettings,
  HomepageContent,
  ProgramItem,
  BankAccountItem,
  OfficialReportItem,
  VideoItem,
  DocumentationItem,
  MusicSettings,
} from '../types';

/**
 * Service to bridge CMS state directly with Supabase tables:
 * - site_settings
 * - homepage_content
 * - programs
 * - bank_accounts
 * - reports
 * - program_categories
 */

// ============================================================
// TABLE EXISTENCE & SCHEMA CACHE ERROR HANDLING
// ============================================================
const missingTablesSet = new Set<string>();
const missingTableListeners: Array<() => void> = [];

export function isTableMissingError(error: any): boolean {
  if (!error) return false;
  const msg = typeof error === 'string'
    ? error
    : (error.message || error.details || error.hint || '');
  const code = String(error?.code || '');
  const msgLower = msg.toLowerCase();

  return (
    code === 'PGRST205' ||
    code === '42P01' || // PostgreSQL undefined_table
    code === '404' ||
    msgLower.includes('could not find the table') ||
    msgLower.includes('schema cache') ||
    (msgLower.includes('relation') && msgLower.includes('does not exist'))
  );
}

export function registerMissingTable(tableName: string): void {
  if (!missingTablesSet.has(tableName)) {
    missingTablesSet.add(tableName);
    notifyMissingTableListeners();
  }
}

export function clearMissingTable(tableName: string): void {
  if (missingTablesSet.has(tableName)) {
    missingTablesSet.delete(tableName);
    notifyMissingTableListeners();
  }
}

export function resetMissingTables(): void {
  missingTablesSet.clear();
  notifyMissingTableListeners();
}

export function getMissingTables(): string[] {
  return Array.from(missingTablesSet);
}

export function hasMissingTables(): boolean {
  return missingTablesSet.size > 0;
}

export function onMissingTablesChange(callback: () => void): () => void {
  missingTableListeners.push(callback);
  return () => {
    const idx = missingTableListeners.indexOf(callback);
    if (idx !== -1) missingTableListeners.splice(idx, 1);
  };
}

function notifyMissingTableListeners(): void {
  missingTableListeners.forEach((fn) => {
    try {
      fn();
    } catch {}
  });
}

// ============================================================
// 1. SITE SETTINGS
// ============================================================
export async function fetchSiteSettingsFromSupabase(): Promise<{ data: Partial<SiteSettings> | null; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { data: null, error: 'Supabase client not configured' };
    }

    const { data, error } = await client
      .from('site_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isTableMissingError(error)) {
        registerMissingTable('site_settings');
        console.warn(`[CMS FETCH] Tabel 'site_settings' belum ada di database Supabase (skema belum dimigrasikan). Menggunakan data default aplikasi.`);
      } else {
        console.warn('[CMS FETCH] Peringatan saat mengambil site_settings:', error.message || error);
      }
      return { data: null, error };
    }

    clearMissingTable('site_settings');

    if (!data) {
      return { data: null, error: null };
    }

    // Map database row (supporting both naming conventions)
    const settings: Partial<SiteSettings> = {
      name: data.name || data.foundation_name || 'IRSYADUL AMAL',
      tagline: data.tagline || 'Lembaga Sosial & Kemanusiaan',
      address: data.address || '',
      whatsapp: data.whatsapp || '087804034140',
      whatsappUrl: data.whatsapp
        ? `https://wa.me/${data.whatsapp.replace(/\D/g, '').replace(/^0/, '62')}`
        : 'https://wa.me/6287804034140',
      email: data.email || '',
      operatingHours: data.operating_hours || 'Senin - Sabtu: 08.00 - 16.00 WIB',
      googleMapsUrl: data.google_maps_url || '',
      footerCopyright: data.footer_copyright || '© 2026 Irsyadul Amal. Semua Hak Dilindungi.',
      seoTitle: data.seo_title || '',
      seoDescription: data.seo_description || '',
      navLabels: data.nav_labels || {
        beranda: 'Beranda',
        donasi: 'Donasi',
        program: 'Program',
        laporan: 'Laporan',
        call_center: 'Call Center',
      },
      waConfirmationTemplate: data.wa_confirmation_template || data.whatsapp_confirmation_template || '',
    };

    console.log('[CMS FETCH] Site Settings diterima dari Supabase:', settings);
    return { data: settings, error: null };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('site_settings');
      console.warn(`[CMS FETCH] Tabel 'site_settings' belum ada di Supabase. Menggunakan data default.`);
    } else {
      console.warn('[CMS FETCH] Exception fetching site_settings:', err?.message || err);
    }
    return { data: null, error: err };
  }
}

export async function saveSiteSettingsToSupabase(settings: SiteSettings): Promise<{ success: boolean; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    // Check if an existing row exists to update
    const { data: existing, error: checkError } = await client
      .from('site_settings')
      .select('id')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (checkError && isTableMissingError(checkError)) {
      registerMissingTable('site_settings');
      return {
        success: false,
        error: {
          message: "Tabel 'site_settings' belum dibuat di database Supabase Anda. Silakan buka menu 'Database Supabase' dan jalankan skrip SQL di Supabase SQL Editor.",
          isTableMissing: true,
          originalError: checkError,
        },
      };
    }

    const payload = {
      name: settings.name,
      tagline: settings.tagline,
      address: settings.address,
      whatsapp: settings.whatsapp,
      email: settings.email,
      operating_hours: settings.operatingHours,
      google_maps_url: settings.googleMapsUrl || '',
      footer_copyright: settings.footerCopyright || '',
      seo_title: settings.seoTitle || '',
      seo_description: settings.seoDescription || '',
      nav_labels: settings.navLabels || {},
      wa_confirmation_template: settings.waConfirmationTemplate || '',
      updated_at: new Date().toISOString(),
    };

    console.log('[CMS SAVE] Payload yang dikirim (Site Settings):', payload);

    if (existing?.id) {
      const { error } = await client
        .from('site_settings')
        .update(payload)
        .eq('id', existing.id);
      if (error) {
        if (isTableMissingError(error)) {
          registerMissingTable('site_settings');
          return {
            success: false,
            error: {
              message: "Tabel 'site_settings' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
              isTableMissing: true,
              originalError: error,
            },
          };
        }
        console.warn('[SUPABASE RESPONSE] Error update site_settings:', error.message || error);
        return { success: false, error };
      }
      clearMissingTable('site_settings');
      console.log('[SUPABASE RESPONSE] Sukses update site_settings id:', existing.id);
      return { success: true, error: null };
    } else {
      const { error } = await client
        .from('site_settings')
        .insert([payload]);
      if (error) {
        if (isTableMissingError(error)) {
          registerMissingTable('site_settings');
          return {
            success: false,
            error: {
              message: "Tabel 'site_settings' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
              isTableMissing: true,
              originalError: error,
            },
          };
        }
        console.warn('[SUPABASE RESPONSE] Error insert site_settings:', error.message || error);
        return { success: false, error };
      }
      clearMissingTable('site_settings');
      console.log('[SUPABASE RESPONSE] Sukses insert site_settings');
      return { success: true, error: null };
    }
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('site_settings');
      return {
        success: false,
        error: {
          message: "Tabel 'site_settings' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
          isTableMissing: true,
          originalError: err,
        },
      };
    }
    console.warn('[SUPABASE RESPONSE] Exception saveSiteSettings:', err?.message || err);
    return { success: false, error: err };
  }
}

// ============================================================
// 2. HOMEPAGE CONTENT
// ============================================================
export async function fetchHomepageContentFromSupabase(): Promise<{ data: Partial<HomepageContent> | null; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { data: null, error: 'Supabase client not configured' };
    }

    const { data, error } = await client
      .from('homepage_content')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isTableMissingError(error)) {
        registerMissingTable('homepage_content');
        console.warn(`[CMS FETCH] Tabel 'homepage_content' belum ada di database Supabase (skema belum dimigrasikan). Menggunakan data default aplikasi.`);
      } else {
        console.warn('[CMS FETCH] Peringatan saat mengambil homepage_content:', error.message || error);
      }
      return { data: null, error };
    }

    clearMissingTable('homepage_content');

    if (!data) {
      return { data: null, error: null };
    }

    const content: Partial<HomepageContent> = {
      heroBadge: data.hero_badge || '',
      heroTitle: data.hero_title || 'Berbagi Kebaikan, Menebar Manfaat',
      heroTitleHighlight: data.hero_title_highlight || '',
      heroSubtitle: data.hero_subtitle || '',
      heroImageUrl: data.hero_image_url || '',
      heroImageCaption: data.hero_image_caption || '',
      primaryButtonText: data.primary_button_text || 'DONASI SEKARANG',
      secondaryButtonText: data.secondary_button_text || 'LIHAT PROGRAM',
      aboutTitle: data.about_title || 'Tentang Irsyadul Amal',
      aboutSubtitle: data.about_subtitle || '',
      aboutStory: data.about_story || data.about_content || '',
      valuesTitle: data.values_title || 'Nilai Utama Kami',
      ctaTitle: data.cta_title || 'Bersama Menghadirkan Senyum dan Harapan',
      ctaSubtitle: data.cta_subtitle || '',
      ctaButtonText: data.cta_button_text || 'DONASI SEKARANG',
      videoSectionTitle: data.video_section_title || 'Kenali Lebih Dekat IRSYADUL AMAL',
      videoSectionSubtitle: data.video_section_subtitle || 'Profil lembaga dan dokumentasi program dalam bentuk video.',
      videoSectionEnabled: data.video_section_enabled !== false,
      documentationSectionTitle: data.documentation_section_title || 'Dokumentasi Kegiatan',
      documentationSectionSubtitle: data.documentation_section_subtitle || 'Jejak kegiatan dan manfaat yang telah dilaksanakan.',
      documentationSectionEnabled: data.documentation_section_enabled !== false,
      bannerTitle: data.banner_title || '',
      bannerSubtitle: data.banner_subtitle || '',
      bannerImageUrl: data.banner_image_url || '',
      bannerButtonText: data.banner_button_text || '',
      bannerButtonLink: data.banner_button_link || '',
      bannerEnabled: data.banner_enabled !== false,
      sectionsVisibility: data.sections_visibility || {},
      sectionsOrder: data.sections_order || [
        'hero',
        'stats',
        'featuredPrograms',
        'bankAccounts',
        'videos',
        'documentations',
        'about',
        'banner',
        'cta',
        'testimonials',
      ],
      statsTotalDonations: data.stats_total_donations || '',
      statsActivePrograms: data.stats_active_programs || '',
      statsBeneficiaries: data.stats_beneficiaries || '',
      statsDonors: data.stats_donors || '',
    };

    console.log('[CMS FETCH] Homepage Content diterima dari Supabase:', content);
    return { data: content, error: null };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('homepage_content');
      console.warn(`[CMS FETCH] Tabel 'homepage_content' belum ada di Supabase. Menggunakan data default.`);
    } else {
      console.warn('[CMS FETCH] Exception fetching homepage_content:', err?.message || err);
    }
    return { data: null, error: err };
  }
}

export async function saveHomepageContentToSupabase(content: HomepageContent): Promise<{ success: boolean; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const { data: existing, error: checkError } = await client
      .from('homepage_content')
      .select('id')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (checkError && isTableMissingError(checkError)) {
      registerMissingTable('homepage_content');
      return {
        success: false,
        error: {
          message: "Tabel 'homepage_content' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
          isTableMissing: true,
          originalError: checkError,
        },
      };
    }

    const payload: Record<string, any> = {
      hero_badge: content.heroBadge || '',
      hero_title: content.heroTitle || '',
      hero_title_highlight: content.heroTitleHighlight || '',
      hero_subtitle: content.heroSubtitle || '',
      hero_image_url: content.heroImageUrl || '',
      hero_image_caption: content.heroImageCaption || '',
      primary_button_text: content.primaryButtonText || 'DONASI SEKARANG',
      secondary_button_text: content.secondaryButtonText || 'LIHAT PROGRAM',
      about_title: content.aboutTitle || '',
      about_subtitle: content.aboutSubtitle || '',
      about_story: content.aboutStory || '',
      values_title: content.valuesTitle || 'Nilai Utama Kami',
      cta_title: content.ctaTitle || '',
      cta_subtitle: content.ctaSubtitle || '',
      cta_button_text: content.ctaButtonText || 'DONASI SEKARANG',
      video_section_title: content.videoSectionTitle || 'Kenali Lebih Dekat IRSYADUL AMAL',
      video_section_subtitle: content.videoSectionSubtitle || 'Profil lembaga dan dokumentasi program dalam bentuk video.',
      video_section_enabled: content.videoSectionEnabled !== false,
      documentation_section_title: content.documentationSectionTitle || 'Dokumentasi Kegiatan',
      documentation_section_subtitle: content.documentationSectionSubtitle || 'Jejak kegiatan dan manfaat yang telah dilaksanakan.',
      documentation_section_enabled: content.documentationSectionEnabled !== false,
      banner_title: content.bannerTitle || '',
      banner_subtitle: content.bannerSubtitle || '',
      banner_image_url: content.bannerImageUrl || '',
      banner_button_text: content.bannerButtonText || '',
      banner_button_link: content.bannerButtonLink || '',
      banner_enabled: content.bannerEnabled !== false,
      sections_visibility: content.sectionsVisibility || {},
      sections_order: content.sectionsOrder || [],
      stats_total_donations: content.statsTotalDonations || null,
      stats_active_programs: content.statsActivePrograms || null,
      stats_beneficiaries: content.statsBeneficiaries || null,
      stats_donors: content.statsDonors || null,
      updated_at: new Date().toISOString(),
    };

    console.log('[CMS SAVE] Payload yang dikirim (Homepage Content):', payload);

    if (existing?.id) {
      const { error } = await client
        .from('homepage_content')
        .update(payload)
        .eq('id', existing.id);
      if (error) {
        if (isTableMissingError(error)) {
          registerMissingTable('homepage_content');
          return {
            success: false,
            error: {
              message: "Tabel 'homepage_content' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
              isTableMissing: true,
              originalError: error,
            },
          };
        }
        console.warn('[SUPABASE RESPONSE] Error update homepage_content:', error.message || error);
        return { success: false, error };
      }
      clearMissingTable('homepage_content');
      console.log('[SUPABASE RESPONSE] Sukses update homepage_content id:', existing.id);
      return { success: true, error: null };
    } else {
      const { error } = await client
        .from('homepage_content')
        .insert([payload]);
      if (error) {
        if (isTableMissingError(error)) {
          registerMissingTable('homepage_content');
          return {
            success: false,
            error: {
              message: "Tabel 'homepage_content' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
              isTableMissing: true,
              originalError: error,
            },
          };
        }
        console.warn('[SUPABASE RESPONSE] Error insert homepage_content:', error.message || error);
        return { success: false, error };
      }
      clearMissingTable('homepage_content');
      console.log('[SUPABASE RESPONSE] Sukses insert homepage_content');
      return { success: true, error: null };
    }
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('homepage_content');
      return {
        success: false,
        error: {
          message: "Tabel 'homepage_content' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
          isTableMissing: true,
          originalError: err,
        },
      };
    }
    console.warn('[SUPABASE RESPONSE] Exception saveHomepageContent:', err?.message || err);
    return { success: false, error: err };
  }
}

// ============================================================
// 3. PROGRAMS
// ============================================================
export async function fetchProgramsFromSupabase(): Promise<{ data: ProgramItem[] | null; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { data: null, error: 'Supabase client not configured' };
    }

    const { data, error } = await client
      .from('programs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        registerMissingTable('programs');
        console.warn(`[CMS FETCH] Tabel 'programs' belum ada di database Supabase (skema belum dimigrasikan). Menggunakan data default aplikasi.`);
      } else {
        console.warn('[CMS FETCH] Peringatan saat mengambil programs:', error.message || error);
      }
      return { data: null, error };
    }

    clearMissingTable('programs');

    if (!data) {
      return { data: [], error: null };
    }

    const items: ProgramItem[] = data.map((row: any, idx: number) => ({
      id: String(row.id),
      slug: row.slug || `program-${row.id}`,
      title: row.title || '',
      category: row.category_name || row.category || 'Sosial',
      status: row.status ? (String(row.status).toUpperCase() as any) : 'BERJALAN',
      description: row.summary || row.description || '',
      fullStory: row.full_story || row.description || '',
      background: row.background || '',
      objective: row.objective || row.objectives || '',
      location: row.location || 'Kabupaten Garut',
      deadline: row.deadline || 'Program Berkelanjutan',
      targetRecipients: row.target_recipients || row.beneficiary_target || 'Data akan diperbarui',
      targetAmountText: row.target_amount_text || (row.target_amount ? `Rp${Number(row.target_amount).toLocaleString('id-ID')}` : 'Target akan diperbarui'),
      collectedAmountText: row.collected_amount_text || (row.collected_amount ? `Rp${Number(row.collected_amount).toLocaleString('id-ID')}` : 'Data donasi akan diperbarui'),
      donorsCountText: row.donors_count_text || (row.donor_count ? `${row.donor_count} Donatur` : 'Data akan diperbarui'),
      latestUpdateText: row.latest_update || row.latest_update_text || 'Program resmi binaan Irsyadul Amal.',
      imageUrl: row.image_url || '',
      gallery: Array.isArray(row.gallery) ? row.gallery : Array.isArray(row.gallery_urls) ? row.gallery_urls : [],
      documentations: Array.isArray(row.documentations) ? row.documentations : [],
      isDraft: Boolean(row.is_draft || row.status === 'Draft' || row.status === 'DRAFT'),
      order: row.display_order ?? row.order ?? idx + 1,
    }));

    console.log(`[CMS FETCH] Programs diterima dari Supabase: ${items.length} program`);
    return { data: items, error: null };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('programs');
      console.warn(`[CMS FETCH] Tabel 'programs' belum ada di Supabase. Menggunakan data default.`);
    } else {
      console.warn('[CMS FETCH] Exception fetching programs:', err?.message || err);
    }
    return { data: null, error: err };
  }
}

export async function upsertProgramToSupabase(prog: ProgramItem): Promise<{ success: boolean; data?: ProgramItem; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const isDraft = Boolean(prog.isDraft || prog.status === 'DRAFT');
    const payload: Record<string, any> = {
      title: prog.title.trim(),
      slug: prog.slug || prog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      category_name: prog.category || 'Sosial',
      status: prog.status || (isDraft ? 'DRAFT' : 'BERJALAN'),
      summary: prog.description || '',
      description: prog.fullStory || prog.description || '',
      full_story: prog.fullStory || prog.description || '',
      background: prog.background || '',
      objective: prog.objective || '',
      objectives: prog.objective || '',
      location: prog.location || 'Kabupaten Garut',
      deadline: prog.deadline || 'Program Berkelanjutan',
      target_recipients: prog.targetRecipients || 'Data akan diperbarui',
      target_amount_text: prog.targetAmountText || 'Target akan diperbarui',
      collected_amount_text: prog.collectedAmountText || 'Data donasi akan diperbarui',
      donors_count_text: prog.donorsCountText || 'Data akan diperbarui',
      latest_update: prog.latestUpdateText || '',
      latest_update_text: prog.latestUpdateText || '',
      image_url: prog.imageUrl,
      gallery: prog.gallery || [],
      gallery_urls: prog.gallery || [],
      published: !isDraft,
      is_draft: isDraft,
      updated_at: new Date().toISOString(),
    };

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(prog.id);
    console.log('[CMS SAVE] Payload yang dikirim (Program):', { id: prog.id, isUUID, title: payload.title });

    let resData: any = null;
    let resError: any = null;

    if (isUUID) {
      const { data, error } = await client
        .from('programs')
        .upsert({ id: prog.id, ...payload }, { onConflict: 'id' })
        .select()
        .single();
      resData = data;
      resError = error;
    } else {
      // First try upsert on slug
      const { data, error } = await client
        .from('programs')
        .upsert(payload, { onConflict: 'slug' })
        .select()
        .single();
      resData = data;
      resError = error;
    }

    if (resError) {
      if (isTableMissingError(resError)) {
        registerMissingTable('programs');
        return {
          success: false,
          error: {
            message: "Tabel 'programs' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
            isTableMissing: true,
            originalError: resError,
          },
        };
      }
      console.warn('[SUPABASE RESPONSE] Error upsert program:', resError.message || resError);
      return { success: false, error: resError };
    }

    clearMissingTable('programs');
    console.log('[SUPABASE RESPONSE] Sukses upsert program:', resData);
    const updatedProg: ProgramItem = {
      ...prog,
      id: String(resData.id),
      slug: resData.slug || prog.slug,
    };

    return { success: true, data: updatedProg, error: null };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('programs');
      return {
        success: false,
        error: {
          message: "Tabel 'programs' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
          isTableMissing: true,
          originalError: err,
        },
      };
    }
    console.warn('[SUPABASE RESPONSE] Exception upsertProgram:', err?.message || err);
    return { success: false, error: err };
  }
}

export async function deleteProgramFromSupabase(id: string): Promise<{ success: boolean; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    console.log('[CMS SAVE] Delete Program id:', id, 'isUUID:', isUUID);

    const query = client.from('programs').delete();
    const { error } = isUUID ? await query.eq('id', id) : await query.eq('slug', id);

    if (error) {
      if (isTableMissingError(error)) {
        registerMissingTable('programs');
        return {
          success: false,
          error: {
            message: "Tabel 'programs' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
            isTableMissing: true,
            originalError: error,
          },
        };
      }
      console.warn('[SUPABASE RESPONSE] Error delete program:', error.message || error);
      return { success: false, error };
    }

    clearMissingTable('programs');
    console.log('[SUPABASE RESPONSE] Sukses delete program id:', id);
    return { success: true, error: null };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('programs');
      return {
        success: false,
        error: {
          message: "Tabel 'programs' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
          isTableMissing: true,
          originalError: err,
        },
      };
    }
    console.warn('[SUPABASE RESPONSE] Exception deleteProgram:', err?.message || err);
    return { success: false, error: err };
  }
}

// ============================================================
// 4. BANK ACCOUNTS
// ============================================================
export async function fetchBankAccountsFromSupabase(): Promise<{ data: BankAccountItem[] | null; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { data: null, error: 'Supabase client not configured' };
    }

    const { data, error } = await client
      .from('bank_accounts')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      if (isTableMissingError(error)) {
        registerMissingTable('bank_accounts');
        console.warn(`[CMS FETCH] Tabel 'bank_accounts' belum ada di database Supabase (skema belum dimigrasikan). Menggunakan data default aplikasi.`);
      } else {
        console.warn('[CMS FETCH] Peringatan saat mengambil bank_accounts:', error.message || error);
      }
      return { data: null, error };
    }

    clearMissingTable('bank_accounts');

    if (!data) {
      return { data: [], error: null };
    }

    const items: BankAccountItem[] = data.map((row: any, idx: number) => ({
      id: String(row.id),
      bankName: row.bank_name || '',
      accountNumber: row.account_number || '',
      accountHolder: row.account_holder || '',
      category: row.category || 'DONASI UMUM',
      description: row.description || '',
      logoCode: (row.bank_name || '').toLowerCase().includes('mandiri')
        ? 'mandiri'
        : (row.bank_name || '').toLowerCase().includes('bri')
        ? 'bri'
        : 'bsi',
      isActive: row.is_active !== false,
      order: row.sort_order ?? row.order ?? idx + 1,
    }));

    console.log(`[CMS FETCH] Bank Accounts diterima dari Supabase: ${items.length} rekening`);
    return { data: items, error: null };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('bank_accounts');
      console.warn(`[CMS FETCH] Tabel 'bank_accounts' belum ada di Supabase. Menggunakan data default.`);
    } else {
      console.warn('[CMS FETCH] Exception fetching bank_accounts:', err?.message || err);
    }
    return { data: null, error: err };
  }
}

export async function upsertBankAccountToSupabase(acc: BankAccountItem): Promise<{ success: boolean; data?: BankAccountItem; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const payload: Record<string, any> = {
      bank_name: acc.bankName.trim(),
      account_number: acc.accountNumber.trim(),
      account_holder: acc.accountHolder.trim(),
      category: acc.category || 'DONASI UMUM',
      description: acc.description || '',
      is_active: acc.isActive !== false,
      sort_order: acc.order || 0,
      updated_at: new Date().toISOString(),
    };

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(acc.id);
    console.log('[CMS SAVE] Payload yang dikirim (Bank Account):', { id: acc.id, isUUID, ...payload });

    let resData: any = null;
    let resError: any = null;

    if (isUUID) {
      const { data, error } = await client
        .from('bank_accounts')
        .upsert({ id: acc.id, ...payload }, { onConflict: 'id' })
        .select()
        .single();
      resData = data;
      resError = error;
    } else {
      const { data, error } = await client
        .from('bank_accounts')
        .upsert(payload, { onConflict: 'account_number' })
        .select()
        .single();
      resData = data;
      resError = error;
    }

    if (resError) {
      if (isTableMissingError(resError)) {
        registerMissingTable('bank_accounts');
        return {
          success: false,
          error: {
            message: "Tabel 'bank_accounts' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
            isTableMissing: true,
            originalError: resError,
          },
        };
      }
      console.warn('[SUPABASE RESPONSE] Error upsert bank_account:', resError.message || resError);
      return { success: false, error: resError };
    }

    clearMissingTable('bank_accounts');
    console.log('[SUPABASE RESPONSE] Sukses upsert bank_account:', resData);
    const updatedAcc: BankAccountItem = {
      ...acc,
      id: String(resData.id),
      accountNumber: resData.account_number || acc.accountNumber,
    };

    return { success: true, data: updatedAcc, error: null };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('bank_accounts');
      return {
        success: false,
        error: {
          message: "Tabel 'bank_accounts' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
          isTableMissing: true,
          originalError: err,
        },
      };
    }
    console.warn('[SUPABASE RESPONSE] Exception upsertBankAccount:', err?.message || err);
    return { success: false, error: err };
  }
}

export async function deleteBankAccountFromSupabase(id: string): Promise<{ success: boolean; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    console.log('[CMS SAVE] Delete Bank Account id:', id, 'isUUID:', isUUID);

    const query = client.from('bank_accounts').delete();
    const { error } = isUUID ? await query.eq('id', id) : await query.eq('account_number', id);

    if (error) {
      if (isTableMissingError(error)) {
        registerMissingTable('bank_accounts');
        return {
          success: false,
          error: {
            message: "Tabel 'bank_accounts' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
            isTableMissing: true,
            originalError: error,
          },
        };
      }
      console.warn('[SUPABASE RESPONSE] Error delete bank_account:', error.message || error);
      return { success: false, error };
    }

    clearMissingTable('bank_accounts');
    console.log('[SUPABASE RESPONSE] Sukses delete bank_account id:', id);
    return { success: true, error: null };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('bank_accounts');
      return {
        success: false,
        error: {
          message: "Tabel 'bank_accounts' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
          isTableMissing: true,
          originalError: err,
        },
      };
    }
    console.warn('[SUPABASE RESPONSE] Exception deleteBankAccount:', err?.message || err);
    return { success: false, error: err };
  }
}

// ============================================================
// 5. REPORTS
// ============================================================
export async function fetchReportsFromSupabase(): Promise<{ data: OfficialReportItem[] | null; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { data: null, error: 'Supabase client not configured' };
    }

    const { data, error } = await client
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        registerMissingTable('reports');
        console.warn(`[CMS FETCH] Tabel 'reports' belum ada di database Supabase (skema belum dimigrasikan). Menggunakan data default aplikasi.`);
      } else {
        console.warn('[CMS FETCH] Peringatan saat mengambil reports:', error.message || error);
      }
      return { data: null, error };
    }

    clearMissingTable('reports');

    if (!data) {
      return { data: [], error: null };
    }

    const items: OfficialReportItem[] = data.map((row: any) => ({
      id: String(row.id),
      title: row.title || '',
      category: row.category || 'Laporan Donasi',
      period: row.period || '',
      publishDate: row.publish_date || row.created_at?.slice(0, 10) || '',
      fileSize: row.file_size || 'Dokumen Resmi',
      fileType: row.file_type || 'PDF',
      downloadUrl: row.download_url || row.file_url || '',
      fileUrl: row.file_url || row.download_url || '',
      description: row.description || '',
      published: row.published !== false,
      documentationUrls: row.documentation_urls || [],
    }));

    console.log(`[CMS FETCH] Reports diterima dari Supabase: ${items.length} laporan`);
    return { data: items, error: null };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('reports');
      console.warn(`[CMS FETCH] Tabel 'reports' belum ada di Supabase. Menggunakan data default.`);
    } else {
      console.warn('[CMS FETCH] Exception fetching reports:', err?.message || err);
    }
    return { data: null, error: err };
  }
}

export async function upsertReportToSupabase(rep: OfficialReportItem): Promise<{ success: boolean; data?: OfficialReportItem; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const payload: Record<string, any> = {
      title: rep.title.trim(),
      category: rep.category,
      period: rep.period,
      publish_date: rep.publishDate || new Date().toISOString().slice(0, 10),
      file_size: rep.fileSize || 'Dokumen Resmi',
      file_type: rep.fileType || 'PDF',
      file_url: rep.fileUrl || rep.downloadUrl || '',
      download_url: rep.downloadUrl || rep.fileUrl || '',
      description: rep.description || '',
      published: rep.published !== false,
      status: rep.published !== false ? 'DIPUBLIKASIKAN' : 'DRAFT',
      updated_at: new Date().toISOString(),
    };

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rep.id);
    console.log('[CMS SAVE] Payload yang dikirim (Report):', { id: rep.id, isUUID, ...payload });

    let resData: any = null;
    let resError: any = null;

    if (isUUID) {
      const { data, error } = await client
        .from('reports')
        .upsert({ id: rep.id, ...payload }, { onConflict: 'id' })
        .select()
        .single();
      resData = data;
      resError = error;
    } else {
      const { data, error } = await client
        .from('reports')
        .insert([payload])
        .select()
        .single();
      resData = data;
      resError = error;
    }

    if (resError) {
      if (isTableMissingError(resError)) {
        registerMissingTable('reports');
        return {
          success: false,
          error: {
            message: "Tabel 'reports' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
            isTableMissing: true,
            originalError: resError,
          },
        };
      }
      console.warn('[SUPABASE RESPONSE] Error upsert report:', resError.message || resError);
      return { success: false, error: resError };
    }

    clearMissingTable('reports');
    console.log('[SUPABASE RESPONSE] Sukses upsert report:', resData);
    const updatedRep: OfficialReportItem = {
      ...rep,
      id: String(resData.id),
      downloadUrl: resData.download_url || rep.downloadUrl,
      fileUrl: resData.file_url || rep.fileUrl,
    };

    return { success: true, data: updatedRep, error: null };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('reports');
      return {
        success: false,
        error: {
          message: "Tabel 'reports' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
          isTableMissing: true,
          originalError: err,
        },
      };
    }
    console.warn('[SUPABASE RESPONSE] Exception upsertReport:', err?.message || err);
    return { success: false, error: err };
  }
}

export async function deleteReportFromSupabase(id: string, fallbackTitle?: string): Promise<{ success: boolean; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    console.log('[CMS SAVE] Delete Report id:', id, 'isUUID:', isUUID, 'fallbackTitle:', fallbackTitle);

    let error: any = null;
    if (isUUID) {
      const res = await client.from('reports').delete().eq('id', id);
      error = res.error;
    } else if (fallbackTitle) {
      const res = await client.from('reports').delete().eq('title', fallbackTitle);
      error = res.error;
    }

    if (error) {
      if (isTableMissingError(error)) {
        registerMissingTable('reports');
        return {
          success: false,
          error: {
            message: "Tabel 'reports' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
            isTableMissing: true,
            originalError: error,
          },
        };
      }
      console.warn('[SUPABASE RESPONSE] Error delete report:', error.message || error);
      return { success: false, error };
    }

    clearMissingTable('reports');
    console.log('[SUPABASE RESPONSE] Sukses delete report id:', id);
    return { success: true, error: null };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('reports');
      return {
        success: false,
        error: {
          message: "Tabel 'reports' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
          isTableMissing: true,
          originalError: err,
        },
      };
    }
    console.warn('[SUPABASE RESPONSE] Exception deleteReport:', err?.message || err);
    return { success: false, error: err };
  }
}

// ============================================================
// 7. VIDEOS (CMS Video Beranda)
// ============================================================
export async function fetchVideosFromSupabase(): Promise<{ data: VideoItem[] | null; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { data: null, error: 'Supabase client not configured' };
    }

    const { data, error } = await client
      .from('videos')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      if (isTableMissingError(error)) {
        registerMissingTable('videos');
        console.warn(`[CMS FETCH] Tabel 'videos' belum ada di database Supabase (skema belum dimigrasikan). Menggunakan data default aplikasi.`);
      } else {
        console.warn('[CMS FETCH] Peringatan saat mengambil videos:', error.message || error);
      }
      return { data: null, error };
    }

    clearMissingTable('videos');

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    const videos: VideoItem[] = data.map((row: any) => ({
      id: String(row.id),
      title: row.title || 'Video Kegiatan',
      description: row.description || '',
      youtube_url: row.youtube_url || '',
      thumbnail_url: row.thumbnail_url || '',
      sort_order: typeof row.sort_order === 'number' ? row.sort_order : 0,
      is_active: row.is_active !== false,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    console.log(`[CMS FETCH] Videos diterima dari Supabase: ${videos.length} video`);
    return { data: videos, error: null };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('videos');
      console.warn(`[CMS FETCH] Tabel 'videos' belum ada di Supabase. Menggunakan data default.`);
    } else {
      console.warn('[CMS FETCH] Exception fetching videos:', err?.message || err);
    }
    return { data: null, error: err };
  }
}

export async function upsertVideoToSupabase(video: VideoItem): Promise<{ success: boolean; data?: VideoItem; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const payload: Record<string, any> = {
      title: video.title.trim(),
      description: video.description || '',
      youtube_url: video.youtube_url.trim(),
      thumbnail_url: video.thumbnail_url || '',
      sort_order: typeof video.sort_order === 'number' ? video.sort_order : 0,
      is_active: video.is_active !== false,
      updated_at: new Date().toISOString(),
    };

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(video.id);
    console.log('[CMS SAVE] Payload yang dikirim (Video):', { id: video.id, isUUID, ...payload });

    let resData: any = null;
    let resError: any = null;

    if (isUUID) {
      const { data, error } = await client
        .from('videos')
        .upsert({ id: video.id, ...payload }, { onConflict: 'id' })
        .select()
        .single();
      resData = data;
      resError = error;
    } else {
      const { data, error } = await client
        .from('videos')
        .insert([payload])
        .select()
        .single();
      resData = data;
      resError = error;
    }

    if (resError) {
      if (isTableMissingError(resError)) {
        registerMissingTable('videos');
        return {
          success: false,
          error: {
            message: "Tabel 'videos' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
            isTableMissing: true,
            originalError: resError,
          },
        };
      }
      console.warn('[SUPABASE RESPONSE] Error upsert video:', resError.message || resError);
      return { success: false, error: resError };
    }

    clearMissingTable('videos');
    console.log('[SUPABASE RESPONSE] Sukses upsert video:', resData);
    const updatedVideo: VideoItem = {
      id: String(resData.id),
      title: resData.title || video.title,
      description: resData.description || '',
      youtube_url: resData.youtube_url || video.youtube_url,
      thumbnail_url: resData.thumbnail_url || '',
      sort_order: resData.sort_order ?? video.sort_order ?? 0,
      is_active: resData.is_active !== false,
      created_at: resData.created_at,
      updated_at: resData.updated_at,
    };

    return { success: true, data: updatedVideo, error: null };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('videos');
      return {
        success: false,
        error: {
          message: "Tabel 'videos' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
          isTableMissing: true,
          originalError: err,
        },
      };
    }
    console.warn('[SUPABASE RESPONSE] Exception upsertVideo:', err?.message || err);
    return { success: false, error: err };
  }
}

export async function deleteVideoFromSupabase(id: string, fallbackYoutubeUrl?: string): Promise<{ success: boolean; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    console.log('[CMS SAVE] Delete Video id:', id, 'isUUID:', isUUID, 'fallbackYoutubeUrl:', fallbackYoutubeUrl);

    let error: any = null;
    if (isUUID) {
      const res = await client.from('videos').delete().eq('id', id);
      error = res.error;
    } else if (fallbackYoutubeUrl) {
      const res = await client.from('videos').delete().eq('youtube_url', fallbackYoutubeUrl);
      error = res.error;
    }

    if (error) {
      if (isTableMissingError(error)) {
        registerMissingTable('videos');
        return {
          success: false,
          error: {
            message: "Tabel 'videos' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
            isTableMissing: true,
            originalError: error,
          },
        };
      }
      console.warn('[SUPABASE RESPONSE] Error delete video:', error.message || error);
      return { success: false, error };
    }

    clearMissingTable('videos');
    console.log('[SUPABASE RESPONSE] Sukses delete video id:', id);
    return { success: true, error: null };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('videos');
      return {
        success: false,
        error: {
          message: "Tabel 'videos' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
          isTableMissing: true,
          originalError: err,
        },
      };
    }
    console.warn('[SUPABASE RESPONSE] Exception deleteVideo:', err?.message || err);
    return { success: false, error: err };
  }
}

// ============================================================
// 8. DOCUMENTATIONS (Dokumentasi Kegiatan & Carousel)
// ============================================================
export async function fetchDocumentationsFromSupabase(): Promise<{ data: DocumentationItem[] | null; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { data: null, error: 'Supabase client not configured' };
    }

    const { data, error } = await client
      .from('documentations')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      if (isTableMissingError(error)) {
        registerMissingTable('documentations');
        console.warn(`[CMS FETCH] Tabel 'documentations' belum ada di database Supabase (skema belum dimigrasikan). Menggunakan data default aplikasi.`);
      } else {
        console.warn('[CMS FETCH] Peringatan saat mengambil documentations:', error.message || error);
      }
      return { data: null, error };
    }

    clearMissingTable('documentations');

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    const docs: DocumentationItem[] = data.map((row: any, idx: number) => ({
      id: String(row.id),
      title: row.title || 'Dokumentasi Lapangan',
      caption: row.caption || row.story || '',
      programName: row.program_name || '',
      category: row.category || 'Dokumentasi',
      date: row.activity_date || row.date || 'Dokumentasi Lapangan',
      location: row.location || 'Garut',
      imageUrl: row.image_url || '',
      story: row.story || row.caption || '',
      targetBeneficiary: row.target_beneficiary || '',
      videoUrl: row.video_url || '',
      sort_order: typeof row.sort_order === 'number' ? row.sort_order : idx + 1,
      is_active: row.is_active !== false,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    console.log(`[CMS FETCH] Documentations diterima dari Supabase: ${docs.length} item`);
    return { data: docs, error: null };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('documentations');
      console.warn(`[CMS FETCH] Tabel 'documentations' belum ada di Supabase. Menggunakan data default.`);
    } else {
      console.warn('[CMS FETCH] Exception fetching documentations:', err?.message || err);
    }
    return { data: null, error: err };
  }
}

export async function upsertDocumentationToSupabase(doc: DocumentationItem): Promise<{ success: boolean; data?: DocumentationItem; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const payload: Record<string, any> = {
      title: doc.title.trim(),
      caption: doc.caption || doc.story || '',
      program_name: doc.programName || '',
      category: doc.category || 'Dokumentasi',
      activity_date: doc.date || 'Dokumentasi Lapangan',
      location: doc.location || 'Kabupaten Garut',
      image_url: doc.imageUrl,
      story: doc.story || doc.caption || '',
      target_beneficiary: doc.targetBeneficiary || '',
      video_url: doc.videoUrl || null,
      sort_order: typeof doc.sort_order === 'number' ? doc.sort_order : 0,
      is_active: doc.is_active !== false,
      updated_at: new Date().toISOString(),
    };

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doc.id);
    console.log('[CMS SAVE] Payload yang dikirim (Documentation):', { id: doc.id, isUUID, ...payload });

    let resData: any = null;
    let resError: any = null;

    if (isUUID) {
      const { data, error } = await client
        .from('documentations')
        .upsert({ id: doc.id, ...payload }, { onConflict: 'id' })
        .select()
        .single();
      resData = data;
      resError = error;
    } else {
      const { data, error } = await client
        .from('documentations')
        .insert([payload])
        .select()
        .single();
      resData = data;
      resError = error;
    }

    if (resError) {
      if (isTableMissingError(resError)) {
        registerMissingTable('documentations');
        return {
          success: false,
          error: {
            message: "Tabel 'documentations' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
            isTableMissing: true,
            originalError: resError,
          },
        };
      }
      console.warn('[SUPABASE RESPONSE] Error upsert documentation:', resError.message || resError);
      return { success: false, error: resError };
    }

    clearMissingTable('documentations');
    console.log('[SUPABASE RESPONSE] Sukses upsert documentation:', resData);
    const updatedDoc: DocumentationItem = {
      id: String(resData.id),
      title: resData.title || doc.title,
      caption: resData.caption || doc.caption || '',
      programName: resData.program_name || '',
      category: resData.category || 'Dokumentasi',
      date: resData.activity_date || doc.date || 'Dokumentasi Lapangan',
      location: resData.location || 'Kabupaten Garut',
      imageUrl: resData.image_url || doc.imageUrl,
      story: resData.story || doc.story || '',
      targetBeneficiary: resData.target_beneficiary || '',
      videoUrl: resData.video_url || '',
      sort_order: resData.sort_order ?? doc.sort_order ?? 0,
      is_active: resData.is_active !== false,
      created_at: resData.created_at,
      updated_at: resData.updated_at,
    };

    return { success: true, data: updatedDoc, error: null };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('documentations');
      return {
        success: false,
        error: {
          message: "Tabel 'documentations' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
          isTableMissing: true,
          originalError: err,
        },
      };
    }
    console.warn('[SUPABASE RESPONSE] Exception upsertDocumentation:', err?.message || err);
    return { success: false, error: err };
  }
}

export async function deleteDocumentationFromSupabase(id: string, fallbackImageUrl?: string): Promise<{ success: boolean; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    console.log('[CMS SAVE] Delete Documentation id:', id, 'isUUID:', isUUID, 'fallbackImageUrl:', fallbackImageUrl);

    let error: any = null;
    if (isUUID) {
      const res = await client.from('documentations').delete().eq('id', id);
      error = res.error;
    } else if (fallbackImageUrl) {
      const res = await client.from('documentations').delete().eq('image_url', fallbackImageUrl);
      error = res.error;
    }

    if (error) {
      if (isTableMissingError(error)) {
        registerMissingTable('documentations');
        return {
          success: false,
          error: {
            message: "Tabel 'documentations' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
            isTableMissing: true,
            originalError: error,
          },
        };
      }
      console.warn('[SUPABASE RESPONSE] Error delete documentation:', error.message || error);
      return { success: false, error };
    }

    clearMissingTable('documentations');
    console.log('[SUPABASE RESPONSE] Sukses delete documentation id:', id);
    return { success: true, error: null };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('documentations');
      return {
        success: false,
        error: {
          message: "Tabel 'documentations' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
          isTableMissing: true,
          originalError: err,
        },
      };
    }
    console.warn('[SUPABASE RESPONSE] Exception deleteDocumentation:', err?.message || err);
    return { success: false, error: err };
  }
}

// ============================================================
// 9. BACKGROUND MUSIC SETTINGS
// ============================================================
export async function fetchMusicSettingsFromSupabase(): Promise<{ data: MusicSettings | null; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { data: null, error: 'Supabase client not configured' };
    }

    const { data, error } = await client
      .from('music_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isTableMissingError(error)) {
        registerMissingTable('music_settings');
        console.warn(`[CMS FETCH] Tabel 'music_settings' belum ada di database Supabase (skema belum dimigrasikan). Menggunakan data default aplikasi.`);
      } else {
        console.warn('[CMS FETCH] Peringatan saat mengambil music_settings:', error.message || error);
      }
      return { data: null, error };
    }

    clearMissingTable('music_settings');

    if (!data) {
      return { data: null, error: null };
    }

    const music: MusicSettings = {
      music_enabled: data.music_enabled !== false,
      youtube_url: data.youtube_url || 'https://www.youtube.com/watch?v=eLHYWmZEiHs&list=RDeLHYWmZEiHs&start_radio=1',
      autoplay_enabled: data.autoplay_enabled !== false,
      loop_enabled: data.loop_enabled !== false,
      default_volume: typeof data.default_volume === 'number' ? data.default_volume : 40,
      title: data.title || 'Alunan Penyejuk Jiwa - IRSYADUL AMAL',
      updated_at: data.updated_at,
    };

    console.log('[CMS FETCH] Music Settings diterima dari Supabase:', music);
    return { data: music, error: null };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('music_settings');
      console.warn(`[CMS FETCH] Tabel 'music_settings' belum ada di Supabase. Menggunakan data default.`);
    } else {
      console.warn('[CMS FETCH] Exception fetching music_settings:', err?.message || err);
    }
    return { data: null, error: err };
  }
}

export async function saveMusicSettingsToSupabase(music: MusicSettings): Promise<{ success: boolean; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const { data: existing, error: checkError } = await client
      .from('music_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (checkError && isTableMissingError(checkError)) {
      registerMissingTable('music_settings');
      return {
        success: false,
        error: {
          message: "Tabel 'music_settings' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
          isTableMissing: true,
          originalError: checkError,
        },
      };
    }

    const payload: Record<string, any> = {
      music_enabled: music.music_enabled,
      youtube_url: music.youtube_url,
      autoplay_enabled: music.autoplay_enabled,
      loop_enabled: music.loop_enabled,
      default_volume: music.default_volume,
      title: music.title || 'Alunan Penyejuk Jiwa - IRSYADUL AMAL',
      updated_at: new Date().toISOString(),
    };

    console.log('[CMS SAVE] Payload yang dikirim (Music Settings):', payload);

    if (existing?.id) {
      payload.id = existing.id;
    }

    const { error } = await client
      .from('music_settings')
      .upsert(payload);

    if (error) {
      if (isTableMissingError(error)) {
        registerMissingTable('music_settings');
        return {
          success: false,
          error: {
            message: "Tabel 'music_settings' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
            isTableMissing: true,
            originalError: error,
          },
        };
      }
      console.warn('[SUPABASE RESPONSE] Error save music_settings:', error.message || error);
      return { success: false, error };
    }

    clearMissingTable('music_settings');
    console.log('[SUPABASE RESPONSE] Sukses save music_settings');
    return { success: true, error: null };
  } catch (err: any) {
    if (isTableMissingError(err)) {
      registerMissingTable('music_settings');
      return {
        success: false,
        error: {
          message: "Tabel 'music_settings' belum dibuat di database Supabase Anda. Silakan jalankan Skema SQL di SQL Editor Supabase.",
          isTableMissing: true,
          originalError: err,
        },
      };
    }
    console.warn('[SUPABASE RESPONSE] Exception saveMusicSettings:', err?.message || err);
    return { success: false, error: err };
  }
}
