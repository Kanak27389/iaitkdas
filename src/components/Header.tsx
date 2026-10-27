import React from 'react';
import {
  Home,
  GraduationCap,
  FileEdit,
  ShieldCheck,
  Shield,
  Info,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { TabType } from '../types';
import { IaitLogo } from './IaitLogo';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenStaffModal: () => void;
  onOpenAboutModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenStaffModal,
  onOpenAboutModal,
}) => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 pt-safe bg-[#f9f9ff]/98 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#dee8ff]/60">
      {/* Top Notification Strip */}
      <div className="bg-[#0f2b5c] text-white py-1.5 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between text-[11px] font-semibold tracking-wide">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[#ffddb8] text-[#2a1700] text-[10px] font-bold shrink-0">
              ADMISSIONS OPEN
            </span>
            <span className="truncate text-xs text-[#dee8ff]">
              Academic Session 2025-26 • Kaliabor, Nagaon (Assam) • ISO 9001:2015 Node
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-[#d9e2ff] text-xs">
            <a
              className="flex items-center gap-1 hover:text-white transition-colors"
              href="tel:+918638611886"
              title="Direct Helpline"
            >
              <Phone className="w-3 h-3 shrink-0" />
              <span className="font-semibold hidden xs:inline">+91 8638611886</span>
              <span className="font-semibold xs:hidden">Call</span>
            </a>
            <span className="text-white/30 hidden md:inline">|</span>
            <span className="hidden md:inline text-[11px] text-[#afc6ff]">
              iaitkaliabor@gmail.com
            </span>
          </div>
        </div>
      </div>

      {/* Main Brand & Action Bar */}
      <div className="px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo & Institute Name */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 sm:gap-3 min-w-0 text-left cursor-pointer group flex-1"
          aria-label="Go to IAIT Home"
        >
          <IaitLogo size="md" className="group-hover:scale-105 transition-transform shrink-0" />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-brand text-[14px] xs:text-[16px] sm:text-[20px] lg:text-[22px] text-[#00163d] leading-tight font-extrabold tracking-tight truncate">
                Icon Academy of Information Technology
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[12px] truncate">
              <span className="text-[#0051d5] font-bold tracking-wider uppercase shrink-0">
                IAIT Kaliabor
              </span>
              <span className="text-[#747780] hidden sm:inline">•</span>
              <span className="text-[#44464f] font-medium truncate hidden sm:inline">
                Govt. Certified & ISO 9001:2015 IT Center • Nagaon, Assam
              </span>
            </div>
          </div>
        </button>

        {/* Quick Header CTAs */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <a
            aria-label="Call Institution"
            className="h-9 sm:h-10 px-2 sm:px-3 flex items-center justify-center rounded-xl bg-[#dee8ff] text-[#00163d] hover:bg-[#d8e3fb] active:scale-95 transition-all shadow-xs gap-1.5 text-xs font-bold"
            href="tel:+918638611886"
            title="Call Helpline"
          >
            <Phone className="w-4 h-4 shrink-0 text-[#0051d5]" />
            <span className="hidden md:inline">Helpline</span>
          </a>

          <a
            aria-label="Chat on WhatsApp"
            className="h-9 sm:h-10 px-2 sm:px-3 flex items-center justify-center rounded-xl bg-[#eafaf1] text-[#15803d] hover:bg-[#dcfce7] active:scale-95 transition-all shadow-xs gap-1.5 text-xs font-bold border border-[#bbf7d0]"
            href="https://wa.me/918638611886?text=Hello%20IAIT%20Kaliabor,%20I%20am%20interested%20in%20courses"
            target="_blank"
            rel="noopener noreferrer"
            title="WhatsApp Admission Desk"
          >
            <MessageCircle className="w-4 h-4 shrink-0 text-[#15803d]" />
            <span className="hidden md:inline">WhatsApp</span>
          </a>

          <button
            onClick={onOpenStaffModal}
            className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl bg-[#00163d] hover:bg-[#8e125b] flex items-center justify-center text-white active:scale-95 transition-colors cursor-pointer gap-1.5 text-xs font-bold shadow-xs"
            title="Faculty & Staff Login Portal"
            aria-label="Faculty & Staff Portal"
          >
            <Shield className="w-4 h-4 shrink-0 text-white" />
            <span className="hidden sm:inline">Staff Portal</span>
          </button>
        </div>
      </div>

      {/* Original Menu Bar (Rich plum magenta tone, responsive desktop & mobile tabs) */}
      <nav className="w-full bg-gradient-to-r from-[#7a0d4c] via-[#8e125b] to-[#9f1566] shadow-sm border-t border-[#7a0d4c]/20">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-1.5 sm:py-2 flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
            {/* 1. Home */}
            <button
              onClick={() => setActiveTab('home')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'home'
                  ? 'bg-white text-[#8e125b] shadow-xs'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
              }`}
            >
              <Home className="w-3.5 h-3.5 shrink-0" />
              <span>Home</span>
            </button>

            {/* 2. Courses */}
            <button
              onClick={() => setActiveTab('courses')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'courses'
                  ? 'bg-white text-[#8e125b] shadow-xs'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              <span>Courses</span>
            </button>

            {/* 3. Admission */}
            <button
              onClick={() => setActiveTab('admission')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 relative ${
                activeTab === 'admission'
                  ? 'bg-white text-[#8e125b] shadow-xs'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5 shrink-0" />
              <span>Admission</span>
              <span className="ml-0.5 px-1.5 py-0.2 bg-[#ffddb8] text-[#2a1700] text-[9px] font-extrabold rounded-full shadow-xs">
                APPLY
              </span>
            </button>

            {/* 4. Verify Student */}
            <button
              onClick={() => setActiveTab('verify')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'verify'
                  ? 'bg-white text-[#8e125b] shadow-xs'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Verify Student</span>
            </button>

            {/* 5. Admin Panel */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-white text-[#8e125b] shadow-xs'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
              }`}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>Admin Panel</span>
            </button>

            {/* 6. About */}
            <button
              onClick={onOpenAboutModal}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold text-white/90 hover:text-white hover:bg-white/15 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>About</span>
            </button>
          </div>

          {/* Desktop Right Quick Indicator */}
          <div className="hidden lg:flex items-center gap-3 text-white/90 text-xs font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Admissions Active 2025-26</span>
            </span>
            <button
              onClick={() => setActiveTab('admission')}
              className="px-3 py-1 rounded-full bg-[#ffddb8] hover:bg-white text-[#2a1700] text-[11px] font-extrabold transition-all cursor-pointer shadow-xs"
            >
              Instant Register
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};
