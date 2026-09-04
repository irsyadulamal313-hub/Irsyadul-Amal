import React from 'react';
import { Home, Heart, Layers, FileText, PhoneCall } from 'lucide-react';
import { NavPage } from '../types';

interface BottomNavigationProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentPage,
  onNavigate,
}) => {
  const tabs: { key: NavPage; label: string; icon: React.ReactNode }[] = [
    { key: 'beranda', label: 'Beranda', icon: <Home className="w-5 h-5" /> },
    { key: 'donasi', label: 'Donasi', icon: <Heart className="w-5 h-5" /> },
    { key: 'program', label: 'Program', icon: <Layers className="w-5 h-5" /> },
    { key: 'laporan', label: 'Laporan', icon: <FileText className="w-5 h-5" /> },
    { key: 'call_center', label: 'Call Center', icon: <PhoneCall className="w-5 h-5" /> },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Smartphone"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E0EAEA] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto px-1">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                onNavigate(tab.key);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1 px-0.5 transition-all duration-150 relative ${
                isActive
                  ? 'text-[#008284] font-bold'
                  : 'text-gray-500 hover:text-[#008284] font-medium'
              }`}
            >
              {/* Active indicator top bar */}
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-[#008284] rounded-full" />
              )}
              <div
                className={`p-1 rounded-full transition-transform ${
                  isActive ? 'scale-110 text-[#008284]' : ''
                }`}
              >
                {tab.icon}
              </div>
              <span className="text-[10px] leading-tight tracking-tight whitespace-nowrap mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
