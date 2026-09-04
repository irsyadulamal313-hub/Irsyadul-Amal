import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Layers,
  HeartHandshake,
  FileSpreadsheet,
  PhoneCall,
  Image as ImageIcon,
  Settings,
  LogOut,
  Globe,
  Menu,
  X,
  ShieldCheck,
  CheckCircle2,
  FolderOpen,
  CreditCard,
  MessageSquare,
  Users,
  Eye,
  Database,
  PlusCircle,
  ChevronRight,
} from 'lucide-react';
import { useCMS } from '../../data/cmsContext';
import { IrsyadulAmalLogo } from '../IrsyadulAmalLogo';

export type AdminMenuKey =
  | 'dashboard'
  // KONTEN WEBSITE
  | 'content'
  | 'content_beranda'
  | 'content_tentang'
  | 'content_banner'
  | 'content_cta'
  | 'content_footer'
  | 'content_sections'
  // PROGRAM
  | 'programs'
  | 'program_add'
  | 'categories'
  | 'documentations'
  // DONASI
  | 'donations'
  | 'donors'
  | 'bank_accounts'
  // LAPORAN
  | 'reports'
  | 'report_add'
  | 'report_docs'
  // CALL CENTER
  | 'call_center'
  | 'call_whatsapp'
  | 'call_address'
  | 'call_services'
  // MEDIA
  | 'media'
  | 'media_gallery'
  | 'media_photos'
  | 'media_banner'
  // PENGATURAN
  | 'settings'
  | 'settings_identity'
  | 'settings_nav'
  | 'settings_seo'
  | 'settings_admin'
  // SUPABASE
  | 'supabase_schema';

interface AdminLayoutProps {
  activeMenu: AdminMenuKey;
  onSelectMenu: (menu: AdminMenuKey) => void;
  onReturnToPublic: () => void;
  children: React.ReactNode;
}

interface MenuItemDef {
  key: AdminMenuKey;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  subItems?: { key: AdminMenuKey; label: string }[];
}

interface MenuGroupDef {
  groupTitle: string;
  items: MenuItemDef[];
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeMenu,
  onSelectMenu,
  onReturnToPublic,
  children,
}) => {
  const { adminUser, logoutAdmin, isDraftModeActive, publishHomepageDraft } = useCMS();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const menuGroups: MenuGroupDef[] = [
    {
      groupTitle: 'DASHBOARD',
      items: [
        {
          key: 'dashboard',
          label: 'Dashboard Utama',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
      ],
    },
    {
      groupTitle: 'KONTEN WEBSITE',
      items: [
        {
          key: 'content',
          label: 'Kelola Konten',
          icon: <FileText className="w-4 h-4" />,
          subItems: [
            { key: 'content_beranda', label: 'Beranda' },
            { key: 'content_tentang', label: 'Tentang' },
            { key: 'content_banner', label: 'Banner' },
            { key: 'content_cta', label: 'CTA' },
            { key: 'content_footer', label: 'Footer' },
            { key: 'content_sections', label: 'Susunan Section' },
          ],
        },
      ],
    },
    {
      groupTitle: 'PROGRAM',
      items: [
        {
          key: 'programs',
          label: 'Program',
          icon: <Layers className="w-4 h-4" />,
          subItems: [
            { key: 'programs', label: 'Semua Program' },
            { key: 'program_add', label: 'Tambah Program' },
            { key: 'categories', label: 'Kategori' },
            { key: 'documentations', label: 'Dokumentasi' },
          ],
        },
      ],
    },
    {
      groupTitle: 'DONASI',
      items: [
        {
          key: 'donations',
          label: 'Donasi & Rekening',
          icon: <HeartHandshake className="w-4 h-4" />,
          subItems: [
            { key: 'donations', label: 'Donasi' },
            { key: 'donors', label: 'Donatur' },
            { key: 'bank_accounts', label: 'Rekening' },
          ],
        },
      ],
    },
    {
      groupTitle: 'LAPORAN',
      items: [
        {
          key: 'reports',
          label: 'Laporan',
          icon: <FileSpreadsheet className="w-4 h-4" />,
          subItems: [
            { key: 'reports', label: 'Semua Laporan' },
            { key: 'report_add', label: 'Tambah Laporan' },
            { key: 'report_docs', label: 'Dokumentasi' },
          ],
        },
      ],
    },
    {
      groupTitle: 'CALL CENTER',
      items: [
        {
          key: 'call_center',
          label: 'Call Center',
          icon: <PhoneCall className="w-4 h-4" />,
          subItems: [
            { key: 'call_whatsapp', label: 'WhatsApp' },
            { key: 'call_address', label: 'Alamat' },
            { key: 'call_services', label: 'Informasi Layanan' },
          ],
        },
      ],
    },
    {
      groupTitle: 'MEDIA',
      items: [
        {
          key: 'media',
          label: 'Media Library',
          icon: <ImageIcon className="w-4 h-4" />,
          subItems: [
            { key: 'media_gallery', label: 'Galeri' },
            { key: 'media_photos', label: 'Foto' },
            { key: 'media_banner', label: 'Banner' },
          ],
        },
      ],
    },
    {
      groupTitle: 'PENGATURAN',
      items: [
        {
          key: 'settings',
          label: 'Pengaturan',
          icon: <Settings className="w-4 h-4" />,
          subItems: [
            { key: 'settings_identity', label: 'Identitas Lembaga' },
            { key: 'settings_nav', label: 'Navigasi' },
            { key: 'settings_seo', label: 'SEO' },
            { key: 'settings_admin', label: 'Admin' },
          ],
        },
        {
          key: 'supabase_schema',
          label: 'Database Supabase',
          icon: <Database className="w-4 h-4" />,
          badge: 'SQL Ready',
        },
      ],
    },
  ];

  const handleMenuClick = (key: AdminMenuKey) => {
    onSelectMenu(key);
    setIsMobileSidebarOpen(false);
  };

  const handlePublishDraft = () => {
    publishHomepageDraft();
    setToastMessage('Draft berhasil dipublikasikan ke website publik!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#F4F9F9] flex flex-col md:flex-row text-gray-800">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Bar on Mobile */}
      <div className="md:hidden bg-[#008284] text-white p-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <IrsyadulAmalLogo size={28} className="brightness-125" />
            <span className="font-extrabold text-sm tracking-tight">CMS IRSYADUL AMAL</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onReturnToPublic}
          className="px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-bold flex items-center gap-1.5"
        >
          <Globe className="w-3.5 h-3.5" />
          Web Publik
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Drawer */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-72 bg-white border-r border-[#D8E6E6] flex flex-col justify-between shadow-lg md:shadow-none transition-transform duration-200 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#EAF2F2]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <IrsyadulAmalLogo size={36} />
              <div>
                <h1 className="font-extrabold text-sm text-[#008284] leading-tight">IRSYADUL AMAL</h1>
                <p className="text-[10px] text-[#647B7C] font-semibold">CMS & Dashboard Admin</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Return to Public Website */}
          <button
            type="button"
            onClick={onReturnToPublic}
            className="mt-3.5 w-full py-2 px-3 rounded-xl bg-[#E6F4F4] hover:bg-[#D4EFEF] text-[#008284] font-extrabold text-xs flex items-center justify-center gap-2 transition-colors border border-[#BDE3E3]"
          >
            <Globe className="w-3.5 h-3.5" />
            Lihat Website Publik
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div className="p-3 flex-1 overflow-y-auto space-y-4 text-xs font-semibold">
          {menuGroups.map((group) => (
            <div key={group.groupTitle} className="space-y-1">
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-[#859E9E]">
                {group.groupTitle}
              </p>
              {group.items.map((item) => {
                const isGroupActive =
                  activeMenu === item.key ||
                  item.subItems?.some((sub) => sub.key === activeMenu);

                return (
                  <div key={item.key} className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => handleMenuClick(item.key)}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all ${
                        isGroupActive
                          ? 'bg-[#008284] text-white font-bold shadow-2xs'
                          : 'text-[#071F20] hover:bg-[#F0FAFA] hover:text-[#008284]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isGroupActive ? 'text-white' : 'text-[#008284]'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-400 text-gray-900">
                          {item.badge}
                        </span>
                      )}
                    </button>

                    {/* Sub items */}
                    {item.subItems && (
                      <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-teal-100 ml-4">
                        {item.subItems.map((sub) => {
                          const isSubActive = activeMenu === sub.key;
                          return (
                            <button
                              key={sub.key}
                              type="button"
                              onClick={() => handleMenuClick(sub.key)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-2 transition-colors ${
                                isSubActive
                                  ? 'text-[#008284] font-black bg-teal-50/80 border-l-2 border-[#008284]'
                                  : 'text-gray-600 hover:text-[#008284] hover:bg-gray-50'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSubActive ? 'bg-[#008284]' : 'bg-gray-300'
                                }`}
                              />
                              <span>{sub.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer / User Info & Logout */}
        <div className="p-3 border-t border-[#EAF2F2] bg-[#FAFCFC] space-y-2">
          {isDraftModeActive && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-900">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                  Mode Draft Aktif
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                  Belum Live
                </span>
              </div>
              <button
                type="button"
                onClick={handlePublishDraft}
                className="w-full py-1.5 px-2 bg-[#008284] hover:bg-[#006E70] text-white rounded-lg text-[11px] font-bold shadow-2xs transition-colors"
              >
                Publikasikan Sekarang
              </button>
            </div>
          )}

          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E0EAEA]">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-[#008284] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {adminUser?.username?.slice(0, 1).toUpperCase() || 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[#071F20] truncate">
                  {adminUser?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  {adminUser?.role === 'superadmin' ? 'Super Admin' : 'Pengelola'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logoutAdmin}
              className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar desktop */}
        <header className="hidden md:flex bg-white border-b border-[#EAF2F2] px-8 py-3.5 items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#647B7C]">
            <span>CMS IRSYADUL AMAL</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[#008284] font-bold uppercase">{activeMenu.replace('_', ' ')}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onReturnToPublic}
              className="px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-[#008284] text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              Website Publik
            </button>
          </div>
        </header>

        {/* Page Body */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
};
