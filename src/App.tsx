import React, { useState, useEffect } from 'react';
import { NavPage, ProgramItem, DocumentationItem } from './types';
import { useCMS } from './data/cmsContext';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { DonationPage } from './pages/DonationPage';
import { ProgramPage } from './pages/ProgramPage';
import { ReportPage } from './pages/ReportPage';
import { CallCenterPage } from './pages/CallCenterPage';
import { ProgramDetailModal } from './components/ProgramDetailModal';
import { DonationActionModal } from './components/DonationActionModal';
import { AdminMainView } from './components/admin/AdminMainView';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { AdminSetupView } from './components/admin/AdminSetupView';
import { AdminForgotPasswordView } from './components/admin/AdminForgotPasswordView';
import { AdminResetPasswordView } from './components/admin/AdminResetPasswordView';
import { X, MapPin, Calendar } from 'lucide-react';

export type AppRoute =
  | 'public'
  | 'admin'
  | 'admin_login'
  | 'admin_setup'
  | 'admin_forgot_password'
  | 'reset_password';

function parseCurrentRoute(): AppRoute {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  // KETENTUAN 4 & 5: Deteksi route /reset-password dan sesi recovery
  if (
    path === '/reset-password' ||
    path.startsWith('/reset-password') ||
    hash === '#/reset-password' ||
    hash.startsWith('#/reset-password') ||
    hash === '#reset-password' ||
    hash.startsWith('#reset-password') ||
    path === '/admin/reset-password' ||
    hash === '#/admin/reset-password' ||
    hash === '#admin/reset-password' ||
    window.location.hash.includes('type=recovery')
  ) {
    return 'reset_password';
  }
  if (path === '/admin/setup' || hash === '#/admin/setup' || hash === '#admin/setup') {
    return 'admin_setup';
  }
  if (
    path === '/admin/forgot-password' ||
    hash === '#/admin/forgot-password' ||
    hash === '#admin/forgot-password'
  ) {
    return 'admin_forgot_password';
  }
  if (path === '/admin/login' || hash === '#/admin/login' || hash === '#admin/login') {
    return 'admin_login';
  }
  if (path === '/admin' || hash === '#/admin' || hash === '#admin' || path.startsWith('/admin/')) {
    return 'admin';
  }
  return 'public';
}

export default function App() {
  const { programs, isAdminLoggedIn } = useCMS();
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(parseCurrentRoute);
  const [currentPage, setCurrentPage] = useState<NavPage>('beranda');

  // Modals state
  const [selectedProgramDetail, setSelectedProgramDetail] = useState<ProgramItem | null>(null);
  const [quickDonationProgram, setQuickDonationProgram] = useState<ProgramItem | null>(null);
  const [isQuickDonationOpen, setIsQuickDonationOpen] = useState(false);
  const [selectedLightboxPhoto, setSelectedLightboxPhoto] = useState<DocumentationItem | null>(null);

  // Sync route with browser history
  const navigateToRoute = (route: AppRoute, updateHistory = true) => {
    setCurrentRoute(route);
    if (updateHistory) {
      let targetPath = '/';
      if (route === 'admin') targetPath = '/admin';
      else if (route === 'admin_login') targetPath = '/admin/login';
      else if (route === 'admin_setup') targetPath = '/admin/setup';
      else if (route === 'admin_forgot_password') targetPath = '/admin/forgot-password';
      else if (route === 'reset_password') targetPath = '/reset-password';

      window.history.pushState(null, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseCurrentRoute());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Handlers for public page navigation
  const handleNavigatePage = (page: NavPage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    navigateToRoute('admin_login');
  };

  const handleOpenQuickDonation = (program?: ProgramItem) => {
    setQuickDonationProgram(program || null);
    setIsQuickDonationOpen(true);
  };

  // 1. ADMIN SETUP VIEW (/admin/setup)
  if (currentRoute === 'admin_setup') {
    return (
      <AdminSetupView
        onReturnToLogin={() => navigateToRoute('admin_login')}
        onReturnToPublic={() => navigateToRoute('public')}
      />
    );
  }

  // 2. ADMIN FORGOT PASSWORD VIEW (/admin/forgot-password)
  if (currentRoute === 'admin_forgot_password') {
    return (
      <AdminForgotPasswordView
        onReturnToLogin={() => navigateToRoute('admin_login')}
        onReturnToPublic={() => navigateToRoute('public')}
      />
    );
  }

  // 3. RESET PASSWORD VIEW (/reset-password)
  if (currentRoute === 'reset_password') {
    return (
      <AdminResetPasswordView
        onReturnToLogin={() => navigateToRoute('admin_login')}
        onReturnToPublic={() => navigateToRoute('public')}
        onGoToForgotPassword={() => navigateToRoute('admin_forgot_password')}
      />
    );
  }

  // 4. ADMIN LOGIN VIEW (/admin/login)
  if (currentRoute === 'admin_login') {
    if (isAdminLoggedIn) {
      // Already authenticated, redirect to /admin
      navigateToRoute('admin', false);
      return null;
    }
    return (
      <AdminLoginView
        onReturnToPublic={() => navigateToRoute('public')}
        onLoginSuccess={() => navigateToRoute('admin')}
        onGoToSetup={() => navigateToRoute('admin_setup')}
        onGoToForgotPassword={() => navigateToRoute('admin_forgot_password')}
      />
    );
  }

  // 5. ADMIN DASHBOARD VIEW (/admin)
  if (currentRoute === 'admin') {
    if (!isAdminLoggedIn) {
      // Not authenticated, redirect to /admin/login
      navigateToRoute('admin_login', false);
      return null;
    }
    return (
      <AdminMainView onReturnToPublic={() => navigateToRoute('public')} />
    );
  }

  // 3. PUBLIC WEBSITE VIEW (/)
  return (
    <div className="min-h-screen bg-[#F0FAFA] text-[#071F20] font-sans flex flex-col selection:bg-[#008284] selection:text-white">
      {/* 1. TOP HEADER with 5 Navigation Menus + Visible "⚙ Admin" button */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigatePage}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* 2. MAIN PAGE CONTENT */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentPage === 'beranda' && (
          <HomePage
            programs={programs}
            onNavigate={handleNavigatePage}
            onSelectProgramDetail={(prog) => setSelectedProgramDetail(prog)}
            onOpenQuickDonation={handleOpenQuickDonation}
          />
        )}

        {currentPage === 'donasi' && (
          <DonationPage
            programs={programs}
            onSelectProgramDetail={(prog) => setSelectedProgramDetail(prog)}
            onOpenQuickDonation={handleOpenQuickDonation}
          />
        )}

        {currentPage === 'program' && (
          <ProgramPage
            programs={programs}
            onSelectProgramDetail={(prog) => setSelectedProgramDetail(prog)}
            onOpenQuickDonation={handleOpenQuickDonation}
          />
        )}

        {currentPage === 'laporan' && (
          <ReportPage
            onOpenPhotoLightbox={(photo) => setSelectedLightboxPhoto(photo)}
          />
        )}

        {currentPage === 'call_center' && <CallCenterPage />}
      </main>

      {/* 3. FOOTER */}
      <Footer
        onNavigate={handleNavigatePage}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* 4. MOBILE BOTTOM NAVIGATION (EXACT 5 MENUS) */}
      <BottomNavigation
        currentPage={currentPage}
        onNavigate={handleNavigatePage}
      />

      {/* 5. FLOATING WHATSAPP BUTTON (ON ALL PAGES) */}
      <FloatingWhatsApp />

      {/* 6. MODALS */}
      {/* Detail Program Modal */}
      <ProgramDetailModal
        program={selectedProgramDetail}
        onClose={() => setSelectedProgramDetail(null)}
        onDonate={(prog) => {
          setSelectedProgramDetail(null);
          handleOpenQuickDonation(prog);
        }}
      />

      {/* Quick Donation Modal with exact bank accounts */}
      <DonationActionModal
        isOpen={isQuickDonationOpen}
        onClose={() => setIsQuickDonationOpen(false)}
        selectedProgram={quickDonationProgram}
        programs={programs}
      />

      {/* Photo Lightbox */}
      {selectedLightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedLightboxPhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-72 sm:h-96 bg-black">
              <img
                src={selectedLightboxPhoto.imageUrl}
                alt={selectedLightboxPhoto.title}
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => setSelectedLightboxPhoto(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-2 text-xs sm:text-sm">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#008284] bg-teal-50 px-2.5 py-0.5 rounded-full">
                {selectedLightboxPhoto.category}
              </span>
              <h3 className="font-extrabold text-base text-gray-900">
                {selectedLightboxPhoto.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {selectedLightboxPhoto.story}
              </p>
              <div className="pt-2 border-t border-gray-100 flex items-center gap-4 text-gray-500 text-xs">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#008284]" /> {selectedLightboxPhoto.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#008284]" /> {selectedLightboxPhoto.date}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
