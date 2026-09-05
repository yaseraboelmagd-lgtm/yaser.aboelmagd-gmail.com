import React, { useState } from 'react';
import { CourtSession, CourtSessionType } from '../types';
import {
  CalendarClock,
  X,
  Plus,
  Trash2,
  Edit3,
  Check,
  Clock,
  Calendar,
  Gavel,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Share2,
  Bell,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import {
  calculateTimeRemaining,
  formatArabicDate,
  getCountdownLabel,
} from '../utils/sessionUtils';
import { downloadTxtFile } from '../utils/exportUtils';

interface SessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: CourtSession[];
  onAddSession: (session: Omit<CourtSession, 'id' | 'createdAt'>) => void;
  onUpdateSession: (id: string, updated: Partial<CourtSession>) => void;
  onDeleteSession: (id: string) => void;
  initialAddOpen?: boolean;
}

const SESSION_TYPES: CourtSessionType[] = [
  'مرافعة',
  'نطق بالحكم',
  'سماع شهود واستجواب',
  'تقديم مستندات',
  'إيداع تقرير خبير',
  'تجديد حبس / معارضة',
  'أخرى',
];

export const SessionsModal: React.FC<SessionsModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onAddSession,
  onUpdateSession,
  onDeleteSession,
  initialAddOpen = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');
  const [isFormOpen, setIsFormOpen] = useState(initialAddOpen);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [caseTitle, setCaseTitle] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [courtName, setCourtName] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('09:30');
  const [sessionType, setSessionType] = useState<CourtSessionType>('مرافعة');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!isOpen) return null;

  const resetForm = () => {
    setCaseTitle('');
    setCaseNumber('');
    setCourtName('');
    setSessionDate('');
    setSessionTime('09:30');
    setSessionType('مرافعة');
    setNotes('');
    setFormError('');
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleStartEdit = (session: CourtSession) => {
    setCaseTitle(session.caseTitle);
    setCaseNumber(session.caseNumber || '');
    setCourtName(session.courtName);
    setSessionDate(session.sessionDate);
    setSessionTime(session.sessionTime || '09:30');
    setSessionType(session.sessionType);
    setNotes(session.notes || '');
    setEditingId(session.id);
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseTitle.trim()) {
      setFormError('يرجى كتابة اسم أو موضوع القضية');
      return;
    }
    if (!courtName.trim()) {
      setFormError('يرجى تحديد اسم المحكمة أو الدائرة');
      return;
    }
    if (!sessionDate) {
      setFormError('يرجى اختيار تاريخ الجلسة');
      return;
    }

    if (editingId) {
      onUpdateSession(editingId, {
        caseTitle: caseTitle.trim(),
        caseNumber: caseNumber.trim() || undefined,
        courtName: courtName.trim(),
        sessionDate,
        sessionTime,
        sessionType,
        notes: notes.trim() || undefined,
      });
      triggerToast('تم تحديث موعد الجلسة بنجاح');
    } else {
      onAddSession({
        caseTitle: caseTitle.trim(),
        caseNumber: caseNumber.trim() || undefined,
        courtName: courtName.trim(),
        sessionDate,
        sessionTime,
        sessionType,
        notes: notes.trim() || undefined,
        isCompleted: false,
      });
      triggerToast('تم حفظ موعد الجلسة وتفعيل العداد التنازلي بنجاح');
    }

    resetForm();
  };

  const handleShareSession = (session: CourtSession) => {
    const timeRem = calculateTimeRemaining(session.sessionDate, session.sessionTime);
    const text = `⚖️ *تذكير بموعد جلسة قضائية - المحامي الذكي*
• *الدعوى*: ${session.caseTitle}
• *الرقم*: ${session.caseNumber || 'غير مدون'}
• *المحكمة*: ${session.courtName}
• *التاريخ*: ${formatArabicDate(session.sessionDate)} - الساعة ${session.sessionTime || '09:30'}
• *نوع الجلسة*: ${session.sessionType}
• *المتبقي*: ${getCountdownLabel(timeRem)}
${session.notes ? `• *الطلبات والملاحظات*: ${session.notes}` : ''}
`;

    if (navigator.share) {
      navigator
        .share({ title: session.caseTitle, text })
        .then(() => triggerToast('تمت المشاركة بنجاح'))
        .catch(() => {
          navigator.clipboard.writeText(text);
          triggerToast('تم نسخ تفاصيل الجلسة للحافظة');
        });
    } else {
      navigator.clipboard.writeText(text);
      triggerToast('تم نسخ تفاصيل الجلسة للحافظة للمشاركة');
    }
  };

  const handleExportScheduleTxt = () => {
    if (sessions.length === 0) return;
    let out = `======================================================================
جدول ومواعيد الجلسات القضائية - المحامي الذكي
إجمالي الجلسات: ${sessions.length}
تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-EG')}
======================================================================\n\n`;

    sessions.forEach((s, idx) => {
      const timeRem = calculateTimeRemaining(s.sessionDate, s.sessionTime);
      out += `[${idx + 1}] ${s.caseTitle} ${s.isCompleted ? '(تمت)' : ''}
- المحكمة: ${s.courtName}
- الرقم: ${s.caseNumber || 'بدون'}
- الموعد: ${formatArabicDate(s.sessionDate)} | ${s.sessionTime || '09:30'}
- نوع الجلسة: ${s.sessionType}
- الحالة: ${getCountdownLabel(timeRem)}
- المطلوب بالجلسة: ${s.notes || 'لا يوجد'}
----------------------------------------------------------------------\n`;
    });

    downloadTxtFile(`جدول_الجلسات_القضائية_${sessions.length}.txt`, out);
    triggerToast('تم تحميل جدول الجلسات كملف TXT');
  };

  // Filtered and sorted
  const sortedSessions = [...sessions].sort((a, b) => {
    const aTime = new Date(`${a.sessionDate}T${a.sessionTime || '09:00'}`).getTime();
    const bTime = new Date(`${b.sessionDate}T${b.sessionTime || '09:00'}`).getTime();
    return aTime - bTime;
  });

  const filteredSessions = sortedSessions.filter((s) => {
    if (filter === 'upcoming') return !s.isCompleted;
    if (filter === 'completed') return s.isCompleted;
    return true;
  });

  const upcomingCount = sessions.filter((s) => !s.isCompleted).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-[#2B2B2B] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right">
        
        {/* Header */}
        <div className="p-6 border-b border-[#222222] flex items-center justify-between bg-[#181818]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C5A059]/20 border border-[#C5A059]/40 rounded-xl flex items-center justify-center text-[#C5A059]">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#C5A059] flex items-center gap-2">
                <span>مواعيد الجلسات والتنبيهات القضائية</span>
                {upcomingCount > 0 && (
                  <span className="bg-[#C5A059] text-black text-xs font-black px-2 py-0.5 rounded-full">
                    {upcomingCount} قادمة
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400">
                حفظ وإدارة مواعيد الجلسات بالمحاكم مع عداد تنازلي فوري وتنبيهات الاستحقاق
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isFormOpen && (
              <button
                onClick={() => {
                  resetForm();
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#C5A059] hover:bg-[#D4B26F] text-black font-bold text-xs rounded-xl transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة جلسة جديدة</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white bg-[#222222] hover:bg-[#2A2A2A] rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Toast */}
        {toastMessage && (
          <div className="bg-[#1A1A1A] border-b border-[#C5A059]/50 px-6 py-2 flex items-center justify-between text-xs text-[#C5A059]">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </span>
            <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0E0E0E]">
          {isFormOpen ? (
            /* Add / Edit Form */
            <form onSubmit={handleSubmitForm} className="max-w-2xl mx-auto space-y-4 bg-[#161616] p-6 rounded-2xl border border-[#2B2B2B]">
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-[#C5A059]" />
                  <span>{editingId ? 'تعديل موعد الجلسة' : 'تسجيل موعد جلسة قضائية جديدة'}</span>
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  إلغاء والعودة للقائمة
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Case Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  اسم أو موضوع القضية <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                  placeholder="مثال: دعوى طرد للغصب، جنحة إيصال أمانة، استئناف تعويضات..."
                  className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A059] transition"
                />
              </div>

              {/* Grid 2 cols: Court & Case Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    المحكمة والدائرة <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={courtName}
                    onChange={(e) => setCourtName(e.target.value)}
                    placeholder="مثال: محكمة جنوب الجيزة الابتدائية - الدائرة ٧ إيجارات"
                    className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A059] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    رقم الدعوى / الرول (اختياري)
                  </label>
                  <input
                    type="text"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    placeholder="مثال: دعوى رقم ٥١٢ لسنة ٢٠٢٥ مدني كلي"
                    className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A059] transition"
                  />
                </div>
              </div>

              {/* Grid 3 cols: Date, Time, Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    تاريخ الجلسة <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A059] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    وقت انعقاد الجلسة
                  </label>
                  <input
                    type="time"
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A059] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    نوع / صفة الجلسة
                  </label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as CourtSessionType)}
                    className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059] transition"
                  >
                    {SESSION_TYPES.map((t) => (
                      <option key={t} value={t} className="bg-[#121212]">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  المطلوب بالجلسة أو المستندات وملاحظات القرار السابق
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: تقديم أصل عقد الإيجار، وسماع شهود الإثبات، أو تقديم مذكرة بالدفاع وسداد أمانة الخبير..."
                  className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A059] transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white bg-[#222222] rounded-xl transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs bg-[#C5A059] hover:bg-[#D4B26F] text-black font-bold rounded-xl transition shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'حفظ التعديلات' : 'تأكيد الحفظ وتفعيل التنبيه'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Sessions List View */
            <div className="space-y-4">
              {/* Filter Tabs & Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222222] pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilter('upcoming')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      filter === 'upcoming'
                        ? 'bg-[#C5A059] text-black'
                        : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
                    }`}
                  >
                    الجلسات القادمة ({sessions.filter((s) => !s.isCompleted).length})
                  </button>
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      filter === 'all'
                        ? 'bg-[#C5A059] text-black'
                        : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
                    }`}
                  >
                    كافة الجلسات ({sessions.length})
                  </button>
                  <button
                    onClick={() => setFilter('completed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      filter === 'completed'
                        ? 'bg-[#C5A059] text-black'
                        : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
                    }`}
                  >
                    المنتهية ({sessions.filter((s) => s.isCompleted).length})
                  </button>
                </div>

                {sessions.length > 0 && (
                  <button
                    onClick={handleExportScheduleTxt}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 hover:text-white border border-[#333333] rounded-lg text-xs transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>تصدير جدول الجلسات (TXT)</span>
                  </button>
                )}
              </div>

              {filteredSessions.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <CalendarClock className="w-14 h-14 text-gray-700 mx-auto" />
                  <p className="text-sm font-semibold text-gray-300">
                    {filter === 'upcoming'
                      ? 'لا توجد جلسات قادمة مجدولة'
                      : 'لا توجد جلسات في هذا التصنيف'}
                  </p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    سجّل مواعيد جلساتك القادمة أمام المحاكم والنيابات ليتم تذكيرك بها عبر عداد الأيام
                    التنازلي على الشاشة الرئيسية.
                  </p>
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C5A059] hover:bg-[#D4B26F] text-black font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تسجيل جلسة الآن</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5">
                  {filteredSessions.map((session) => {
                    const timeRem = calculateTimeRemaining(
                      session.sessionDate,
                      session.sessionTime
                    );
                    const countdownLabel = getCountdownLabel(timeRem);

                    return (
                      <div
                        key={session.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          session.isCompleted
                            ? 'bg-[#141414] border-[#242424] opacity-75'
                            : timeRem.urgencyLevel === 'urgent'
                            ? 'bg-[#191313] border-red-900/60 shadow-lg'
                            : 'bg-[#161616] border-[#2A2A2A] hover:border-[#C5A059]/50'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242424] pb-3">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() =>
                                onUpdateSession(session.id, {
                                  isCompleted: !session.isCompleted,
                                })
                              }
                              title={session.isCompleted ? 'إعادة كجلسة جارية' : 'تحديد كجلسة منتهية'}
                              className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                                session.isCompleted
                                  ? 'bg-emerald-950/60 border-emerald-600 text-emerald-400'
                                  : 'border-[#444444] hover:border-[#C5A059] text-gray-400'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="bg-[#242424] text-[#C5A059] font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-[#333333]">
                                  {session.sessionType}
                                </span>
                                {session.caseNumber && (
                                  <span className="text-[11px] text-gray-400 font-mono">
                                    {session.caseNumber}
                                  </span>
                                )}
                                {session.isCompleted && (
                                  <span className="bg-emerald-950/40 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-800">
                                    تمت الجلسة
                                  </span>
                                )}
                              </div>
                              <h4
                                className={`text-sm font-bold ${
                                  session.isCompleted ? 'text-gray-400 line-through' : 'text-white'
                                }`}
                              >
                                {session.caseTitle}
                              </h4>
                            </div>
                          </div>

                          {/* Countdown Badge */}
                          <div className="flex items-center gap-2">
                            {!session.isCompleted && (
                              <div
                                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-black ${
                                  timeRem.urgencyLevel === 'urgent'
                                    ? 'bg-red-950/50 border-red-600 text-red-300 animate-pulse'
                                    : timeRem.urgencyLevel === 'warning'
                                    ? 'bg-amber-950/50 border-amber-600 text-amber-300'
                                    : 'bg-[#222222] border-[#C5A059]/40 text-[#C5A059]'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>{countdownLabel}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Court & Date details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300 my-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                            <span className="text-gray-400">المحكمة:</span>
                            <span className="text-white font-medium">{session.courtName}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                            <span className="text-gray-400">الموعد:</span>
                            <span className="text-white font-medium">
                              {formatArabicDate(session.sessionDate)} - الساعة{' '}
                              {session.sessionTime || '09:30'}
                            </span>
                          </div>
                        </div>

                        {/* Notes if any */}
                        {session.notes && (
                          <div className="bg-[#0A0A0A] p-2.5 rounded-xl border border-[#242424] text-xs text-gray-300 mb-3">
                            <span className="text-gray-500 font-bold block mb-0.5">
                              المطلوب بالجلسة / ملاحظات:
                            </span>
                            <p className="leading-relaxed">{session.notes}</p>
                          </div>
                        )}

                        {/* Card Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#222222] text-xs">
                          <button
                            onClick={() => handleShareSession(session)}
                            className="flex items-center gap-1 text-gray-400 hover:text-white transition"
                          >
                            <Share2 className="w-3.5 h-3.5 text-[#C5A059]" />
                            <span>مشاركة التفاصيل</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStartEdit(session)}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222222] rounded-lg transition"
                              title="تعديل"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteSession(session.id)}
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#141414] border-t border-[#222222] flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#C5A059]" />
            <span>يتم التنبيه تنازلياً للمواعيد القادمة في أعلى الشاشة الرئيسية تلقائياً.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#222222] hover:bg-[#2A2A2A] text-white rounded-lg transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
