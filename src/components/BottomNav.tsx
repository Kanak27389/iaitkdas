import React from 'react';
import {
  Home,
  GraduationCap,
  FileEdit,
  ShieldCheck,
  Shield,
  Info,
} from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenAboutModal?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAboutModal,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-[#ffffff]/98 backdrop-blur-xl shadow-[0_-2px_12px_rgba(15,43,92,0.06)] border-t border-[#8e125b]/20 md:hidden">
      <div className="flex justify-between items-center h-16 px-1 max-w-lg mx-auto">
        {/* 1. Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex-1 flex flex-col items-center justify-center min-w-0 h-12 gap-0.5 transition-colors cursor-pointer ${
            activeTab === 'home'
              ? 'text-[#8e125b] font-bold'
              : 'text-[#44464f] hover:text-[#8e125b]'
          }`}
        >
          <Home className="w-5 h-5 shrink-0" />
          <span className="text-[10px] leading-tight truncate">Home</span>
        </button>

        {/* 2. Courses */}
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex-1 flex flex-col items-center justify-center min-w-0 h-12 gap-0.5 transition-colors cursor-pointer ${
            activeTab === 'courses'
              ? 'text-[#8e125b] font-bold'
              : 'text-[#44464f] hover:text-[#8e125b]'
          }`}
        >
          <GraduationCap className="w-5 h-5 shrink-0" />
          <span className="text-[10px] leading-tight truncate">Courses</span>
        </button>

        {/* 3. Admission */}
        <button
          onClick={() => setActiveTab('admission')}
          className={`flex-1 flex flex-col items-center justify-center min-w-0 h-12 gap-0.5 transition-colors relative cursor-pointer ${
            activeTab === 'admission'
              ? 'text-[#8e125b] font-bold'
              : 'text-[#44464f] hover:text-[#8e125b]'
          }`}
        >
          <span className="absolute -top-1.5 right-1 px-1 py-0.2 bg-[#ffddb8] text-[#2a1700] text-[8px] font-extrabold rounded-full">
            APPLY
          </span>
          <FileEdit className="w-5 h-5 shrink-0" />
          <span className="text-[10px] leading-tight truncate">Admission</span>
        </button>

        {/* 4. Verify Student */}
        <button
          onClick={() => setActiveTab('verify')}
          className={`flex-1 flex flex-col items-center justify-center min-w-0 h-12 gap-0.5 transition-colors cursor-pointer ${
            activeTab === 'verify'
              ? 'text-[#8e125b] font-bold'
              : 'text-[#44464f] hover:text-[#8e125b]'
          }`}
        >
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span className="text-[10px] leading-tight truncate">Verify</span>
        </button>

        {/* 5. Admin Panel */}
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex-1 flex flex-col items-center justify-center min-w-0 h-12 gap-0.5 transition-colors cursor-pointer ${
            activeTab === 'admin'
              ? 'text-[#8e125b] font-bold'
              : 'text-[#44464f] hover:text-[#8e125b]'
          }`}
        >
          <Shield className="w-5 h-5 shrink-0" />
          <span className="text-[10px] leading-tight truncate">Admin</span>
        </button>

        {/* 6. About */}
        <button
          onClick={onOpenAboutModal}
          className="flex-1 flex flex-col items-center justify-center min-w-0 h-12 gap-0.5 transition-colors text-[#44464f] hover:text-[#8e125b] cursor-pointer"
        >
          <Info className="w-5 h-5 shrink-0" />
          <span className="text-[10px] leading-tight truncate">About</span>
        </button>
      </div>
    </nav>
  );
};
