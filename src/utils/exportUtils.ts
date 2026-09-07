import { SavedItem, CourtSession } from '../types';
import {
  calculateTimeRemaining,
  formatArabicDate,
  getCountdownLabel,
} from './sessionUtils';
import { formatLeadHoursText } from './notificationUtils';

/**
 * Downloads a string content as a file with UTF-8 BOM for perfect Arabic display in Notepad & text editors.
 */
export const downloadTxtFile = (filename: string, content: string) => {
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const getTypeLabel = (type: 'advisor' | 'defendant' | 'analyst' | 'contract') => {
  switch (type) {
    case 'advisor':
      return 'مستشار قانوني (استشارة عامة)';
    case 'defendant':
      return 'محامي دفاع (دفوع وخطط دفاع)';
    case 'analyst':
      return 'محلل قضايا (تكييف وتوقع أحكام)';
    case 'contract':
      return 'مسودة عقد قانوني (النموذج المصري)';
    default:
      return 'استشارة قانونية';
  }
};

/**
 * Generates formatted text for a single consultation.
 */
export const formatSingleConsultationTxt = (item: SavedItem): string => {
  return `======================================================================
المحامي الذكي | تقرير رأي واستشارة قانونية
وفقاً لأحكام القانون المصري والمبادئ القضائية
======================================================================

• عنوان الاستشارة: ${item.title}
• نوع الملف: ${getTypeLabel(item.type)}
• التاريخ: ${item.date}
• مرجع الحفظ: #${item.id}

----------------------------------------------------------------------
[ أولاً: وقائع الاستشارة والنزاع المطروح ]
----------------------------------------------------------------------
${item.query}

----------------------------------------------------------------------
[ ثانياً: التكييف القانوني، الدفوع، والسند التشريعي ]
----------------------------------------------------------------------
${item.result}

----------------------------------------------------------------------
تنويه قانوني هام:
هذا التقرير مُعد لأغراض الاسترشاد والتأصيل القانوني طبقاً للقوانين المصرية
وأحكام محكمة النقض. يُنصح دائماً بمراجعة أصول المستندات بمعرفة محامٍ مقيد.
======================================================================
تم التصدير عبر منصة: المحامي الذكي | Smart Lawyer
`;
};

/**
 * Generates structured, professional plain text for a single court session
 * containing all details, court dates, notes, judgment reservation details,
 * and complete case history/timeline for printing or sharing.
 */
export const formatSingleSessionTxt = (session: CourtSession): string => {
  const exportDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const exportTime = new Date().toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const timeRem = calculateTimeRemaining(session.sessionDate, session.sessionTime);
  const countdownText = getCountdownLabel(timeRem);
  const formattedDate = formatArabicDate(session.sessionDate);

  let out = `======================================================================
بطاقة بيانات جلسة قضائية - منصة المحامي الذكي
وفقاً لإجراءات التقاضي ومواعيد المحاكم المصرية
======================================================================
تاريخ الاستخراج: ${exportDate} - الساعة ${exportTime}
معرّف الجلسة: #${session.id.slice(-8)}
حالة الجلسة: ${session.isCompleted ? 'جلسة منتهية / تم الفصل فيها' : 'جلسة سارية ومجدولة'}

----------------------------------------------------------------------
[ أولاً: البيانات الأساسية للدعوى والجلسة ]
----------------------------------------------------------------------
• موضوع الدعوى: ${session.caseTitle}
• رقم الدعوى / القيد: ${session.caseNumber || 'غير مدون'}
• المحكمة والدائرة: ${session.courtName}
• نوع وطبيعة الجلسة: ${session.sessionType}
• تاريخ انعقاد الجلسة: ${formattedDate} (${session.sessionDate})
• توقيت انعقاد الجلسة: الساعة ${session.sessionTime || '09:30'} صباحاً
• الموقف الزمني المتبقي: ${countdownText}
`;

  if (session.isReservedForJudgment) {
    out += `
----------------------------------------------------------------------
[ ثانياً: بيانات حجز الدعوى للحكم والمهل القانونية ]
----------------------------------------------------------------------
• الموقف القضائي: محجوزة للحكم ⚖️
• تاريخ جلسة النطق بالحكم: ${session.judgmentDate ? formatArabicDate(session.judgmentDate) : 'محدد بالجلسة'}
• آخر موعد لتقديم المذكرات المصرح بها: ${session.briefsDeadline ? formatArabicDate(session.briefsDeadline) : 'لم يُحدد أجل مذكرات'}
• منطوق الحكم / ملخص قرار الحجز: ${session.judgmentNotes || 'قيد المداولة والنطق'}
`;
  }

  if (session.postponementReason) {
    out += `
----------------------------------------------------------------------
[ ${session.isReservedForJudgment ? 'ثالثاً' : 'ثانياً'}: آخر قرار صادر من المحكمة ]
----------------------------------------------------------------------
• منطوق قرار التأجيل / المحكمة: ${session.postponementReason}
• إجمالي مرات الترحيل والتأجيل: ${session.rolloverCount || (session.history ? session.history.length : 0)} مرات
`;
  }

  out += `
----------------------------------------------------------------------
[ ${session.isReservedForJudgment && session.postponementReason ? 'رابعاً' : session.isReservedForJudgment || session.postponementReason ? 'ثالثاً' : 'ثانياً'}: المطلوب بالجلسة والملاحظات المهنية ]
----------------------------------------------------------------------
${session.notes?.trim() ? session.notes.trim() : 'لا توجد طلبات أو ملاحظات إضافية مسجلة لهذه الجلسة.'}

----------------------------------------------------------------------
[ إعدادات التنبيه المسبق ]
----------------------------------------------------------------------
• حالة التنبيه الآلي: ${session.reminderEnabled !== false ? `مفعل مسبقاً (${formatLeadHoursText(session.reminderLeadHours ?? 24)})` : 'غير مفعل'}
• الإشعار الأخير: ${session.lastNotifiedAt ? 'تم إرسال إشعار التذكير بنجاح' : 'بانتظار حلول موعد التنبيه المسبق'}
`;

  if (session.history && session.history.length > 0) {
    out += `
----------------------------------------------------------------------
[ رول الجلسات المتعاقبة والقرارات السابقة (سجل تاريخ الدعوى) ]
----------------------------------------------------------------------
`;
    session.history.forEach((h, idx) => {
      out += `(${idx + 1}) جلسة: ${formatArabicDate(h.previousDate)}
    - القرار الصادر: ${h.decisionType}
    - سبب / تفاصيل القرار: ${h.decisionReason}
    ${h.nextSessionDate ? `- أُجلت إلى: ${formatArabicDate(h.nextSessionDate)}\n    ` : ''}${h.briefsDeadline ? `- مهلة المذكرات المصرح بها: حتى ${formatArabicDate(h.briefsDeadline)}\n    ` : ''}${h.verdictText ? `- منطوق الحكم: ${h.verdictText}\n    ` : ''}${h.previousNotes ? `- الملاحظات السابقة: ${h.previousNotes}\n    ` : ''}
`;
    });
  }

  out += `
======================================================================
إرشادات المحامي الذكي:
• يُرجى التحقق من رول الدائرة بمقر المحكمة صبيحة يوم الانعقاد للتأكد من ترتيب نظر الدعوى.
• احرص على تقديم المذكرات وحوافظ المستندات خلال المواعيد المقررة قانوناً.
======================================================================
تم الاستخراج عبر منصة: المحامي الذكي | Smart Lawyer
`;

  return out;
};

/**
 * Generates formatted text for all consultations in archive.
 */
export const formatAllConsultationsTxt = (items: SavedItem[]): string => {
  const exportDate = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let output = `======================================================================
أرشيف الاستشارات والتحليلات القانونية - المحامي الذكي
إجمالي الاستشارات المصدرة: ${items.length}
تاريخ التصدير: ${exportDate}
======================================================================\n\n`;

  items.forEach((item, index) => {
    output += `######################################################################
[ الاستشارة رقم ${index + 1} من ${items.length} ]
العنوان: ${item.title}
التصنيف: ${getTypeLabel(item.type)} | التاريخ: ${item.date}
######################################################################

[ موضوع النزاع / السؤال ]:
${item.query}

[ الرأي والتحليل القانوني ]:
${item.result}

\n\n`;
  });

  output += `======================================================================
نهاية التقرير - المحامي الذكي | الاستشارات القانونية وفقاً للقانون المصري
======================================================================`;

  return output;
};

/**
 * Generates a clean, highly styled printable HTML document matching legal report standards.
 */
export const generatePrintableHtml = (items: SavedItem[], reportTitle: string): string => {
  const exportDate = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const consultationsHtml = items
    .map(
      (item, idx) => `
    <div class="consultation-card ${idx < items.length - 1 ? 'page-break' : ''}">
      <div class="card-header">
        <div class="badge-role">${getTypeLabel(item.type)}</div>
        <div class="meta-date">تاريخ الاستشارة: ${item.date} | مرجع: #${item.id.slice(-6)}</div>
      </div>

      <h2 class="item-title">${item.title}</h2>

      <div class="section-box">
        <h3 class="section-title">
          <span class="num-circle">١</span>
          وقائع النزاع / المسألة المطروحة
        </h3>
        <p class="query-text">${item.query.replace(/\n/g, '<br/>')}</p>
      </div>

      <div class="section-box legal-box">
        <h3 class="section-title">
          <span class="num-circle">٢</span>
          الرأي والتكييف القانوني والدفوع
        </h3>
        <div class="result-text">${item.result.replace(/\n/g, '<br/>')}</div>
      </div>

      <div class="item-footer">
        <span>تقرير استشاري مستخرج من نظام المحامي الذكي</span>
        <span>صفحة داخلية</span>
      </div>
    </div>
  `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${reportTitle} - المحامي الذكي</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 18mm 15mm 20mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
      background-color: #ffffff;
      color: #1a1a1a;
      line-height: 1.7;
      margin: 0;
      padding: 20px;
      direction: rtl;
    }
    .print-toolbar {
      position: sticky;
      top: 0;
      background: #1e1e1e;
      color: #fff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: -20px -20px 24px -20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
    }
    .print-btn {
      background: #c5a059;
      color: #000;
      border: none;
      padding: 8px 20px;
      border-radius: 8px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .print-btn:hover {
      background: #d4b26f;
    }
    @media print {
      .print-toolbar {
        display: none !important;
      }
      body {
        padding: 0;
      }
      .page-break {
        page-break-after: always;
        break-after: page;
      }
    }
    .report-header {
      border-bottom: 2px solid #c5a059;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo-area h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 900;
      color: #111;
    }
    .logo-area p {
      margin: 2px 0 0 0;
      font-size: 12px;
      color: #666;
    }
    .doc-badge {
      text-align: left;
      font-size: 12px;
      color: #444;
    }
    .doc-badge strong {
      display: block;
      color: #c5a059;
      font-size: 14px;
    }
    .consultation-card {
      margin-bottom: 30px;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .badge-role {
      display: inline-block;
      background: #f4ece1;
      color: #8c6820;
      border: 1px solid #d4be95;
      font-size: 12px;
      font-weight: 700;
      padding: 3px 12px;
      border-radius: 12px;
    }
    .meta-date {
      font-size: 12px;
      color: #666;
    }
    .item-title {
      font-size: 18px;
      font-weight: 800;
      color: #0d1117;
      margin: 0 0 16px 0;
    }
    .section-box {
      background: #fcfcfc;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .legal-box {
      background: #faf9f6;
      border-color: #e2d7c5;
    }
    .section-title {
      margin: 0 0 10px 0;
      font-size: 14px;
      font-weight: 700;
      color: #27272a;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .num-circle {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #c5a059;
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
    }
    .query-text {
      margin: 0;
      font-size: 13px;
      color: #374151;
      line-height: 1.8;
    }
    .result-text {
      font-size: 13px;
      color: #18181b;
      line-height: 1.85;
      text-align: justify;
    }
    .item-footer {
      display: flex;
      justify-content: space-between;
      border-top: 1px dashed #d1d5db;
      padding-top: 8px;
      margin-top: 14px;
      font-size: 11px;
      color: #888;
    }
    .disclaimer-box {
      margin-top: 24px;
      padding: 12px 16px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 11px;
      color: #64748b;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="print-toolbar">
    <div>
      <span style="font-weight: bold; color: #c5a059;">المحامي الذكي</span> | معاينة الطباعة وتصدير PDF
    </div>
    <div style="display: flex; gap: 10px;">
      <button onclick="window.print()" class="print-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        <span>طباعة / حفظ كـ PDF</span>
      </button>
    </div>
  </div>

  <div class="report-header">
    <div class="logo-area">
      <h1>المحامي الذكي | تقرير استشارة قانونية</h1>
      <p>منصة التحليل والتأصيل القانوني وفقاً للتشريعات وأحكام القضاء المصري</p>
    </div>
    <div class="doc-badge">
      <strong>وثيقة استرشادية رسمية</strong>
      <span>تاريخ الإصدار: ${exportDate}</span>
    </div>
  </div>

  ${consultationsHtml}

  <div class="disclaimer-box">
    <strong>إخلاء مسؤولية قانونية:</strong> هذا التقرير أُنتج استرشادياً بناءً على نصوص القوانين المصرية السارية وأحكام محكمة النقض. لا يُغني هذا التقرير عن توكيل محامٍ مقيد لمباشرة الإجراءات والطعون القضائية الرسمية.
  </div>

  <script>
    // Auto-trigger print if requested via query param or direct execution
    window.addEventListener('load', () => {
      if (window.location.search.includes('autoPrint=true')) {
        setTimeout(() => window.print(), 500);
      }
    });
  </script>
</body>
</html>`;
};

/**
 * Triggers native browser print dialog for the generated HTML.
 * Uses a hidden iframe for seamless in-app printing to PDF.
 */
export const triggerPrintDocument = (items: SavedItem[], title: string) => {
  const html = generatePrintableHtml(items, title);

  // Try using hidden iframe first
  try {
    const iframe = document.createElement('iframe');
    iframe.setAttribute(
      'style',
      'visibility: hidden; position: fixed; right: 0; bottom: 0; width: 0; height: 0; border: 0;'
    );
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn('Iframe print blocked, falling back to new window/tab:', e);
          fallbackPrintWindow(html);
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 2000);
        }
      }, 400);
      return;
    }
  } catch (err) {
    console.warn('Iframe print creation error:', err);
  }

  // Fallback if iframe fails
  fallbackPrintWindow(html);
};

const fallbackPrintWindow = (html: string) => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.onload = () => {
      win.focus();
      win.print();
    };
  } else {
    // If popup blocked, download as HTML report which user can open and print
    const link = document.createElement('a');
    link.href = url;
    link.download = 'تقرير_استشارة_المحامي_الذكي.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
