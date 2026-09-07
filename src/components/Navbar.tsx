import React from 'react';
import { AppMode, ThemeMode } from '../types';
import {
  BookmarkCheck,
  Menu,
  X,
  CalendarClock,
  Settings,
  Sun,
  Moon,
  Eye,
  Sliders
} from 'lucide-react';

interface NavbarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  savedCount: number;
  openSavedModal: () => void;
  sessionsCount: number;
  openSessionsModal: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  openSettingsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  setMode,
  savedCount,
  openSavedModal,
  sessionsCount,
  openSessionsModal,
  theme,
  onToggleTheme,
  openSettingsModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const isLight = theme === 'light';

  const navItems: { mode: AppMode; label: string; icon: string }[] = [
    { mode: 'dashboard', label: 'لوحة تحكم القضايا', icon: '📊' },
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
                    ? 'bg-[#1A1A1A] border border-[#333333] text-white shadow-md font-bold'
                    : 'hover:bg-[#1A1A1A] text-gray-400 hover:text-white opacity-70 hover:opacity-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Action Buttons & Settings in Sidebar */}
        <div className="px-4 py-2 space-y-2">
          {/* Quick Toggle for Comfortable Reading Mode */}
          <button
            onClick={onToggleTheme}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition cursor-pointer group ${
              isLight
                ? 'bg-amber-500/15 border-[#C5A059] text-[#93631A]'
                : 'bg-[#1A1A1A] hover:bg-[#222222] border-[#333333] hover:border-[#C5A059]/50 text-gray-200'
            }`}
            title="تبديل سريع بين الوضع الداكن ووضع القراءة المريحة الفاتح"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                  isLight ? 'bg-[#93631A] text-white' : 'bg-[#2A2A2A] text-[#C5A059]'
                }`}
              >
                {isLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </div>
              <div className="text-right">
                <span className="text-xs font-bold block leading-tight">القراءة المريحة</span>
                <span className="text-[10px] text-gray-400">
                  {isLight ? 'وضع ورقي فاتح' : 'وضع داكن ليلي'}
                </span>
              </div>
            </div>

            {/* Micro pill toggle */}
            <div
              className={`w-9 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 ${
                isLight ? 'bg-[#C5A059]' : 'bg-[#333333]'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-black transition-transform duration-200 ${
                  isLight ? '-translate-x-4 bg-white' : 'translate-x-0'
                }`}
              />
            </div>
          </button>

          {/* General Settings Modal Button */}
          <button
            onClick={openSettingsModal}
            className="w-full flex items-center justify-between p-3 bg-[#1A1A1A] hover:bg-[#222222] border border-[#333333] hover:border-[#C5A059]/50 rounded-xl text-gray-200 hover:text-white transition group cursor-pointer"
            title="الإعدادات العامة وتجربة القراءة"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#242424] text-[#C5A059] flex items-center justify-center">
                <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
              </div>
              <span className="text-xs font-medium">الإعدادات العامة</span>
            </div>
            <span className="text-[10px] text-gray-400 px-1.5 py-0.5 rounded-md bg-[#242424]">
              تخصيص
            </span>
          </button>

          {/* Sessions and Reminders Button */}
          <button
            onClick={openSessionsModal}
            className="w-full flex items-center justify-between p-3 bg-[#1A1A1A] hover:bg-[#222222] border border-[#333333] hover:border-[#C5A059]/50 rounded-xl text-gray-200 hover:text-white transition group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#242424] text-[#C5A059] flex items-center justify-center">
                <CalendarClock className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">مواعيد الجلسات</span>
            </div>
            {sessionsCount > 0 && (
              <span className="bg-amber-500 text-black text-[11px] font-black px-2 py-0.5 rounded-full flex items-center justify-center">
                {sessionsCount}
              </span>
            )}
          </button>

          {/* Saved Consultations Button */}
          <button
            onClick={openSavedModal}
            className="w-full flex items-center justify-between p-3 bg-[#1A1A1A] hover:bg-[#222222] border border-[#333333] hover:border-[#C5A059]/50 rounded-xl text-gray-200 hover:text-white transition group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#242424] text-[#C5A059] flex items-center justify-center">
                <BookmarkCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">السجل المحفوظ</span>
            </div>
            {savedCount > 0 && (
              <span className="bg-[#C5A059] text-black text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>
        </div>

        <div className="p-5 border-t border-[#222222]">
          <div className="bg-[#1A1A1A] p-3.5 rounded-xl text-xs space-y-1.5 border border-[#333333]">
            <p className="text-[#C5A059] font-bold uppercase tracking-widest text-[11px]">حالة النظام</p>
            <p className="flex justify-between"><span>قاعدة البيانات:</span> <span className="text-emerald-500 font-semibold">القانون المصري</span></p>
            <p className="flex justify-between"><span>الإصدار:</span> <span className="text-gray-400">الذكاء الاصطناعي النشط</span></p>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#0F0F0F] border-b border-[#222222] px-4 py-3.5 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setMode('advisor')}>
          <div className="w-8 h-8 bg-[#C5A059] rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">⚖️</span>
          </div>
          <span className="text-base font-bold text-[#C5A059]">المحامي الذكي</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Mobile Quick Light/Dark Toggle */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border transition ${
              isLight
                ? 'bg-amber-500/20 text-[#93631A] border-[#C5A059]'
                : 'bg-[#1A1A1A] text-[#C5A059] border-[#333333]'
            }`}
            title="تبديل وضع القراءة المريحة (Dark/Light)"
            aria-label="تبديل وضع القراءة المريحة"
          >
            {isLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile Settings Button */}
          <button
            onClick={openSettingsModal}
            className="p-2 bg-[#1A1A1A] border border-[#333333] rounded-xl text-gray-200"
            title="الإعدادات العامة"
            aria-label="فتح الإعدادات العامة"
          >
            <Settings className="w-4 h-4 text-[#C5A059]" />
          </button>

          {/* Sessions Modal Button */}
          <button
            onClick={openSessionsModal}
            className="relative p-2 bg-[#1A1A1A] border border-[#333333] rounded-xl text-gray-200"
            title="مواعيد الجلسات"
          >
            <CalendarClock className="w-4 h-4 text-[#C5A059]" />
            {sessionsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {sessionsCount}
              </span>
            )}
          </button>

          {/* Saved Modal Button */}
          <button
            onClick={openSavedModal}
            className="relative p-2 bg-[#1A1A1A] border border-[#333333] rounded-xl text-gray-200"
            title="السجل المحفوظ"
          >
            <BookmarkCheck className="w-4 h-4 text-[#C5A059]" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C5A059] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>

          {/* Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-[#1A1A1A] border border-[#333333] rounded-xl text-gray-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] bg-[#0F0F0F] border-b border-[#222222] p-4 space-y-2 z-40 shadow-2xl">
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
            {/* Quick Toggle in Mobile Menu */}
            <button
              onClick={() => {
                onToggleTheme();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#1A1A1A] border border-[#333333] rounded-xl text-sm font-medium text-white"
            >
              <div className="flex items-center gap-2">
                {isLight ? <Sun className="w-4 h-4 text-[#C5A059]" /> : <Moon className="w-4 h-4 text-[#C5A059]" />}
                <span>وضع القراءة المريحة (Dark/Light)</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isLight ? 'bg-[#C5A059] text-black font-bold' : 'bg-[#262626] text-gray-300'}`}>
                {isLight ? 'فاتح مفعّل' : 'داكن'}
              </span>
            </button>

            {/* Settings in Mobile Menu */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openSettingsModal();
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#1A1A1A] border border-[#333333] rounded-xl text-sm font-medium text-white"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#C5A059]" />
                <span>الإعدادات العامة وتجربة القراءة</span>
              </div>
              <span className="text-xs text-gray-400">تخصيص</span>
            </button>

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
