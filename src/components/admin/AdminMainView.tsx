import React, { useState } from 'react';
import { AdminLayout, AdminMenuKey } from './AdminLayout';
import { AdminDashboardHome } from './AdminDashboardHome';
import { AdminContentSection } from './AdminContentSection';
import { AdminProgramsSection } from './AdminProgramsSection';
import { AdminCategoriesSection } from './AdminCategoriesSection';
import { AdminDonationsSection } from './AdminDonationsSection';
import { AdminDonorsSection } from './AdminDonorsSection';
import { AdminBankAccountsSection } from './AdminBankAccountsSection';
import { AdminWhatsAppSection } from './AdminWhatsAppSection';
import { AdminReportsSection } from './AdminReportsSection';
import { AdminDocumentationSection } from './AdminDocumentationSection';
import { AdminMediaSection } from './AdminMediaSection';
import { AdminSettingsSection } from './AdminSettingsSection';
import { AdminSupabaseSchemaView } from './AdminSupabaseSchemaView';

interface AdminMainViewProps {
  onReturnToPublic: () => void;
}

export const AdminMainView: React.FC<AdminMainViewProps> = ({ onReturnToPublic }) => {
  const [activeMenu, setActiveMenu] = useState<AdminMenuKey>('dashboard');

  return (
    <AdminLayout
      activeMenu={activeMenu}
      onSelectMenu={(menu) => setActiveMenu(menu)}
      onReturnToPublic={onReturnToPublic}
    >
      {activeMenu === 'dashboard' && (
        <AdminDashboardHome onNavigateMenu={(menu) => setActiveMenu(menu)} />
      )}

      {/* KONTEN WEBSITE */}
      {activeMenu === 'content' && <AdminContentSection initialTab="beranda" />}
      {activeMenu === 'content_beranda' && <AdminContentSection initialTab="beranda" />}
      {activeMenu === 'content_tentang' && <AdminContentSection initialTab="tentang" />}
      {activeMenu === 'content_banner' && <AdminContentSection initialTab="banner" />}
      {activeMenu === 'content_cta' && <AdminContentSection initialTab="cta" />}
      {activeMenu === 'content_footer' && <AdminContentSection initialTab="footer" />}
      {activeMenu === 'content_sections' && <AdminContentSection initialTab="sections" />}

      {/* PROGRAM */}
      {(activeMenu === 'programs' || activeMenu === 'program_add') && <AdminProgramsSection />}
      {activeMenu === 'categories' && <AdminCategoriesSection />}
      {activeMenu === 'documentations' && <AdminDocumentationSection />}

      {/* DONASI */}
      {activeMenu === 'donations' && <AdminDonationsSection />}
      {activeMenu === 'donors' && <AdminDonorsSection />}
      {activeMenu === 'bank_accounts' && <AdminBankAccountsSection />}

      {/* LAPORAN */}
      {(activeMenu === 'reports' || activeMenu === 'report_add') && <AdminReportsSection />}
      {activeMenu === 'report_docs' && <AdminDocumentationSection />}

      {/* CALL CENTER */}
      {activeMenu === 'call_center' && <AdminWhatsAppSection />}
      {activeMenu === 'call_whatsapp' && <AdminWhatsAppSection />}
      {activeMenu === 'call_address' && <AdminSettingsSection subTab="identity" />}
      {activeMenu === 'call_services' && <AdminSettingsSection subTab="identity" />}

      {/* MEDIA */}
      {activeMenu === 'media' && <AdminMediaSection />}
      {activeMenu === 'media_gallery' && <AdminMediaSection categoryFilter="Galeri" />}
      {activeMenu === 'media_photos' && <AdminMediaSection categoryFilter="Program" />}
      {activeMenu === 'media_banner' && <AdminMediaSection categoryFilter="Banner" />}

      {/* PENGATURAN */}
      {activeMenu === 'settings' && <AdminSettingsSection subTab="identity" />}
      {activeMenu === 'settings_identity' && <AdminSettingsSection subTab="identity" />}
      {activeMenu === 'settings_nav' && <AdminSettingsSection subTab="nav" />}
      {activeMenu === 'settings_seo' && <AdminSettingsSection subTab="seo" />}
      {activeMenu === 'settings_admin' && <AdminSettingsSection subTab="admin" />}

      {/* SUPABASE */}
      {activeMenu === 'supabase_schema' && <AdminSupabaseSchemaView />}
    </AdminLayout>
  );
};
