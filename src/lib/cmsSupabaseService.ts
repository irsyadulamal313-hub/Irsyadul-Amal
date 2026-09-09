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
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] Error fetching site_settings:', error.message);
      return { data: null, error };
    }

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

    return { data: settings, error: null };
  } catch (err: any) {
    console.warn('[Supabase] Exception fetching site_settings:', err?.message);
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
    const { data: existing } = await client
      .from('site_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

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

    if (existing?.id) {
      const { error } = await client
        .from('site_settings')
        .update(payload)
        .eq('id', existing.id);
      return { success: !error, error };
    } else {
      const { error } = await client
        .from('site_settings')
        .insert([payload]);
      return { success: !error, error };
    }
  } catch (err: any) {
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
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] Error fetching homepage_content:', error.message);
      return { data: null, error };
    }

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

    return { data: content, error: null };
  } catch (err: any) {
    console.warn('[Supabase] Exception fetching homepage_content:', err?.message);
    return { data: null, error: err };
  }
}

export async function saveHomepageContentToSupabase(content: HomepageContent): Promise<{ success: boolean; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const { data: existing } = await client
      .from('homepage_content')
      .select('id')
      .limit(1)
      .maybeSingle();

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

    if (existing?.id) {
      const { error } = await client
        .from('homepage_content')
        .update(payload)
        .eq('id', existing.id);
      return { success: !error, error };
    } else {
      const { error } = await client
        .from('homepage_content')
        .insert([payload]);
      return { success: !error, error };
    }
  } catch (err: any) {
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
      console.warn('[Supabase] Error fetching programs:', error.message);
      return { data: null, error };
    }

    if (!data) {
      return { data: [], error: null };
    }

    const items: ProgramItem[] = data.map((row: any, idx: number) => ({
      id: row.id,
      slug: row.slug || `program-${row.id}`,
      title: row.title || '',
      category: row.category_name || row.category || 'Sosial',
      status: row.status ? (row.status.toUpperCase() as any) : 'BERJALAN',
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
      isDraft: row.is_draft || row.status === 'Draft',
      order: row.display_order ?? row.order ?? idx + 1,
    }));

    return { data: items, error: null };
  } catch (err: any) {
    console.warn('[Supabase] Exception fetching programs:', err?.message);
    return { data: null, error: err };
  }
}

export async function upsertProgramToSupabase(prog: ProgramItem): Promise<{ success: boolean; data?: any; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const payload: Record<string, any> = {
      title: prog.title,
      slug: prog.slug || prog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category_name: prog.category,
      status: prog.status || 'BERJALAN',
      summary: prog.description,
      description: prog.fullStory || prog.description,
      background: prog.background || '',
      objectives: prog.objective || '',
      location: prog.location || 'Kabupaten Garut',
      target_recipients: prog.targetRecipients || 'Data akan diperbarui',
      target_amount_text: prog.targetAmountText || 'Target akan diperbarui',
      collected_amount_text: prog.collectedAmountText || 'Data donasi akan diperbarui',
      donors_count_text: prog.donorsCountText || 'Data akan diperbarui',
      deadline: prog.deadline || 'Program Berkelanjutan',
      latest_update: prog.latestUpdateText || '',
      image_url: prog.imageUrl,
      gallery_urls: prog.gallery || [],
      published: !prog.isDraft && prog.status !== 'DRAFT',
      is_draft: Boolean(prog.isDraft || prog.status === 'DRAFT'),
      updated_at: new Date().toISOString(),
    };

    // If id is a valid UUID, use it as primary key
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(prog.id);
    if (isUUID) {
      payload.id = prog.id;
    }

    const { data, error } = await client
      .from('programs')
      .upsert(payload, { onConflict: isUUID ? 'id' : 'slug' })
      .select()
      .maybeSingle();

    return { success: !error, data, error };
  } catch (err: any) {
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
    const query = client.from('programs').delete();
    const { error } = isUUID ? await query.eq('id', id) : await query.eq('slug', id);

    return { success: !error, error };
  } catch (err: any) {
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
      console.warn('[Supabase] Error fetching bank_accounts:', error.message);
      return { data: null, error };
    }

    if (!data) {
      return { data: [], error: null };
    }

    const items: BankAccountItem[] = data.map((row: any, idx: number) => ({
      id: row.id,
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

    return { data: items, error: null };
  } catch (err: any) {
    console.warn('[Supabase] Exception fetching bank_accounts:', err?.message);
    return { data: null, error: err };
  }
}

export async function upsertBankAccountToSupabase(acc: BankAccountItem): Promise<{ success: boolean; data?: any; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const payload: Record<string, any> = {
      bank_name: acc.bankName,
      account_number: acc.accountNumber,
      account_holder: acc.accountHolder,
      category: acc.category,
      description: acc.description || '',
      is_active: acc.isActive !== false,
      sort_order: acc.order || 0,
      updated_at: new Date().toISOString(),
    };

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(acc.id);
    if (isUUID) {
      payload.id = acc.id;
    }

    const { data, error } = await client
      .from('bank_accounts')
      .upsert(payload, { onConflict: isUUID ? 'id' : 'account_number' })
      .select()
      .maybeSingle();

    return { success: !error, data, error };
  } catch (err: any) {
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
    const query = client.from('bank_accounts').delete();
    const { error } = isUUID ? await query.eq('id', id) : await query.eq('account_number', id);

    return { success: !error, error };
  } catch (err: any) {
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
      console.warn('[Supabase] Error fetching reports:', error.message);
      return { data: null, error };
    }

    if (!data) {
      return { data: [], error: null };
    }

    const items: OfficialReportItem[] = data.map((row: any) => ({
      id: row.id,
      title: row.title || '',
      category: row.category || 'Laporan Donasi',
      period: row.period || '',
      publishDate: row.publish_date || row.created_at?.slice(0, 10) || '',
      fileSize: row.file_size || '',
      fileType: row.file_type || 'PDF',
      downloadUrl: row.download_url || row.file_url || '',
      fileUrl: row.file_url || row.download_url || '',
      description: row.description || '',
      published: row.published !== false,
      documentationUrls: row.documentation_urls || [],
    }));

    return { data: items, error: null };
  } catch (err: any) {
    console.warn('[Supabase] Exception fetching reports:', err?.message);
    return { data: null, error: err };
  }
}

export async function upsertReportToSupabase(rep: OfficialReportItem): Promise<{ success: boolean; data?: any; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const payload: Record<string, any> = {
      title: rep.title,
      category: rep.category,
      period: rep.period,
      publish_date: rep.publishDate || new Date().toISOString().slice(0, 10),
      file_size: rep.fileSize || 'Dokumen Resmi',
      file_type: rep.fileType || 'PDF',
      file_url: rep.fileUrl || rep.downloadUrl || '',
      download_url: rep.downloadUrl || rep.fileUrl || '',
      description: rep.description || '',
      published: rep.published !== false,
      updated_at: new Date().toISOString(),
    };

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rep.id);
    if (isUUID) {
      payload.id = rep.id;
    }

    const { data, error } = await client
      .from('reports')
      .upsert(payload, { onConflict: isUUID ? 'id' : undefined })
      .select()
      .maybeSingle();

    return { success: !error, data, error };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

export async function deleteReportFromSupabase(id: string): Promise<{ success: boolean; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const { error } = await client
      .from('reports')
      .delete()
      .eq('id', id);

    return { success: !error, error };
  } catch (err: any) {
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
      console.warn('[Supabase] Error fetching videos:', error.message);
      return { data: null, error };
    }

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

    return { data: videos, error: null };
  } catch (err: any) {
    console.warn('[Supabase] Exception fetching videos:', err?.message);
    return { data: null, error: err };
  }
}

export async function upsertVideoToSupabase(video: VideoItem): Promise<{ success: boolean; data?: any; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const payload: Record<string, any> = {
      title: video.title,
      description: video.description || '',
      youtube_url: video.youtube_url,
      thumbnail_url: video.thumbnail_url || '',
      sort_order: video.sort_order || 0,
      is_active: video.is_active !== false,
      updated_at: new Date().toISOString(),
    };

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(video.id);
    if (isUUID) {
      payload.id = video.id;
    }

    const { data, error } = await client
      .from('videos')
      .upsert(payload, { onConflict: isUUID ? 'id' : undefined })
      .select()
      .maybeSingle();

    return { success: !error, data, error };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

export async function deleteVideoFromSupabase(id: string): Promise<{ success: boolean; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const { error } = await client
      .from('videos')
      .delete()
      .eq('id', id);

    return { success: !error, error };
  } catch (err: any) {
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
      console.warn('[Supabase] Error fetching documentations:', error.message);
      return { data: null, error };
    }

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

    return { data: docs, error: null };
  } catch (err: any) {
    console.warn('[Supabase] Exception fetching documentations:', err?.message);
    return { data: null, error: err };
  }
}

export async function upsertDocumentationToSupabase(doc: DocumentationItem): Promise<{ success: boolean; data?: any; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const payload: Record<string, any> = {
      title: doc.title,
      caption: doc.caption || doc.story || '',
      program_name: doc.programName || '',
      category: doc.category || 'Dokumentasi',
      activity_date: doc.date || 'Dokumentasi Lapangan',
      location: doc.location || 'Kabupaten Garut',
      image_url: doc.imageUrl,
      story: doc.story || doc.caption || '',
      target_beneficiary: doc.targetBeneficiary || '',
      video_url: doc.videoUrl || null,
      sort_order: doc.sort_order || 0,
      is_active: doc.is_active !== false,
      updated_at: new Date().toISOString(),
    };

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doc.id);
    if (isUUID) {
      payload.id = doc.id;
    }

    const { data, error } = await client
      .from('documentations')
      .upsert(payload, { onConflict: isUUID ? 'id' : undefined })
      .select()
      .maybeSingle();

    return { success: !error, data, error };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

export async function deleteDocumentationFromSupabase(id: string): Promise<{ success: boolean; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const { error } = await client
      .from('documentations')
      .delete()
      .eq('id', id);

    return { success: !error, error };
  } catch (err: any) {
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
      console.warn('[Supabase] Error fetching music_settings:', error.message);
      return { data: null, error };
    }

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

    return { data: music, error: null };
  } catch (err: any) {
    console.warn('[Supabase] Exception fetching music_settings:', err?.message);
    return { data: null, error: err };
  }
}

export async function saveMusicSettingsToSupabase(music: MusicSettings): Promise<{ success: boolean; error: any }> {
  try {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase client not configured' };
    }

    const { data: existing } = await client
      .from('music_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    const payload: Record<string, any> = {
      music_enabled: music.music_enabled,
      youtube_url: music.youtube_url,
      autoplay_enabled: music.autoplay_enabled,
      loop_enabled: music.loop_enabled,
      default_volume: music.default_volume,
      title: music.title || 'Alunan Penyejuk Jiwa - IRSYADUL AMAL',
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      payload.id = existing.id;
    }

    const { error } = await client
      .from('music_settings')
      .upsert(payload);

    return { success: !error, error };
  } catch (err: any) {
    return { success: false, error: err };
  }
}
