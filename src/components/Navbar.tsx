import React from 'react';
import { AppMode } from '../types';
import { Scale, ShieldCheck, Search, BookOpen, BookmarkCheck, Menu, X, Gavel, CalendarClock } from 'lucide-react';

interface NavbarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  savedCount: number;
  openSavedModal: () => void;
  sessionsCount: number;
  openSessionsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  setMode,
  savedCount,
  openSavedModal,
  sessionsCount,
  openSessionsModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { mode: AppMode; label: string; icon: string }[] = [
    { mode: 'advisor', label: 'المستشار القانوني', icon: '⚖️' },
    { mode: 'defendant', label: 'محامي الدفاع', icon: '🛡️' },
    { mode: 'analyst', label: 'محلل القضايا', icon: '🔎' },
    { mode: 'contract', label: 'صياغة العقود', icon: '📝' },
    { mode: 'library', label: 'المكتبة القانونية', icon: '📚' },
  ];

  return (
    <>
      {/* Desktop Right Sidebar */}
      <aside className="w-72 bg-[#0F0F0F] border-l border-[#222222] hidden md:flex flex-col h-screen sticky top-0 z-40">
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setMode('advisor')}>
            <div className="w-10 h-10 bg-[#C5A059] rounded-lg flex items-center justify-center shadow-lg shadow-[#C5A059]/10">
              <span className="text-black font-bold text-xl">⚖️</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#C5A059]">المحامي الذكي</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = currentMode === item.mode;
            return (
              <div
                key={item.mode}
                onClick={() => setMode(item.mode)}
                className={`p-4 rounded-xl transition-all duration-200 flex items-center gap-4 cursor-pointer ${
                  isActive
                    ? 'bg-[#1A1A1A] border border-[#333333] text-white shadow-md'
                    : 'hover:bg-[#1A1A1A] text-gray-400 hover:text-white opacity-70 hover:opacity-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Action Buttons in Sidebar */}
        <div className="px-4 py-2 space-y-2">
          {/* Sessions and Reminders Button */}
          <button
            onClick={openSessionsModal}
            className="w-full flex items-center justify-between p-3.5 bg-[#1A1A1A] hover:bg-[#222222] border border-[#333333] hover:border-[#C5A059]/50 rounded-xl text-gray-200 hover:text-white transition group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <CalendarClock className="w-5 h-5 text-[#C5A059]" />
              <span className="text-sm font-medium">مواعيد الجلسات</span>
            </div>
            {sessionsCount > 0 && (
              <span className="bg-amber-500 text-black text-xs font-black px-2 py-0.5 rounded-full flex items-center justify-center">
                {sessionsCount}
              </span>
            )}
          </button>

          {/* Saved Consultations Button */}
          <button
            onClick={openSavedModal}
            className="w-full flex items-center justify-between p-3.5 bg-[#1A1A1A] hover:bg-[#222222] border border-[#333333] hover:border-[#C5A059]/50 rounded-xl text-gray-200 hover:text-white transition group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <BookmarkCheck className="w-5 h-5 text-[#C5A059]" />
              <span className="text-sm font-medium">السجل المحفوظ</span>
            </div>
            {savedCount > 0 && (
              <span className="bg-[#C5A059] text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>
        </div>

        <div className="p-6 border-t border-[#222222]">
          <div className="bg-[#1A1A1A] p-4 rounded-xl text-xs space-y-2 border border-[#333333]">
            <p className="text-[#C5A059] font-bold uppercase tracking-widest">حالة النظام</p>
            <p className="flex justify-between"><span>قاعدة البيانات:</span> <span className="text-emerald-500 font-semibold">القانون المصري</span></p>
            <p className="flex justify-between"><span>الإصدار:</span> <span className="text-gray-400">الذكاء الاصطناعي النشط</span></p>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#0F0F0F] border-b border-[#222222] px-4 py-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setMode('advisor')}>
          <div className="w-9 h-9 bg-[#C5A059] rounded-lg flex items-center justify-center">
            <span className="text-black font-bold">⚖️</span>
          </div>
          <span className="text-lg font-bold text-[#C5A059]">المحامي الذكي</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openSessionsModal}
            className="relative p-2.5 bg-[#1A1A1A] border border-[#333333] rounded-xl text-gray-200"
            title="مواعيد الجلسات"
          >
            <CalendarClock className="w-5 h-5 text-[#C5A059]" />
            {sessionsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {sessionsCount}
              </span>
            )}
          </button>
          <button
            onClick={openSavedModal}
            className="relative p-2.5 bg-[#1A1A1A] border border-[#333333] rounded-xl text-gray-200"
            title="السجل المحفوظ"
          >
            <BookmarkCheck className="w-5 h-5 text-[#C5A059]" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C5A059] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 bg-[#1A1A1A] border border-[#333333] rounded-xl text-gray-200"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[73px] bg-[#0F0F0F] border-b border-[#222222] p-4 space-y-2 z-40 shadow-2xl">
          {navItems.map((item) => {
            const isActive = currentMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => {
                  setMode(item.mode);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#1A1A1A] border border-[#333333] text-white font-bold'
                    : 'text-gray-400 hover:bg-[#1A1A1A]'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-[#222222] flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openSessionsModal();
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#1A1A1A] border border-[#333333] rounded-xl text-sm font-medium text-white"
            >
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-[#C5A059]" />
                <span>مواعيد الجلسات القضائية</span>
              </div>
              {sessionsCount > 0 && (
                <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                  {sessionsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openSavedModal();
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#1A1A1A] border border-[#333333] rounded-xl text-sm font-medium text-white"
            >
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-[#C5A059]" />
                <span>السجل والاستشارات المحفوظة</span>
              </div>
              {savedCount > 0 && (
                <span className="bg-[#C5A059] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
