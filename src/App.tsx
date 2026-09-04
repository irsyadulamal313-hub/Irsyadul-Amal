import React, { useState } from 'react';
import { NavPage, ProgramItem, DocumentationItem } from './types';
import { INITIAL_PROGRAMS } from './data/officialData';
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
import { AdminPanelModal } from './components/AdminPanelModal';
import { X, MapPin, Calendar } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('beranda');
  const [programs, setPrograms] = useState<ProgramItem[]>(INITIAL_PROGRAMS);

  // Modals state
  const [selectedProgramDetail, setSelectedProgramDetail] = useState<ProgramItem | null>(null);
  const [quickDonationProgram, setQuickDonationProgram] = useState<ProgramItem | null>(null);
  const [isQuickDonationOpen, setIsQuickDonationOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedLightboxPhoto, setSelectedLightboxPhoto] = useState<DocumentationItem | null>(null);

  // Handlers
  const handleNavigate = (page: NavPage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenQuickDonation = (program?: ProgramItem) => {
    setQuickDonationProgram(program || null);
    setIsQuickDonationOpen(true);
  };

  const handleAddProgram = (newProg: ProgramItem) => {
    setPrograms((prev) => [newProg, ...prev]);
  };

  const handleUpdateProgram = (updated: ProgramItem) => {
    setPrograms((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProgram = (id: string) => {
    setPrograms((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F0FAFA] text-[#071F20] font-sans flex flex-col selection:bg-[#008284] selection:text-white">
      {/* 1. TOP HEADER with 5 Navigation Menus */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* 2. MAIN PAGE CONTENT */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentPage === 'beranda' && (
          <HomePage
            programs={programs}
            onNavigate={handleNavigate}
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
        onNavigate={handleNavigate}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* 4. MOBILE BOTTOM NAVIGATION (EXACT 5 MENUS) */}
      <BottomNavigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
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

      {/* Admin Panel Modal (Supabase Ready) */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        programs={programs}
        onAddProgram={handleAddProgram}
        onUpdateProgram={handleUpdateProgram}
        onDeleteProgram={handleDeleteProgram}
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
                className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full"
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
