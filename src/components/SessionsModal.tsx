import React, { useState, useEffect } from 'react';
import { CourtSession, CourtSessionType, SessionAttachment } from '../types';
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
  BellOff,
  BellRing,
  Volume2,
  ShieldCheck,
  Sparkles,
  MapPin,
  ChevronRight,
  Settings,
  RotateCw,
  History,
  Scale,
  Search,
  ArrowUpDown,
  Paperclip,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  Download,
} from 'lucide-react';
import {
  calculateTimeRemaining,
  formatArabicDate,
  getCountdownLabel,
} from '../utils/sessionUtils';
import { downloadTxtFile, formatSingleSessionTxt } from '../utils/exportUtils';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
  sendSessionNotification,
  REMINDER_PRESETS,
  formatLeadHoursText,
  NotificationPermissionState,
} from '../utils/notificationUtils';
import { isSessionOverdue, getBriefsDeadlineStatus } from '../utils/rolloverUtils';
import { SessionHistoryModal } from './SessionHistoryModal';

interface SessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: CourtSession[];
  onAddSession: (session: Omit<CourtSession, 'id' | 'createdAt'>) => void;
  onUpdateSession: (id: string, updated: Partial<CourtSession>) => void;
  onDeleteSession: (id: string) => void;
  initialAddOpen?: boolean;
  onOpenRollover?: (sessionId?: string) => void;
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
  onOpenRollover,
}) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'reserved' | 'completed'>('upcoming');
  const [sortBy, setSortBy] = useState<'closest' | 'newest' | 'oldest'>('closest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(initialAddOpen);
  const [editingId, setEditingId] = useState<string | null>(null);

  // History modal state
  const [selectedHistorySession, setSelectedHistorySession] = useState<CourtSession | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Notification Permission State
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>(() =>
    getNotificationPermission()
  );

  // Form State
  const [caseTitle, setCaseTitle] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [courtName, setCourtName] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('09:30');
  const [sessionType, setSessionType] = useState<CourtSessionType>('مرافعة');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<SessionAttachment[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<SessionAttachment | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true);
  const [reminderLeadHours, setReminderLeadHours] = useState<number>(24);
  const [isCustomLeadHours, setIsCustomLeadHours] = useState<boolean>(false);
  const [customLeadHoursInput, setCustomLeadHoursInput] = useState<string>('24');
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Refresh permission status when modal opens
  useEffect(() => {
    if (isOpen) {
      setPermissionState(getNotificationPermission());
    }
  }, [isOpen]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
          const newAtt: SessionAttachment = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name: file.name,
            type: isPdf ? 'pdf' : 'image',
            dataUrl,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          };
          setAttachments((prev) => [...prev, newAtt]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  const resetForm = () => {
    setCaseTitle('');
    setCaseNumber('');
    setCourtName('');
    setSessionDate('');
    setSessionTime('09:30');
    setSessionType('مرافعة');
    setNotes('');
    setAttachments([]);
    setReminderEnabled(true);
    setReminderLeadHours(24);
    setIsCustomLeadHours(false);
    setCustomLeadHoursInput('24');
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
    setAttachments(session.attachments || []);
    
    // Notification reminder settings
    const isRemEnabled = session.reminderEnabled !== false;
    setReminderEnabled(isRemEnabled);

    const leadHours = session.reminderLeadHours ?? 24;
    const isPreset = REMINDER_PRESETS.some((p) => p.hours === leadHours);
    if (isPreset) {
      setReminderLeadHours(leadHours);
      setIsCustomLeadHours(false);
      setCustomLeadHoursInput(leadHours.toString());
    } else {
      setReminderLeadHours(leadHours);
      setIsCustomLeadHours(true);
      setCustomLeadHoursInput(leadHours.toString());
    }

    setEditingId(session.id);
    setIsFormOpen(true);
  };

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermissionState(result);
    if (result === 'granted') {
      triggerToast('تم تفعيل إشعارات المتصفح بنجاح! ستصلك تنبيهات الجلسات تلقائياً.');
    } else if (result === 'denied') {
      triggerToast('تم حظر الإشعارات في المتصفح. يمكنك تفعيلها من أيقونة القفل بشريط العنوان.');
    } else {
      triggerToast('لم يتم تفعيل الإذن بعد.');
    }
  };

  const handleTestNotification = async () => {
    const res = await sendTestNotification();
    setPermissionState(res.permission);
    triggerToast(res.message);
  };

  const handleQuickTestSession = (session: CourtSession) => {
    const lead = session.reminderLeadHours ?? 24;
    const sent = sendSessionNotification(session, lead, true);
    if (sent) {
      triggerToast(`تم إرسال إشعار تجريبي للجلسة: "${session.caseTitle}"`);
    } else {
      triggerToast('يرجى تفعيل إذن الإشعارات أولاً بالضغط على زر "تفعيل الإشعارات" بالأعلى.');
    }
  };

  const handleToggleReminder = (session: CourtSession) => {
    const updatedState = !(session.reminderEnabled !== false);
    onUpdateSession(session.id, { reminderEnabled: updatedState });
    triggerToast(
      updatedState
        ? `تم تفعيل التنبيه لجلسة "${session.caseTitle}"`
        : `تم إيقاف التنبيه لجلسة "${session.caseTitle}"`
    );
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

    const calculatedLeadHours = isCustomLeadHours
      ? Math.max(1, Math.min(720, Number(customLeadHoursInput) || 24))
      : reminderLeadHours;

    if (editingId) {
      onUpdateSession(editingId, {
        caseTitle: caseTitle.trim(),
        caseNumber: caseNumber.trim() || undefined,
        courtName: courtName.trim(),
        sessionDate,
        sessionTime,
        sessionType,
        notes: notes.trim() || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        reminderEnabled,
        reminderLeadHours: calculatedLeadHours,
      });
      triggerToast('تم تحديث موعد الجلسة والمرفقات بنجاح');
    } else {
      onAddSession({
        caseTitle: caseTitle.trim(),
        caseNumber: caseNumber.trim() || undefined,
        courtName: courtName.trim(),
        sessionDate,
        sessionTime,
        sessionType,
        notes: notes.trim() || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        isCompleted: false,
        reminderEnabled,
        reminderLeadHours: calculatedLeadHours,
      });
      triggerToast('تم حفظ موعد الجلسة والمرفقات بنجاح');
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

  const handleExportSingleSessionTxt = (session: CourtSession) => {
    const textContent = formatSingleSessionTxt(session);
    const cleanTitle = session.caseTitle
      .replace(/[/\\?%*:|"<>]/g, '_')
      .slice(0, 30)
      .trim();
    const cleanDate = session.sessionDate.replace(/-/g, '');
    const filename = `جلسة_${cleanTitle || 'قضائية'}_${cleanDate}.txt`;
    downloadTxtFile(filename, textContent);
    triggerToast(`تم إنشاء وتصدير ملف نصي لجلسة "${session.caseTitle}" بنجاح`);
  };

  const handleExportScheduleTxt = () => {
    const safeSessions = sessions || [];
    if (safeSessions.length === 0) return;
    let out = `======================================================================
جدول ومواعيد الجلسات القضائية - المحامي الذكي
إجمالي الجلسات: ${safeSessions.length}
تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-EG')}
======================================================================\n\n`;

    safeSessions.forEach((s, idx) => {
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
  const safeSessions = sessions || [];
  const sortedSessions = [...safeSessions].sort((a, b) => {
    const aTime = new Date(`${a.sessionDate}T${a.sessionTime || '09:00'}`).getTime();
    const bTime = new Date(`${b.sessionDate}T${b.sessionTime || '09:00'}`).getTime();
    if (sortBy === 'newest') {
      return bTime - aTime;
    } else if (sortBy === 'oldest') {
      return aTime - bTime;
    } else {
      // 'closest': closest upcoming / chronological ascending
      return aTime - bTime;
    }
  });

  const overdueSessions = safeSessions.filter((s) => isSessionOverdue(s));
  const reservedSessions = safeSessions.filter((s) => s.isReservedForJudgment && !s.isCompleted);

  const filteredSessions = sortedSessions.filter((s) => {
    if (filter === 'upcoming' && s.isCompleted) return false;
    if (filter === 'reserved' && (!s.isReservedForJudgment || s.isCompleted)) return false;
    if (filter === 'completed' && !s.isCompleted) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchesTitle = s.caseTitle?.toLowerCase().includes(q);
      const matchesNumber = s.caseNumber?.toLowerCase().includes(q);
      const matchesCourt = s.courtName?.toLowerCase().includes(q);
      const matchesNotes = s.notes?.toLowerCase().includes(q);
      const matchesType = s.sessionType?.toLowerCase().includes(q);
      if (!matchesTitle && !matchesNumber && !matchesCourt && !matchesNotes && !matchesType) {
        return false;
      }
    }

    return true;
  });

  const upcomingCount = safeSessions.filter((s) => !s.isCompleted).length;
  const reservedCount = reservedSessions.length;

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

              {/* Attachments Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>مرفقات الجلسة (صور أو ملفات PDF):</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 text-xs bg-[#1F1B12] hover:bg-[#2A2315] text-[#C5A059] border border-[#C5A059]/40 px-3 py-1.5 rounded-lg transition font-medium cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إرفاق ملفات...</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {attachments.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="relative group bg-[#121212] border border-[#2B2B2B] rounded-xl p-2.5 flex items-center gap-2.5"
                      >
                        {att.type === 'image' ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-black shrink-0 border border-[#333]">
                            <img src={att.dataUrl} alt={att.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-red-950/40 text-red-400 border border-red-800/60 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-200 truncate">{att.name}</p>
                          <span className="text-[10px] text-gray-500 uppercase">{att.type}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-red-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                          title="حذف المرفق"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#2B2B2B] hover:border-[#C5A059]/50 rounded-xl p-4 text-center cursor-pointer transition bg-[#101010]"
                  >
                    <p className="text-xs text-gray-400">انقر هنا لإرفاق مستندات الدفاع، صور المحاضر، العقود، أو ملفات PDF</p>
                  </div>
                )}
              </div>

              {/* Web Notification Settings */}
              <div className="bg-[#121212] border border-[#2B2B2B] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      reminderEnabled ? 'bg-[#C5A059]/20 text-[#C5A059]' : 'bg-[#222222] text-gray-500'
                    }`}>
                      {reminderEnabled ? <BellRing className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        تفعيل إشعارات المتصفح (Web Notifications)
                      </span>
                      <span className="text-[11px] text-gray-400 block">
                        إرسال تنبيه مسبق إلى سطح المكتب مع نغمة صوتية قبل انعقاد الجلسة
                      </span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderEnabled}
                      onChange={(e) => setReminderEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#2B2B2B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C5A059]"></div>
                  </label>
                </div>

                {reminderEnabled && (
                  <div className="pt-3 border-t border-[#222222] space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>توقيت إرسال التنبيه مسبقاً:</span>
                      </label>
                      <span className="text-[11px] text-[#C5A059] font-medium">
                        {isCustomLeadHours
                          ? `قبل الموعد بـ ${customLeadHoursInput || 24} ساعة`
                          : formatLeadHoursText(reminderLeadHours)}
                      </span>
                    </div>

                    {/* Presets Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {REMINDER_PRESETS.map((preset) => {
                        const isSelected = !isCustomLeadHours && reminderLeadHours === preset.hours;
                        return (
                          <button
                            key={preset.hours}
                            type="button"
                            onClick={() => {
                              setIsCustomLeadHours(false);
                              setReminderLeadHours(preset.hours);
                            }}
                            className={`p-2 rounded-xl text-[11px] font-semibold text-center border transition cursor-pointer ${
                              isSelected
                                ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059] shadow-sm'
                                : 'bg-[#181818] border-[#2A2A2A] text-gray-400 hover:text-white hover:border-[#444444]'
                            }`}
                          >
                            {preset.hours === 24 ? '⭐ قبل 24 ساعة (افتراضي)' : formatLeadHoursText(preset.hours)}
                          </button>
                        );
                      })}

                      {/* Custom Hours Option */}
                      <button
                        type="button"
                        onClick={() => setIsCustomLeadHours(true)}
                        className={`p-2 rounded-xl text-[11px] font-semibold text-center border transition cursor-pointer ${
                          isCustomLeadHours
                            ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059] shadow-sm'
                            : 'bg-[#181818] border-[#2A2A2A] text-gray-400 hover:text-white hover:border-[#444444]'
                        }`}
                      >
                        ⏱️ توقيت مخصص بالساعات...
                      </button>
                    </div>

                    {isCustomLeadHours && (
                      <div className="flex items-center gap-2 bg-[#0E0E0E] p-2.5 rounded-xl border border-[#2B2B2B]">
                        <label className="text-xs text-gray-300 shrink-0">
                          حدد عدد الساعات قبل الجلسة:
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="720"
                          value={customLeadHoursInput}
                          onChange={(e) => setCustomLeadHoursInput(e.target.value)}
                          className="w-24 bg-[#181818] border border-[#444444] rounded-lg px-2.5 py-1 text-xs text-white text-center focus:border-[#C5A059] outline-none"
                        />
                        <span className="text-xs text-gray-400">ساعة</span>
                      </div>
                    )}

                    {/* Permission hint */}
                    {permissionState !== 'granted' && (
                      <div className="flex items-center justify-between p-2.5 bg-amber-950/20 border border-amber-800/40 rounded-xl text-[11px] text-amber-300">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>إشعارات المتصفح غير مصرح بها بعد على هذا الجهاز.</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleRequestPermission}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition"
                        >
                          تفعيل الإذن الآن
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
              {/* Web Notifications Status & Quick Test Panel */}
              <div className="p-4 bg-gradient-to-r from-[#17140D] via-[#141414] to-[#121212] rounded-2xl border border-[#C5A059]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      permissionState === 'granted'
                        ? 'bg-emerald-950/50 border-emerald-700/50 text-emerald-400'
                        : permissionState === 'denied'
                        ? 'bg-red-950/50 border-red-700/50 text-red-400'
                        : 'bg-[#C5A059]/20 border-[#C5A059]/40 text-[#C5A059]'
                    }`}
                  >
                    {permissionState === 'granted' ? (
                      <BellRing className="w-4 h-4" />
                    ) : permissionState === 'denied' ? (
                      <BellOff className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-xs font-bold text-white">
                        نظام إشعارات المتصفح (Web Notifications)
                      </span>
                      {permissionState === 'granted' ? (
                        <span className="bg-emerald-950/60 border border-emerald-700 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>مصرح ومفعل (تنبيه مسبق بـ 24 ساعة)</span>
                        </span>
                      ) : permissionState === 'denied' ? (
                        <span className="bg-red-950/60 border border-red-700 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          تم رفض الإذن بالمتصفح
                        </span>
                      ) : (
                        <span className="bg-amber-950/60 border border-amber-700 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          بانتظار إذن التفعيل
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      يتم إرسال إشعار فوري لسطح المكتب مع رنين تنبيه صوتي قبل موعد كل جلسة بـ 24 ساعة (أو حسب التوقيت المحدد لكل جلسة).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {permissionState !== 'granted' && (
                    <button
                      onClick={handleRequestPermission}
                      className="px-3 py-1.5 bg-[#C5A059] hover:bg-[#D4B26F] text-black font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>تفعيل الإشعارات الآن</span>
                    </button>
                  )}
                  <button
                    onClick={handleTestNotification}
                    className="px-3 py-1.5 bg-[#1E1E1E] hover:bg-[#282828] text-gray-200 hover:text-white border border-[#3A3A3A] hover:border-[#C5A059]/60 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                    title="إرسال إشعار تجريبي فوري للتأكد من عمل الصوت والإشعار"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>تجربة إشعار الآن</span>
                  </button>
                </div>
              </div>

              {/* Overdue Sessions Rollover Alert Banner */}
              {overdueSessions.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-amber-950/40 via-[#1C160C] to-[#141414] border border-amber-600/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                      <RotateCw className="w-5 h-5 animate-spin-slow" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                        <span>تنبيه قضائي: توجد {overdueSessions.length} جلسات مستحقة للترحيل الآلي</span>
                      </h4>
                      <p className="text-xs text-gray-400">
                        انقضت مواعيد هذه الجلسات وتحتاج لإثبات قرار المحكمة الصادر (تأجيل لجلسة قادمة، حجز للحكم، أو مد الأجل).
                      </p>
                    </div>
                  </div>

                  {onOpenRollover && (
                    <button
                      onClick={() => onOpenRollover(overdueSessions[0]?.id)}
                      className="px-4 py-2 bg-gradient-to-r from-[#C5A059] to-[#D4B26F] hover:brightness-110 text-black font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>بدء الترحيل الآلي الآن ({overdueSessions.length})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Search Bar & Filter Tabs */}
              <div className="space-y-3 border-b border-[#222222] pb-3">
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <Search className="w-4 h-4 text-[#C5A059]" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث في عناوين الجلسات، أرقام القضايا، أسماء المحاكم، أو الملاحظات..."
                    className="w-full bg-[#181818] border border-[#333333] focus:border-[#C5A059] text-gray-100 placeholder-gray-500 text-xs rounded-xl pr-9 pl-8 py-2.5 outline-none transition shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 hover:text-white cursor-pointer"
                      title="مسح البحث"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Sorting Options Bar */}
                <div className="flex items-center justify-between gap-2 bg-[#141414] px-3 py-2 rounded-xl border border-[#222222]">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>الفرز حسب:</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setSortBy('closest')}
                      className={`px-2.5 py-1 rounded-lg text-xs transition ${
                        sortBy === 'closest'
                          ? 'bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/50 font-semibold'
                          : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
                      }`}
                    >
                      ⚡ قريبة الموعد
                    </button>
                    <button
                      onClick={() => setSortBy('newest')}
                      className={`px-2.5 py-1 rounded-lg text-xs transition ${
                        sortBy === 'newest'
                          ? 'bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/50 font-semibold'
                          : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
                      }`}
                    >
                      🕒 الأحدث تاريخاً
                    </button>
                    <button
                      onClick={() => setSortBy('oldest')}
                      className={`px-2.5 py-1 rounded-lg text-xs transition ${
                        sortBy === 'oldest'
                          ? 'bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/50 font-semibold'
                          : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
                      }`}
                    >
                      📜 الأقدم تاريخاً
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setFilter('upcoming')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        filter === 'upcoming'
                          ? 'bg-[#C5A059] text-black font-bold'
                          : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
                      }`}
                    >
                      الجلسات القادمة ({upcomingCount})
                    </button>

                    <button
                      onClick={() => setFilter('reserved')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                        filter === 'reserved'
                          ? 'bg-[#C5A059] text-black font-bold'
                          : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
                      }`}
                    >
                      <span>المحجوزة للحكم ⚖️</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          filter === 'reserved' ? 'bg-black text-[#C5A059]' : 'bg-[#262626] text-amber-400'
                        }`}
                      >
                        {reservedCount}
                      </span>
                    </button>

                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        filter === 'all'
                          ? 'bg-[#C5A059] text-black font-bold'
                          : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
                      }`}
                    >
                      كافة الجلسات ({sessions.length})
                    </button>

                    <button
                      onClick={() => setFilter('completed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        filter === 'completed'
                          ? 'bg-[#C5A059] text-black font-bold'
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
                    التنازلي وإشعارات المتصفح التلقائية قبل موعد كل جلسة بـ 24 ساعة.
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
                    const isRemActive = session.reminderEnabled !== false;
                    const leadHours = session.reminderLeadHours ?? 24;
                    const briefsStatus = getBriefsDeadlineStatus(session.briefsDeadline);

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
                                {session.isReservedForJudgment ? (
                                  <span className="bg-[#C5A059] text-black font-black text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                    <Scale className="w-3 h-3" />
                                    <span>محجوزة للحكم</span>
                                  </span>
                                ) : (
                                  <span className="bg-[#242424] text-[#C5A059] font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-[#333333]">
                                    {session.sessionType}
                                  </span>
                                )}

                                {briefsStatus && (
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                      briefsStatus.isPast
                                        ? 'bg-red-950/60 border-red-700 text-red-300'
                                        : briefsStatus.isToday
                                        ? 'bg-amber-950/60 border-amber-600 text-amber-300 animate-pulse'
                                        : 'bg-[#1A160C] border-[#C5A059]/60 text-amber-300'
                                    }`}
                                  >
                                    <Clock className="w-3 h-3" />
                                    <span>{briefsStatus.label}</span>
                                  </span>
                                )}

                                {session.rolloverCount ? (
                                  <span className="bg-[#242424] text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                                    مؤجلة {session.rolloverCount} مرات
                                  </span>
                                ) : null}

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

                        {/* Last Court Decision / Postponement reason */}
                        {session.postponementReason && (
                          <div className="bg-[#111111] p-2.5 rounded-xl border border-[#262626] text-xs text-gray-300 mb-3 flex items-start gap-2">
                            <Scale className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5" />
                            <div>
                              <span className="text-gray-400 font-bold ml-1">آخر قرار للمحكمة:</span>
                              <span className="text-gray-200">{session.postponementReason}</span>
                            </div>
                          </div>
                        )}

                        {/* Notification Status Badge */}
                        <div className="flex items-center justify-between bg-[#101010] px-3 py-2 rounded-xl border border-[#242424] mb-3 text-xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            {isRemActive ? (
                              <span className="text-[#C5A059] font-medium flex items-center gap-1.5">
                                <BellRing className="w-3.5 h-3.5 text-[#C5A059]" />
                                <span>تنبيه المتصفح: {formatLeadHoursText(leadHours)}</span>
                              </span>
                            ) : (
                              <span className="text-gray-500 font-medium flex items-center gap-1.5">
                                <BellOff className="w-3.5 h-3.5 text-gray-500" />
                                <span>التنبيه متوقف لهذه الجلسة</span>
                              </span>
                            )}

                            {session.lastNotifiedAt && (
                              <span className="text-emerald-400 text-[11px] font-semibold bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                                ✓ تم إرسال إشعار التذكير
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleReminder(session)}
                              className="text-[11px] text-gray-400 hover:text-white px-2 py-0.5 rounded bg-[#1C1C1C] hover:bg-[#252525] border border-[#333333] transition"
                            >
                              {isRemActive ? 'إيقاف التنبيه' : 'تفعيل التنبيه'}
                            </button>
                            {isRemActive && (
                              <button
                                onClick={() => handleQuickTestSession(session)}
                                className="text-[11px] text-[#C5A059] hover:text-[#D4B26F] px-2 py-0.5 rounded bg-[#1C1810] hover:bg-[#282214] border border-[#C5A059]/40 transition flex items-center gap-1"
                                title="إرسال إشعار تجريبي لهذه الدعوى الآن"
                              >
                                <Volume2 className="w-3 h-3" />
                                <span>تجربة تنبيه الدعوى</span>
                              </button>
                            )}
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

                        {/* Session Attachments Gallery / Badges */}
                        {session.attachments && session.attachments.length > 0 && (
                          <div className="bg-[#121212] p-3 rounded-xl border border-[#2B2B2B] mb-3 space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C5A059]">
                              <Paperclip className="w-3.5 h-3.5" />
                              <span>المستندات والمرفقات ({session.attachments.length}):</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {session.attachments.map((att) => (
                                <button
                                  key={att.id}
                                  type="button"
                                  onClick={() => setPreviewAttachment(att)}
                                  className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] hover:border-[#C5A059]/50 px-2.5 py-1.5 rounded-lg text-xs text-gray-200 transition group cursor-pointer"
                                  title="انقر لعرض المرفق"
                                >
                                  {att.type === 'image' ? (
                                    <div className="w-6 h-6 rounded overflow-hidden bg-black shrink-0 border border-[#444]">
                                      <img src={att.dataUrl} alt={att.name} className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 rounded bg-red-950/60 text-red-400 flex items-center justify-center shrink-0">
                                      <FileText className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                  <span className="truncate max-w-[120px] font-medium">{att.name}</span>
                                  <Eye className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#C5A059]" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Card Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#222222] text-xs flex-wrap gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {onOpenRollover && !session.isCompleted && (
                              <button
                                onClick={() => onOpenRollover(session.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1F1B12] hover:bg-[#2A2315] text-[#C5A059] hover:text-[#D4B26F] border border-[#C5A059]/50 hover:border-[#C5A059] rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                                title="ترحيل الجلسة وإثبات قرار التأجيل أو الحجز للحكم"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                                <span>
                                  {session.isReservedForJudgment ? 'مد الأجل / إثبات الحكم' : 'ترحيل الجلسة'}
                                </span>
                              </button>
                            )}

                            {session.history && session.history.length > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedHistorySession(session);
                                  setIsHistoryModalOpen(true);
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1C1C1C] hover:bg-[#252525] text-gray-300 hover:text-white border border-[#333333] rounded-xl text-xs transition cursor-pointer"
                                title="عرض رول الجلسات وتاريخ القرارات والتأجيلات السابقة"
                              >
                                <History className="w-3.5 h-3.5 text-amber-400" />
                                <span>رول القضية ({session.history.length})</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleExportSingleSessionTxt(session)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#191919] hover:bg-[#242424] text-gray-200 hover:text-[#C5A059] border border-[#333333] hover:border-[#C5A059]/60 rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
                              title="تصدير كملف نصي (TXT) يحتوي على كافة تفاصيل هذه الجلسة لتسهيل طباعتها أو مشاركتها"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
                              <span>تصدير كملف نصي</span>
                            </button>

                            <button
                              onClick={() => handleShareSession(session)}
                              className="flex items-center gap-1 text-gray-400 hover:text-white transition px-2 py-1 hover:bg-[#1A1A1A] rounded-lg"
                            >
                              <Share2 className="w-3.5 h-3.5 text-[#C5A059]" />
                              <span>مشاركة التفاصيل</span>
                            </button>
                          </div>

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

      {/* Case Session Rollover History Modal */}
      <SessionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedHistorySession(null);
        }}
        session={selectedHistorySession}
      />

      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626]">
              <div className="flex items-center gap-2.5">
                <Paperclip className="w-5 h-5 text-[#C5A059]" />
                <div>
                  <h3 className="text-sm font-bold text-white">{previewAttachment.name}</h3>
                  <span className="text-[11px] text-gray-400 uppercase">
                    {previewAttachment.type === 'image' ? 'صورة مرفقة' : 'مستند PDF'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewAttachment.dataUrl}
                  download={previewAttachment.name}
                  className="flex items-center gap-1 text-xs bg-[#1F1B12] hover:bg-[#2A2315] text-[#C5A059] border border-[#C5A059]/40 px-3 py-1.5 rounded-lg transition"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل</span>
                </a>
                <button
                  onClick={() => setPreviewAttachment(null)}
                  className="w-8 h-8 rounded-lg bg-[#222222] text-gray-400 hover:text-white flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-auto flex items-center justify-center bg-black/50">
              {previewAttachment.type === 'image' ? (
                <img
                  src={previewAttachment.dataUrl}
                  alt={previewAttachment.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-xl border border-[#333]"
                />
              ) : (
                <iframe
                  src={previewAttachment.dataUrl}
                  title={previewAttachment.name}
                  className="w-full h-[70vh] rounded-xl border border-[#333] bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
