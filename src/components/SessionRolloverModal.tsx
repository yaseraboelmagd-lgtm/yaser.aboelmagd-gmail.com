import React, { useState, useEffect } from 'react';
import { CourtSession, CourtSessionType, RolloverDecisionType } from '../types';
import {
  RotateCw,
  X,
  Calendar,
  Gavel,
  Clock,
  Check,
  AlertTriangle,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Scale,
  CalendarDays,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import {
  COMMON_POSTPONEMENT_REASONS,
  JUDGMENT_RESERVATION_TEMPLATES,
  calculateSuggestedDate,
} from '../utils/rolloverUtils';
import { formatArabicDate } from '../utils/sessionUtils';

interface SessionRolloverModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionsToRollover: CourtSession[];
  activeSessionId?: string | null;
  onApplyRollover: (
    sessionId: string,
    params: {
      decisionType: RolloverDecisionType;
      decisionReason: string;
      newSessionDate?: string;
      newSessionTime?: string;
      newSessionType?: CourtSessionType;
      newNotes?: string;
      briefsDeadline?: string;
      verdictText?: string;
    }
  ) => void;
}

export const SessionRolloverModal: React.FC<SessionRolloverModalProps> = ({
  isOpen,
  onClose,
  sessionsToRollover,
  activeSessionId,
  onApplyRollover,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Form states
  const [decisionType, setDecisionType] = useState<RolloverDecisionType>('تأجيل');
  const [decisionReason, setDecisionReason] = useState('');
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newSessionTime, setNewSessionTime] = useState('09:30');
  const [newSessionType, setNewSessionType] = useState<CourtSessionType>('مرافعة');
  const [hasBriefsDeadline, setHasBriefsDeadline] = useState(false);
  const [briefsDeadlineDate, setBriefsDeadlineDate] = useState('');
  const [briefsDeadlineDays, setBriefsDeadlineDays] = useState<number>(7);
  const [newNotes, setNewNotes] = useState('');
  const [verdictText, setVerdictText] = useState('');
  const [activeReasonCategory, setActiveReasonCategory] = useState<string>('المستندات والمذكرات');
  const [formError, setFormError] = useState('');

  // Target session
  const safeSessions = sessionsToRollover || [];
  const currentSession: CourtSession | undefined =
    safeSessions.find((s) => s.id === activeSessionId) ||
    safeSessions[currentIndex] ||
    safeSessions[0];

  // Sync state whenever currentSession changes or modal opens
  useEffect(() => {
    if (!currentSession) return;

    // By default, if the session was already 'نطق بالحكم', suggest 'مد أجل الحكم' or 'صدور الحكم'
    if (currentSession.isReservedForJudgment || currentSession.sessionType === 'نطق بالحكم') {
      setDecisionType('مد أجل الحكم');
      setDecisionReason('مد أجل النطق بالحكم لإتمام المداولة');
      setNewSessionDate(calculateSuggestedDate(currentSession.sessionDate, 14));
      setNewSessionType('نطق بالحكم');
    } else {
      setDecisionType('تأجيل');
      setDecisionReason('التأجيل لتقديم أصل المستندات والمذكرات');
      setNewSessionDate(calculateSuggestedDate(currentSession.sessionDate, 14));
      setNewSessionType('مرافعة');
    }

    setNewSessionTime(currentSession.sessionTime || '09:30');
    setHasBriefsDeadline(false);
    setBriefsDeadlineDate('');
    setNewNotes(currentSession.notes || '');
    setVerdictText('');
    setFormError('');
  }, [currentSession?.id, isOpen]);

  if (!isOpen || !currentSession) return null;

  const totalSessions = sessionsToRollover.length;
  const isMultiBatch = totalSessions > 1;

  // Handler for quick date offsets (+7, +14, +21, +30, +60)
  const handleSetQuickDate = (days: number) => {
    const calculated = calculateSuggestedDate(currentSession.sessionDate, days);
    setNewSessionDate(calculated);
  };

  // Handler for Judgment Reservation template click
  const handleSelectJudgmentTemplate = (template: typeof JUDGMENT_RESERVATION_TEMPLATES[0]) => {
    setDecisionReason(template.reason);
    if (template.daysForBriefs > 0) {
      setHasBriefsDeadline(true);
      setBriefsDeadlineDays(template.daysForBriefs);
      setBriefsDeadlineDate(calculateSuggestedDate(currentSession.sessionDate, template.daysForBriefs));
    } else {
      setHasBriefsDeadline(false);
      setBriefsDeadlineDate('');
    }
  };

  const handleDecisionTypeChange = (type: RolloverDecisionType) => {
    setDecisionType(type);
    setFormError('');

    if (type === 'حجز للحكم') {
      setDecisionReason(JUDGMENT_RESERVATION_TEMPLATES[0].reason);
      setNewSessionDate(calculateSuggestedDate(currentSession.sessionDate, 21)); // usually 3 weeks to 1 month
      setNewSessionType('نطق بالحكم');
      setHasBriefsDeadline(true);
      setBriefsDeadlineDays(7);
      setBriefsDeadlineDate(calculateSuggestedDate(currentSession.sessionDate, 7));
    } else if (type === 'مد أجل الحكم') {
      setDecisionReason('مد أجل النطق بالحكم لجلسة قادمة لإتمام المداولة بين أعضاء الدائرة');
      setNewSessionDate(calculateSuggestedDate(currentSession.sessionDate, 14));
      setNewSessionType('نطق بالحكم');
      setHasBriefsDeadline(false);
    } else if (type === 'إعادة للمرافعة') {
      setDecisionReason('إعادة الدعوى للمرافعة لفتح باب المرافعة وسماع إيضاحات الخصوم');
      setNewSessionDate(calculateSuggestedDate(currentSession.sessionDate, 14));
      setNewSessionType('مرافعة');
      setHasBriefsDeadline(false);
    } else if (type === 'صدور الحكم') {
      setDecisionReason('صدور الحكم الفاصل في موضوع الدعوى بجلسة اليوم');
      setVerdictText('حكمت المحكمة حضورياً بـ...');
    } else {
      // standard postponement
      setDecisionReason('التأجيل لتقديم أصل المستندات والمذكرات');
      setNewSessionDate(calculateSuggestedDate(currentSession.sessionDate, 14));
      setNewSessionType('تقديم مستندات');
      setHasBriefsDeadline(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!decisionReason.trim()) {
      setFormError('يرجى تحديد أو كتابة سبب القرار الصادر من المحكمة');
      return;
    }

    if (decisionType !== 'صدور الحكم' && !newSessionDate) {
      setFormError('يرجى تحديد تاريخ الجلسة القادمة');
      return;
    }

    if (decisionType === 'صدور الحكم' && !verdictText.trim()) {
      setFormError('يرجى تدوين منطوق الحكم الصادر');
      return;
    }

    onApplyRollover(currentSession.id, {
      decisionType,
      decisionReason: decisionReason.trim(),
      newSessionDate: decisionType === 'صدور الحكم' ? undefined : newSessionDate,
      newSessionTime,
      newSessionType,
      newNotes: newNotes.trim() || undefined,
      briefsDeadline: hasBriefsDeadline && briefsDeadlineDate ? briefsDeadlineDate : undefined,
      verdictText: decisionType === 'صدور الحكم' ? verdictText.trim() : undefined,
    });

    // If in multi-session wizard mode, advance to next session
    if (isMultiBatch && currentIndex < totalSessions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-[#2B2B2B] rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-right">
        
        {/* Header */}
        <div className="p-5 border-b border-[#222222] flex items-center justify-between bg-[#181818]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C5A059]/20 border border-[#C5A059]/40 rounded-xl flex items-center justify-center text-[#C5A059]">
              <RotateCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#C5A059]">
                  الترحيل الآلي للجلسة وإثبات القرار القضائي
                </h3>
                {isMultiBatch && (
                  <span className="bg-[#C5A059] text-black text-[11px] font-black px-2 py-0.5 rounded-full">
                    جلسة {currentIndex + 1} من {totalSessions}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                تسجيل قرارات التأجيل وحجز الدعوى للحكم أو مد أجل الحكم مع حاسبة التواريخ التلقائية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-[#222222] hover:bg-[#2A2A2A] rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Case Context Banner */}
        <div className="bg-gradient-to-r from-[#17140D] via-[#141414] to-[#101010] p-4 border-b border-[#2A2A2A] flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-[#242424] text-[#C5A059] font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-[#333333]">
                {currentSession.sessionType}
              </span>
              {currentSession.caseNumber && (
                <span className="text-[11px] text-gray-400 font-mono">
                  {currentSession.caseNumber}
                </span>
              )}
              {currentSession.isReservedForJudgment && (
                <span className="bg-amber-950/60 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-700/60">
                  ⚖️ محجوزة للحكم سابقاً
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-white truncate">{currentSession.caseTitle}</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              {currentSession.courtName} • تاريخ الجلسة الحالية: {formatArabicDate(currentSession.sessionDate)}
            </p>
          </div>

          {isMultiBatch && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="p-2 bg-[#222222] hover:bg-[#2A2A2A] disabled:opacity-30 rounded-xl text-gray-300 transition"
                title="الجلسة السابقة"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={currentIndex === totalSessions - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(totalSessions - 1, prev + 1))}
                className="p-2 bg-[#222222] hover:bg-[#2A2A2A] disabled:opacity-30 rounded-xl text-gray-300 transition"
                title="الجلسة التالية"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-[#0E0E0E] space-y-5">
          {formError && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Decision Type Tabs */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              نوع قرار المحكمة بالجلسة <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { type: 'تأجيل', label: 'تأجيل لجلسة قادمة', icon: '🔄' },
                { type: 'حجز للحكم', label: 'حجز الدعوى للحكم', icon: '⚖️' },
                { type: 'مد أجل الحكم', label: 'مد أجل الحكم', icon: '⏳' },
                { type: 'إعادة للمرافعة', label: 'إعادة للمرافعة', icon: '📜' },
                { type: 'صدور الحكم', label: 'صدور الحكم النهائي', icon: '🏆' },
              ].map((item) => {
                const isActive = decisionType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleDecisionTypeChange(item.type as RolloverDecisionType)}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isActive
                        ? 'bg-[#C5A059] text-black border-[#C5A059] font-bold shadow-lg'
                        : 'bg-[#181818] border-[#2A2A2A] text-gray-300 hover:bg-[#222222] hover:border-[#383838]'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Workflows */}
          {decisionType === 'حجز للحكم' && (
            <div className="bg-[#17140D] border border-[#C5A059]/40 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C5A059] flex items-center gap-1.5">
                  <Scale className="w-4 h-4" />
                  <span>نماذج قرارات حجز الدعوى للحكم مع التصريح بمذكرات</span>
                </span>
                <span className="text-[10px] text-gray-400">انقر لاختيار النموذج وتحديث الأجل</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {JUDGMENT_RESERVATION_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectJudgmentTemplate(tmpl)}
                    className={`p-2.5 rounded-xl border text-right text-xs transition cursor-pointer ${
                      decisionReason === tmpl.reason
                        ? 'bg-[#C5A059]/20 border-[#C5A059] text-white font-semibold'
                        : 'bg-[#1A1A1A] border-[#333333] text-gray-300 hover:border-[#C5A059]/50'
                    }`}
                  >
                    <span className="text-amber-400 font-bold block mb-1">⚖️ {tmpl.label}</span>
                    <span className="text-[11px] text-gray-400 line-clamp-2">{tmpl.reason}</span>
                  </button>
                ))}
              </div>

              {/* Briefs Deadline Setting */}
              <div className="pt-2 border-t border-[#2A2A2A] flex items-center justify-between flex-wrap gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                  <input
                    type="checkbox"
                    checked={hasBriefsDeadline}
                    onChange={(e) => setHasBriefsDeadline(e.target.checked)}
                    className="w-4 h-4 rounded text-[#C5A059] focus:ring-0"
                  />
                  <span>تحديد مهلة تقديم مذكرات الدفاع والمستندات المصرح بها</span>
                </label>

                {hasBriefsDeadline && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">تاريخ انتهاء المهلة:</span>
                    <input
                      type="date"
                      value={briefsDeadlineDate}
                      onChange={(e) => setBriefsDeadlineDate(e.target.value)}
                      className="bg-[#0C0C0C] border border-[#3A3A3A] rounded-lg px-2.5 py-1 text-xs text-amber-300 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {decisionType === 'تأجيل' && (
            /* Judicial Postponement Reasons Quick Selector */
            <div className="bg-[#151515] border border-[#262626] p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>القرارات القضائية النموذجية للتأجيل (المحاكم المصرية)</span>
                </span>
                <div className="flex items-center gap-1 overflow-x-auto">
                  {COMMON_POSTPONEMENT_REASONS.map((cat) => (
                    <button
                      key={cat.category}
                      type="button"
                      onClick={() => setActiveReasonCategory(cat.category)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                        activeReasonCategory === cat.category
                          ? 'bg-[#C5A059] text-black font-bold'
                          : 'bg-[#222222] text-gray-400 hover:text-white'
                      }`}
                    >
                      {cat.category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {COMMON_POSTPONEMENT_REASONS?.find(
                  (c) => c.category === activeReasonCategory
                )?.reasons?.map((reason, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDecisionReason(reason);
                      // suggest task
                      setNewNotes(`متابعة: ${reason}`);
                    }}
                    className={`p-2 rounded-xl border text-right text-xs transition cursor-pointer ${
                      decisionReason === reason
                        ? 'bg-[#C5A059]/20 border-[#C5A059] text-white font-semibold'
                        : 'bg-[#1C1C1C] border-[#2E2E2E] text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    • {reason}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Final Verdict text if judgment issued */}
          {decisionType === 'صدور الحكم' && (
            <div className="bg-[#141814] border border-emerald-800/40 p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>إثبات منطوق الحكم الصادر وإنهاء ملف الجلسات النشطة</span>
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">
                  منطوق الحكم القضائي <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={verdictText}
                  onChange={(e) => setVerdictText(e.target.value)}
                  placeholder="مثال: حكمت المحكمة حضورياً بقبول الدعوى شكلاً، وفي الموضوع بإلزام المدعى عليه بأن يؤدي للمدعي مبلغ..."
                  className="w-full bg-[#0A0A0A] border border-emerald-900/60 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Decision Reason Textarea */}
          {decisionType !== 'صدور الحكم' && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                القرار الصادر بالجلسة بالتفصيل <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={2}
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="اكتب قرار المحكمة أو اختر من الأزرار الجاهزة أعلاه..."
                className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          )}

          {/* Target Next Session Date & Time Calculator (if not final verdict) */}
          {decisionType !== 'صدور الحكم' && (
            <div className="bg-[#161616] border border-[#2A2A2A] p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-[#C5A059]" />
                  <span>تاريخ الجلسة القادمة (حاسبة المواعيد الذكية)</span>
                </span>
                
                {/* Fast date interval buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-gray-400">ترحيل لـ:</span>
                  {[
                    { label: '+ أسبوع', days: 7 },
                    { label: '+ أسبوعان', days: 14 },
                    { label: '+ ٣ أسابيع', days: 21 },
                    { label: '+ شهر', days: 30 },
                    { label: '+ شهران', days: 60 },
                  ].map((btn) => (
                    <button
                      key={btn.days}
                      type="button"
                      onClick={() => handleSetQuickDate(btn.days)}
                      className="text-[11px] px-2.5 py-1 bg-[#222222] hover:bg-[#2C2C2C] text-[#C5A059] border border-[#3A3A3A] hover:border-[#C5A059] rounded-lg transition font-medium"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">
                    تاريخ الجلسة القادمة <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={newSessionDate}
                    onChange={(e) => setNewSessionDate(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  />
                  {newSessionDate && (
                    <span className="text-[11px] text-[#C5A059] font-medium block mt-1">
                      {formatArabicDate(newSessionDate)}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">
                    توقيت انعقاد الجلسة
                  </label>
                  <input
                    type="time"
                    value={newSessionTime}
                    onChange={(e) => setNewSessionTime(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">
                    نوع الجلسة القادمة
                  </label>
                  <select
                    value={newSessionType}
                    onChange={(e) => setNewSessionType(e.target.value as CourtSessionType)}
                    className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="مرافعة">مرافعة</option>
                    <option value="نطق بالحكم">نطق بالحكم</option>
                    <option value="تقديم مستندات">تقديم مستندات</option>
                    <option value="إيداع تقرير خبير">إيداع تقرير خبير</option>
                    <option value="سماع شهود واستجواب">سماع شهود واستجواب</option>
                    <option value="تجديد حبس / معارضة">تجديد حبس / معارضة</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* New Notes / Action items for next session */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              المطلوب إعداده للجلسة القادمة / ملاحظات المحامي
            </label>
            <textarea
              rows={2}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="مثال: تجهيز حافظة مستندات بها أصل العقد، أو إعداد مذكرة بالرد على الدفع بالتقادم..."
              className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#222222]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-gray-400 hover:text-white bg-[#222222] rounded-xl transition cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 text-xs bg-[#C5A059] hover:bg-[#D4B26F] text-black font-bold rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                {decisionType === 'صدور الحكم'
                  ? 'تأكيد صدور الحكم وإنهاء الجلسة'
                  : decisionType === 'حجز للحكم'
                  ? 'ترحيل الجلسة وحجز الدعوى للحكم'
                  : 'تأكيد الترحيل وحفظ الموعد الجديد'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
