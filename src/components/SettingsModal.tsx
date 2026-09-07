import React from 'react';
import { AppSettings, ThemeMode, ReadingFontSize, ReadingLineHeight } from '../types';
import {
  X,
  Sun,
  Moon,
  Eye,
  BookOpen,
  Type,
  AlignJustify,
  RotateCcw,
  Check,
  Bell,
  Volume2,
  VolumeX,
  Sparkles,
  Contrast,
  Sliders,
  FileText
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetSettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  if (!isOpen) return null;

  const isLight = settings.theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        dir="rtl"
        className="relative w-full max-w-2xl bg-[#141414] border border-[#2B2B2B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-gray-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#262626] bg-[#181818] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>الإعدادات العامة وتجربة القراءة</span>
                {isLight && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-[#C5A059] border border-[#C5A059]/30">
                    وضع القراءة المريحة نَشِط
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                تخصيص نمط الإضاءة والخطوط لتسهيل تصفح ومراجعة النصوص القانونية الطويلة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#262626] transition cursor-pointer"
            aria-label="إغلاق الإعدادات"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          
          {/* SECTION 1: Reading Theme Mode */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#C5A059]" />
                <span className="font-bold text-white text-sm">وضع العرض والإضاءة:</span>
              </div>
              <span className="text-xs text-gray-400">
                {isLight ? 'وضع القراءة المريحة (فاتح)' : 'الوضع الداكن (الافتراضي)'}
              </span>
            </div>

            {/* Quick Toggle Banner */}
            <div
              onClick={() => onUpdateSettings({ theme: isLight ? 'dark' : 'light' })}
              className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                isLight
                  ? 'bg-amber-500/10 border-[#C5A059]/50 shadow-xs'
                  : 'bg-[#1C1C1C] border-[#2E2E2E] hover:border-[#3E3E3E]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                    isLight
                      ? 'bg-[#C5A059] text-black shadow-md'
                      : 'bg-[#2A2A2A] text-[#C5A059]'
                  }`}
                >
                  {isLight ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span>وضع القراءة المريحة (Comfortable Light Mode)</span>
                    {isLight && <span className="text-xs text-[#C5A059]">✓ مفعّل</span>}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    خلفية عاجية دافئة كأوراق المحاكم لراحة العين أثناء قراءة الحيثيات والمذكرات
                  </p>
                </div>
              </div>

              {/* iOS-style toggle switch */}
              <div
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                  isLight ? 'bg-[#C5A059]' : 'bg-[#333333]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 ${
                    isLight ? '-translate-x-6 bg-white' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            {/* Visual Choice Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Dark Mode Card */}
              <div
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  !isLight
                    ? 'bg-[#1F1F1F] border-[#C5A059] shadow-md ring-1 ring-[#C5A059]/30'
                    : 'bg-[#181818] border-[#2A2A2A] hover:bg-[#1E1E1E] text-gray-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-white text-xs">الوضع الداكن الكلاسيكي</span>
                    </div>
                    {!isLight && (
                      <span className="w-5 h-5 rounded-full bg-[#C5A059] text-black flex items-center justify-center text-xs font-bold">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    مناسب لأوقات الليل والبيئات منخفضة الإضاءة، يعزز التركيز ويحافظ على بطارية الجهاز.
                  </p>
                </div>
                {/* Visual miniature */}
                <div className="mt-3 bg-[#0A0A0A] p-2.5 rounded-lg border border-[#2A2A2A] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
                  <div className="h-2 w-16 bg-[#262626] rounded-sm" />
                  <div className="h-2 w-8 bg-[#333333] rounded-sm mr-auto" />
                </div>
              </div>

              {/* Light Reading Mode Card */}
              <div
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  isLight
                    ? 'bg-[#1F1F1F] border-[#C5A059] shadow-md ring-1 ring-[#C5A059]/30'
                    : 'bg-[#181818] border-[#2A2A2A] hover:bg-[#1E1E1E] text-gray-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-[#C5A059]" />
                      <span className="font-bold text-white text-xs">وضع القراءة المريحة (فاتح)</span>
                    </div>
                    {isLight && (
                      <span className="w-5 h-5 rounded-full bg-[#C5A059] text-black flex items-center justify-center text-xs font-bold">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    مستوحى من أوراق المراجع والمجلدات القانونية؛ ألوان دافئة تمنع إجهاد العين نهاراً.
                  </p>
                </div>
                {/* Visual miniature */}
                <div className="mt-3 bg-[#FBF9F5] p-2.5 rounded-lg border border-[#E2DBD0] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#93631A]" />
                  <div className="h-2 w-16 bg-[#E8E2D5] rounded-sm" />
                  <div className="h-2 w-8 bg-[#DCD4C6] rounded-sm mr-auto" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Typography & Legal Text Sizing */}
          <div className="space-y-4 pt-4 border-t border-[#262626]">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-[#C5A059]" />
              <span className="font-bold text-white text-sm">حجم خط قراءة النصوص القانونية:</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'normal' as ReadingFontSize, label: 'عادي (قياسي)', sub: '16px' },
                { id: 'large' as ReadingFontSize, label: 'كبير (مريح)', sub: '18px' },
                { id: 'xlarge' as ReadingFontSize, label: 'كبير جداً', sub: '20px' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onUpdateSettings({ fontSize: opt.id })}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                    settings.fontSize === opt.id
                      ? 'bg-[#C5A059] text-black font-bold border-[#C5A059] shadow-md'
                      : 'bg-[#1A1A1A] hover:bg-[#222222] border-[#2E2E2E] text-gray-300'
                  }`}
                >
                  <p className="text-xs">{opt.label}</p>
                  <p className={`text-[10px] mt-0.5 ${settings.fontSize === opt.id ? 'text-black/80' : 'text-gray-500'}`}>
                    {opt.sub}
                  </p>
                </button>
              ))}
            </div>

            {/* Line Height Option */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-2.5">
                <AlignJustify className="w-4 h-4 text-[#C5A059]" />
                <span className="font-bold text-white text-sm">تباعد الأسطر للمذكرات والحيثيات:</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'normal' as ReadingLineHeight, label: 'قياسي (1.5)', desc: 'مدمج' },
                  { id: 'relaxed' as ReadingLineHeight, label: 'مريح (1.75)', desc: 'تصفح أسرع' },
                  { id: 'loose' as ReadingLineHeight, label: 'واسع (2.0)', desc: 'قراءة متأنية' },
                ].map((lh) => (
                  <button
                    key={lh.id}
                    onClick={() => onUpdateSettings({ lineHeight: lh.id })}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      settings.lineHeight === lh.id
                        ? 'bg-[#C5A059] text-black font-bold border-[#C5A059] shadow-md'
                        : 'bg-[#1A1A1A] hover:bg-[#222222] border-[#2E2E2E] text-gray-300'
                    }`}
                  >
                    <p className="text-xs">{lh.label}</p>
                    <p className={`text-[10px] mt-0.5 ${settings.lineHeight === lh.id ? 'text-black/80' : 'text-gray-500'}`}>
                      {lh.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast Toggle */}
            <div className="pt-2">
              <div
                onClick={() => onUpdateSettings({ highContrast: !settings.highContrast })}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] hover:border-[#3E3E3E] cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#262626] text-[#C5A059]">
                    <Contrast className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">تعزيز التباين البصري وحدود النصوص</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      تكثيف سواد الخطوط وحدود البطاقات القانونية لراحة قصوى لضعاف البصر
                    </p>
                  </div>
                </div>
                <div
                  className={`w-10 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                    settings.highContrast ? 'bg-[#C5A059]' : 'bg-[#333333]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 ${
                      settings.highContrast ? '-translate-x-5 bg-white' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Live Interactive Preview */}
          <div className="space-y-2 pt-4 border-t border-[#262626]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>معاينة حية للنص القانوني وفق إعداداتك:</span>
              </span>
              <span className="text-[11px] text-gray-400">تطبيق مباشر للتجربة</span>
            </div>

            {/* Preview Box styled based on current settings */}
            <div
              className={`p-4 rounded-xl border transition-all duration-200 ${
                isLight
                  ? 'bg-[#FBF9F5] border-[#DCD4C6] text-[#1C1917] shadow-inner'
                  : 'bg-[#0F0F0F] border-[#2A2A2A] text-gray-200 shadow-inner'
              }`}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-500/20 text-xs">
                <span className={`font-bold ${isLight ? 'text-[#93631A]' : 'text-[#C5A059]'}`}>
                  القانون المدني المصري - المادة الأولى
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-sm ${isLight ? 'bg-[#EDE7DB] text-gray-700' : 'bg-[#222222] text-gray-400'}`}>
                  معاينة مباشرة
                </span>
              </div>
              <p
                className={`transition-all duration-200 ${
                  settings.fontSize === 'xlarge'
                    ? 'text-lg'
                    : settings.fontSize === 'large'
                    ? 'text-base'
                    : 'text-sm'
                } ${
                  settings.lineHeight === 'loose'
                    ? 'leading-loose'
                    : settings.lineHeight === 'relaxed'
                    ? 'leading-relaxed'
                    : 'leading-normal'
                } ${settings.highContrast ? 'font-medium' : 'font-normal'}`}
              >
                «تسري النصوص التشريعية على جميع المسائل التي تتناولها هذه النصوص في لفظها أو في فحواها...
                فإذا لم يوجد نص تشريعي، حكم القاضي بمقتضى العرف، فإذا لم يوجد فبمقتضى مبادئ الشريعة الإسلامية،
                فإذا لم توجد فبمقتضى قواعد العدالة وحسن النية.»
              </p>
            </div>
          </div>

          {/* SECTION 4: Court Session Reminders Preference */}
          <div className="space-y-3 pt-4 border-t border-[#262626]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#C5A059]" />
              <span className="font-bold text-white text-sm">تنبيهات الجلسات القضائية:</span>
            </div>

            <div
              onClick={() => onUpdateSettings({ courtRemindersSound: !settings.courtRemindersSound })}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] hover:border-[#3E3E3E] cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#262626] text-[#C5A059]">
                  {settings.courtRemindersSound ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">التنبيه الصوتي لمواعيد الجلسات القريبة</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    إصدار إشعار صوتي خفيف عند اقتراب موعد الجلسة القضائية (أقل من 24 ساعة)
                  </p>
                </div>
              </div>
              <div
                className={`w-10 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                  settings.courtRemindersSound ? 'bg-[#C5A059]' : 'bg-[#333333]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 ${
                    settings.courtRemindersSound ? '-translate-x-5 bg-white' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#262626] bg-[#181818] flex items-center justify-between shrink-0">
          <button
            onClick={onResetSettings}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-[#262626] transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الإعدادات الافتراضية</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#C5A059] hover:bg-[#B48F45] text-black font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>تم وحفظ الإعدادات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
