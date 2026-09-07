import React, { useState, useEffect } from 'react';
import { CourtSession } from '../types';
import {
  calculateTimeRemaining,
  TimeRemaining,
  formatArabicDate,
  getCountdownLabel,
} from '../utils/sessionUtils';
import {
  CalendarClock,
  Gavel,
  Bell,
  Clock,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  RotateCw,
  Scale,
} from 'lucide-react';

interface SessionCountdownBannerProps {
  sessions: CourtSession[];
  onOpenSessionsModal: () => void;
  onAddNewSession: () => void;
  onOpenRollover?: (sessionId?: string) => void;
}

export const SessionCountdownBanner: React.FC<SessionCountdownBannerProps> = ({
  sessions,
  onOpenSessionsModal,
  onAddNewSession,
  onOpenRollover,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [nowTick, setNowTick] = useState(Date.now());

  // Tick every second to keep countdown lively
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter active and upcoming
  const activeSessions = (sessions || []).filter((s) => !s.isCompleted);

  // Find closest upcoming session
  const closestSession = (() => {
    if (activeSessions.length === 0) return null;
    return [...activeSessions].sort((a, b) => {
      const aTime = new Date(`${a.sessionDate}T${a.sessionTime || '09:00'}`).getTime();
      const bTime = new Date(`${b.sessionDate}T${b.sessionTime || '09:00'}`).getTime();
      return aTime - bTime;
    })[0];
  })();

  if (!closestSession) {
    return (
      <div className="bg-[#121212] border-b border-[#222222] px-4 py-2.5 flex items-center justify-between text-xs transition-all">
        <div className="flex items-center gap-2.5 text-gray-400">
          <CalendarClock className="w-4 h-4 text-[#C5A059]" />
          <span>لا توجد جلسات قضائية مجدولة حالياً.</span>
        </div>
        <button
          onClick={onAddNewSession}
          className="flex items-center gap-1.5 px-3 py-1 bg-[#1A1A1A] hover:bg-[#222222] text-[#C5A059] border border-[#C5A059]/40 hover:border-[#C5A059] rounded-lg transition font-semibold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>حفظ موعد جلسة قادمة</span>
        </button>
      </div>
    );
  }

  const timeRem = calculateTimeRemaining(closestSession.sessionDate, closestSession.sessionTime);
  const label = getCountdownLabel(timeRem);

  const urgencyStyles = {
    urgent: 'border-red-900/60 bg-gradient-to-r from-red-950/40 via-[#181111] to-[#121212]',
    warning: 'border-amber-900/50 bg-gradient-to-r from-amber-950/30 via-[#181510] to-[#121212]',
    normal: 'border-[#333333] bg-gradient-to-r from-[#181611] via-[#141414] to-[#0F0F0F]',
    past: 'border-gray-800 bg-[#121212]',
  }[timeRem.urgencyLevel];

  // Minimized compact ticker bar
  if (isMinimized) {
    return (
      <div
        className={`border-b px-4 py-2 flex items-center justify-between text-xs transition-all ${urgencyStyles}`}
      >
        <div
          onClick={onOpenSessionsModal}
          className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1"
        >
          <span className="flex items-center gap-1.5 text-[#C5A059] font-bold shrink-0">
            <Bell className="w-3.5 h-3.5 animate-bounce" />
            <span>الجلسة القادمة:</span>
          </span>
          <span className="text-white font-semibold truncate max-w-xs sm:max-w-md">
            {closestSession.caseTitle}
          </span>
          <span className="text-gray-400 hidden md:inline">({closestSession.courtName})</span>
          <span
            className={`px-2 py-0.5 rounded-full font-bold text-[11px] shrink-0 ${
              timeRem.urgencyLevel === 'urgent'
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : timeRem.urgencyLevel === 'warning'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40'
            }`}
          >
            {label}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 pr-2">
          <button
            onClick={onOpenSessionsModal}
            className="text-[11px] text-gray-300 hover:text-white px-2 py-1 bg-[#1A1A1A] rounded border border-[#333333]"
          >
            تفاصيل الجلسات ({activeSessions.length})
          </button>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-gray-400 hover:text-white p-1"
            title="توسيع عداد الجلسة"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-b px-4 sm:px-6 py-3 transition-all relative shadow-lg ${urgencyStyles}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left/Main info: Case & Court */}
        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              timeRem.urgencyLevel === 'urgent'
                ? 'bg-red-950/60 border-red-700 text-red-400 animate-pulse'
                : 'bg-[#1F1B14] border-[#C5A059]/40 text-[#C5A059]'
            }`}
          >
            <Gavel className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[11px] font-bold text-[#C5A059] flex items-center gap-1">
                <Bell className="w-3 h-3 text-[#C5A059]" />
                <span>تنبيه موعد الجلسة القادمة</span>
              </span>
              <span className="text-gray-600 text-[10px]">•</span>
              {closestSession.isReservedForJudgment ? (
                <span className="bg-[#C5A059] text-black text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <span>⚖️ محجوزة للحكم</span>
                </span>
              ) : (
                <span className="bg-[#242424] text-gray-300 text-[10px] px-2 py-0.5 rounded-full border border-[#333333]">
                  {closestSession.sessionType}
                </span>
              )}
              {closestSession.briefsDeadline && (
                <span className="bg-amber-950/70 border border-amber-600/70 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  مهلة المذكرات: {formatArabicDate(closestSession.briefsDeadline)}
                </span>
              )}
              {closestSession.caseNumber && (
                <span className="text-[11px] text-gray-400 hidden sm:inline">
                  {closestSession.caseNumber}
                </span>
              )}
            </div>

            <h3
              onClick={onOpenSessionsModal}
              className="text-sm sm:text-base font-bold text-white truncate cursor-pointer hover:text-[#C5A059] transition"
              title={closestSession.caseTitle}
            >
              {closestSession.caseTitle}
            </h3>

            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5 flex-wrap">
              <span className="truncate">{closestSession.courtName}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-300 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#C5A059]" />
                {formatArabicDate(closestSession.sessionDate)}
              </span>
              {closestSession.sessionTime && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#C5A059]" />
                    {closestSession.sessionTime}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center/Right: Live Countdown Units */}
        <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            {/* Days Box */}
            <div className="flex flex-col items-center justify-center bg-[#0C0C0C] border border-[#2B2B2B] rounded-xl px-2.5 py-1 min-w-[50px] shadow-inner">
              <span className="text-base sm:text-lg font-black text-[#C5A059] leading-tight">
                {String(timeRem.days).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-gray-400 font-medium">أيام</span>
            </div>

            <span className="text-gray-600 font-bold">:</span>

            {/* Hours Box */}
            <div className="flex flex-col items-center justify-center bg-[#0C0C0C] border border-[#2B2B2B] rounded-xl px-2.5 py-1 min-w-[50px] shadow-inner">
              <span className="text-base sm:text-lg font-black text-white leading-tight">
                {String(timeRem.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-gray-400 font-medium">ساعة</span>
            </div>

            <span className="text-gray-600 font-bold">:</span>

            {/* Minutes Box */}
            <div className="flex flex-col items-center justify-center bg-[#0C0C0C] border border-[#2B2B2B] rounded-xl px-2.5 py-1 min-w-[50px] shadow-inner">
              <span className="text-base sm:text-lg font-black text-white leading-tight">
                {String(timeRem.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-gray-400 font-medium">دقيقة</span>
            </div>

            <span className="text-gray-600 font-bold">:</span>

            {/* Seconds Box */}
            <div className="flex flex-col items-center justify-center bg-[#0C0C0C] border border-[#2B2B2B] rounded-xl px-2 py-1 min-w-[42px] shadow-inner">
              <span className="text-xs sm:text-sm font-black text-amber-500/90 leading-tight">
                {String(timeRem.seconds).padStart(2, '0')}
              </span>
              <span className="text-[8px] text-gray-500 font-medium">ثانية</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {timeRem.isPast && onOpenRollover && (
              <button
                onClick={() => onOpenRollover(closestSession.id)}
                className="text-xs px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition flex items-center gap-1 cursor-pointer shadow-md"
                title="ترحيل هذه الجلسة المنقضية وإثبات قرار المحكمة"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>ترحيل الجلسة</span>
              </button>
            )}
            <button
              onClick={onOpenSessionsModal}
              className="text-xs px-3 py-1.5 bg-[#1E1E1E] hover:bg-[#282828] text-gray-200 hover:text-white border border-[#333333] hover:border-[#C5A059]/50 rounded-lg transition font-medium cursor-pointer"
            >
              كافة الجلسات ({activeSessions.length})
            </button>
            <button
              onClick={onAddNewSession}
              className="text-xs px-2.5 py-1.5 bg-[#C5A059] hover:bg-[#D4B26F] text-black font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
              title="إضافة موعد جلسة جديد"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">جلسة جديدة</span>
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-gray-400 hover:text-white p-1.5 hover:bg-[#222222] rounded-lg transition"
              title="تصغير شريط التنبيهات"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
