import React from 'react';
import { CourtSession } from '../types';
import {
  History,
  X,
  Calendar,
  Gavel,
  Clock,
  FileText,
  Copy,
  Check,
  CheckCircle2,
  ArrowDown,
  Scale,
} from 'lucide-react';
import { formatArabicDate } from '../utils/sessionUtils';
import { downloadTxtFile, formatSingleSessionTxt } from '../utils/exportUtils';

interface SessionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: CourtSession | null;
}

export const SessionHistoryModal: React.FC<SessionHistoryModalProps> = ({
  isOpen,
  onClose,
  session,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !session) return null;

  const history = session.history || [];

  const handleCopyTimeline = () => {
    let text = `📜 *سجل وقائع وقرارات الجلسات المتعاقبة (رول القضية)*
• *الدعوى*: ${session.caseTitle}
• *الرقم*: ${session.caseNumber || 'غير مدون'}
• *المحكمة*: ${session.courtName}
• *الجلسة الحالية*: ${formatArabicDate(session.sessionDate)} (${session.sessionType})
• *عدد مرات التأجيل والترحيل*: ${session.rolloverCount || history.length}

--- سجل الجلسات والقرارات السابقة ---
`;

    if (history.length === 0) {
      text += 'لا توجد جلسات سابقة مسجلة، هذه هي الجلسة الأولى المقيدة للدعوى.\n';
    } else {
      history.forEach((rec, idx) => {
        text += `\n[${idx + 1}] جلسة تاريخ: ${formatArabicDate(rec.previousDate)}
- القرار الصادر: ${rec.decisionType} - ${rec.decisionReason}
${rec.nextSessionDate ? `- أُجّلت إلى: ${formatArabicDate(rec.nextSessionDate)}` : ''}
${rec.briefsDeadline ? `- مهلة المذكرات المصرح بها: حتى ${formatArabicDate(rec.briefsDeadline)}` : ''}
${rec.verdictText ? `- منطوق الحكم: ${rec.verdictText}` : ''}
${rec.previousNotes ? `- الطلبات المسجلة: ${rec.previousNotes}` : ''}
--------------------------------------------------`;
      });
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleExportTxt = () => {
    const textContent = formatSingleSessionTxt(session);
    const cleanTitle = session.caseTitle
      .replace(/[/\\?%*:|"<>]/g, '_')
      .slice(0, 30)
      .trim();
    const cleanDate = session.sessionDate.replace(/-/g, '');
    const filename = `رول_جلسة_${cleanTitle || 'قضائية'}_${cleanDate}.txt`;
    downloadTxtFile(filename, textContent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-[#2B2B2B] rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-right">
        
        {/* Header */}
        <div className="p-5 border-b border-[#222222] flex items-center justify-between bg-[#181818]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C5A059]/20 border border-[#C5A059]/40 rounded-xl flex items-center justify-center text-[#C5A059]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#C5A059] flex items-center gap-2">
                <span>سجل ترحيل وتعاقب الجلسات (رول الدعوى)</span>
                {session.rolloverCount ? (
                  <span className="bg-[#262626] text-amber-400 text-xs px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    مؤجلة {session.rolloverCount} مرات
                  </span>
                ) : null}
              </h3>
              <p className="text-xs text-gray-400 truncate max-w-md">
                {session.caseTitle} {session.caseNumber ? `(${session.caseNumber})` : ''}
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

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0E0E0E] space-y-6">
          {/* Current Scheduled Session Summary Card */}
          <div className="bg-gradient-to-r from-[#1A160F] to-[#121212] border border-[#C5A059]/40 rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold text-[#C5A059] flex items-center gap-1.5">
                <Gavel className="w-3.5 h-3.5" />
                <span>الموقف الحالي للجلسة القادمة</span>
              </span>
              <span className="bg-[#C5A059] text-black text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {session.isReservedForJudgment ? '⚖️ محجوزة للحكم' : session.sessionType}
              </span>
            </div>

            <div className="text-xs text-gray-300 space-y-1">
              <p className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="text-gray-400">تاريخ الجلسة:</span>
                <span className="text-white font-bold">{formatArabicDate(session.sessionDate)}</span>
                <span className="text-gray-500 font-mono">({session.sessionTime || '09:30'})</span>
              </p>
              <p className="flex items-center gap-2">
                <Scale className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="text-gray-400">المحكمة:</span>
                <span className="text-white font-medium">{session.courtName}</span>
              </p>
              {session.briefsDeadline && (
                <p className="flex items-center gap-2 text-amber-300 bg-amber-950/30 p-1.5 rounded-lg border border-amber-800/40 mt-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>مهلة تقديم مذكرات الدفاع: حتى {formatArabicDate(session.briefsDeadline)}</span>
                </p>
              )}
            </div>
          </div>

          {/* History Timeline */}
          {history.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <History className="w-12 h-12 text-gray-700 mx-auto" />
              <p className="text-sm font-semibold text-gray-400">لا توجد تأجيلات سابقة مسجلة</p>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                عند قيامك بترحيل الجلسة أو إثبات قرار تأجيلها أو حجزها للحكم، سيتم توثيق رول الدعوى بالكامل تلقائياً هنا.
              </p>
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-y-0 before:right-4 before:w-0.5 before:bg-[#2A2A2A]">
              {history.map((item, idx) => (
                <div key={item.id || idx} className="relative pr-9">
                  {/* Timeline node icon */}
                  <div className="absolute right-2 top-3 w-4.5 h-4.5 -mr-[9px] rounded-full bg-[#1C1C1C] border-2 border-[#C5A059] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                  </div>

                  <div className="bg-[#161616] border border-[#262626] rounded-2xl p-4 space-y-2.5 hover:border-[#383838] transition">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>جلسة {formatArabicDate(item.previousDate)}</span>
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#242424] text-amber-400 border border-[#333333]">
                        {item.decisionType}
                      </span>
                    </div>

                    <div className="bg-[#0D0D0D] p-3 rounded-xl border border-[#222222] text-xs">
                      <span className="text-gray-400 font-bold block mb-1">القرار الصادر بالجلسة:</span>
                      <p className="text-gray-200 leading-relaxed font-medium">{item.decisionReason}</p>
                    </div>

                    {item.briefsDeadline && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-950/20 px-2.5 py-1 rounded-lg border border-amber-800/30">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>مصرّح بمذكرات حتى: {formatArabicDate(item.briefsDeadline)}</span>
                      </div>
                    )}

                    {item.verdictText && (
                      <div className="bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-800/40 text-xs text-emerald-200">
                        <span className="text-emerald-400 font-bold block mb-0.5">منطوق الحكم:</span>
                        <p>{item.verdictText}</p>
                      </div>
                    )}

                    {item.previousNotes && (
                      <p className="text-[11px] text-gray-500 italic">
                        الطلبات السابقة: {item.previousNotes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#161616] border-t border-[#222222] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyTimeline}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#222222] hover:bg-[#2C2C2C] text-gray-200 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer border border-[#333333]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">تم نسخ الرول كاملاً</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#C5A059]" />
                  <span>نسخ رول الجلسات للحافظة</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportTxt}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1C1810] hover:bg-[#2A2315] text-[#C5A059] hover:text-[#D4B26F] rounded-xl text-xs font-semibold transition cursor-pointer border border-[#C5A059]/40 hover:border-[#C5A059] shadow-sm"
              title="تصدير بيانات الجلسة ورول التأجيلات كملف نصي (TXT)"
            >
              <FileText className="w-4 h-4 text-[#C5A059]" />
              <span>تصدير كملف نصي</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4B26F] text-black font-bold text-xs rounded-xl transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
