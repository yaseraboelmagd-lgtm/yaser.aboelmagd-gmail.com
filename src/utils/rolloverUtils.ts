import { CourtSession, RolloverDecisionType, SessionHistoryRecord } from '../types';

export interface PostponementReasonOption {
  category: string;
  reasons: string[];
}

/**
  * Standard judicial postponement decisions in Egyptian & Arab courts.
  */
export const COMMON_POSTPONEMENT_REASONS: PostponementReasonOption[] = [
  {
    category: 'المستندات والمذكرات',
    reasons: [
      'التأجيل لتقديم أصل المستندات وحافظة مستندات معتمدة',
      'التأجيل للاطلاع والرد والتعقيب على مذكرات الخصم',
      'التأجيل لتقديم المذكرات الختامية في الدعوى',
      'التأجيل لتقديم ما يفيد سداد الأمانة القضائية / الرسوم',
      'التأجيل لتقديم شهادة رسمية من الجدول أو السجل العقاري',
    ],
  },
  {
    category: 'الإعلانات والخصومة',
    reasons: [
      'التأجيل لإعادة الإعلان بالدعوى وتكليف قلم المحضرين',
      'التأجيل لإعلان أصل صحيفة الدعوى وإشهارها',
      'التأجيل لإدخال خصم جديد في الدعوى أو التدخل الانضمامي',
      'التأجيل لإعلان ورثة الخصم المتوفى لتصحيح شكل الدعوى',
      'التأجيل لإعلان المذكرات والطلبات العارضة قانوناً',
    ],
  },
  {
    category: 'الخبراء والتحريات الفنية',
    reasons: [
      'التأجيل لورود تقرير مكتب خبراء وزارة العدل المندوب',
      'التأجيل لإيداع أمانة الخبير وسداد مصاريف المعاينة',
      'التأجيل لمناقشة الخبير المنتدب وسماع إيضاحاته',
      'التأجيل لورود تقرير قسم أبحاث التزييف والتزوير',
      'التأجيل لورود التحريات الأمنية أو إفادة النيابة العامة',
    ],
  },
  {
    category: 'الشهود واليمين والتحقيق',
    reasons: [
      'التأجيل لسماع شهود الإثبات وتكليفهم بالحضور بالجلسة',
      'التأجيل لسماع شهود النفي بالجلسة المحددة',
      'التأجيل لتوجيه اليمين الحاسمة وحلف اليمين أمام الدائرة',
      'التأجيل لاستجواب الخصوم ومناقشة أطراف النزاع شخصياً',
    ],
  },
  {
    category: 'المرافعة والدواعي القضائية',
    reasons: [
      'التأجيل للمرافعة الختامية والاستعداد للمرافعة الشفوية',
      'التأجيل لضم مفردات القضية المرتبطة / الجنحة المباشرة',
      'تأجيل إداري للمصلحة العامة أو لعطلة قضائية رسمية',
      'التأجيل لندب محامٍ من نقابة المحامين (للدفاع الجنائي)',
    ],
  },
];

/**
 * Common judgment reservation templates
 */
export const JUDGMENT_RESERVATION_TEMPLATES = [
  {
    label: 'حجز للحكم مع مذكرات خلال أسبوع (٧ أيام)',
    daysForBriefs: 7,
    reason: 'حجز الدعوى للنطق بالحكم مع التصريح للطرفين بمذكرات دفاع ومستندات خلال أسبوع.',
  },
  {
    label: 'حجز للحكم مع مذكرات خلال ١٠ أيام',
    daysForBriefs: 10,
    reason: 'حجز الدعوى للحكم مع التصريح بمذكرات دفاع ومستندات خلال عشرة أيام.',
  },
  {
    label: 'حجز للحكم مع مذكرات أسبوعين (تبادل مذكرات)',
    daysForBriefs: 14,
    reason: 'حجز الدعوى للحكم مع التصريح بتبادل مذكرات الدفاع خلال أسبوعين تبدأ بالمدعي ثم المدعى عليه.',
  },
  {
    label: 'حجز الدعوى للنطق بالحكم دون تصريح بمذكرات',
    daysForBriefs: 0,
    reason: 'حجز الدعوى للحكم والمداولة دون مذكرات.',
  },
];

/**
 * Calculates a future date string YYYY-MM-DD based on offset days,
 * ensuring it doesn't fall on Friday (court weekend in Egypt/Arab world) if adjusted.
 */
export const calculateSuggestedDate = (
  baseDateStr?: string,
  daysToAdd: number = 7,
  avoidFriday: boolean = true
): string => {
  let base: Date;
  if (baseDateStr) {
    const [y, m, d] = baseDateStr.split('-').map(Number);
    base = new Date(y, (m || 1) - 1, d || 1);
  } else {
    base = new Date();
  }

  const result = new Date(base);
  result.setDate(result.getDate() + daysToAdd);

  // If result is Friday (day 5 in JS Date: 0=Sun, 5=Fri), shift to Sunday or Saturday
  if (avoidFriday && result.getDay() === 5) {
    // Shift to Saturday (+1) or Sunday (+2)
    result.setDate(result.getDate() + 2); // default Sunday
  }

  const year = result.getFullYear();
  const month = String(result.getMonth() + 1).padStart(2, '0');
  const day = String(result.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Checks if a session has passed its scheduled date and has not yet been completed or rolled over
 */
export const isSessionOverdue = (session: CourtSession): boolean => {
  if (session.isCompleted) return false;
  if (!session.sessionDate) return false;

  const [y, m, d] = session.sessionDate.split('-').map(Number);
  const sessionDay = new Date(y, (m || 1) - 1, d || 1, 23, 59, 59);
  const now = new Date();

  return sessionDay.getTime() < now.getTime();
};

/**
 * Evaluates remaining days for brief submission if a deadline is set
 */
export const getBriefsDeadlineStatus = (
  briefsDeadline?: string
): {
  daysRemaining: number;
  isPast: boolean;
  isToday: boolean;
  label: string;
} | null => {
  if (!briefsDeadline) return null;

  const [y, m, d] = briefsDeadline.split('-').map(Number);
  const target = new Date(y, (m || 1) - 1, d || 1, 23, 59, 59);
  const now = new Date();

  const diffMs = target.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const isToday =
    now.getFullYear() === target.getFullYear() &&
    now.getMonth() === target.getMonth() &&
    now.getDate() === target.getDate();

  if (diffMs <= 0 && !isToday) {
    return {
      daysRemaining: 0,
      isPast: true,
      isToday: false,
      label: 'انتهت مهلة المذكرات',
    };
  }

  if (isToday) {
    return {
      daysRemaining: 0,
      isPast: false,
      isToday: true,
      label: 'آخر موعد لتقديم المذكرات اليوم!',
    };
  }

  if (days === 1) {
    return {
      daysRemaining: 1,
      isPast: false,
      isToday: false,
      label: 'متبقي يوم واحد لتقديم المذكرات',
    };
  }

  if (days === 2) {
    return {
      daysRemaining: 2,
      isPast: false,
      isToday: false,
      label: 'متبقي يومان لتقديم المذكرات',
    };
  }

  return {
    daysRemaining: days,
    isPast: false,
    isToday: false,
    label: `متبقي ${days} أيام لتقديم المذكرات والمستندات`,
  };
};

/**
 * Builds an updated CourtSession object with new history record applied.
 */
export const applyRolloverToSession = (
  session: CourtSession,
  params: {
    decisionType: RolloverDecisionType;
    decisionReason: string;
    newSessionDate?: string;
    newSessionTime?: string;
    newSessionType?: CourtSession['sessionType'];
    newNotes?: string;
    briefsDeadline?: string;
    verdictText?: string;
  }
): CourtSession => {
  const historyRecord: SessionHistoryRecord = {
    id: 'hist-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 6),
    previousDate: session.sessionDate,
    previousTime: session.sessionTime,
    decisionDate: new Date().toISOString(),
    decisionType: params.decisionType,
    decisionReason: params.decisionReason,
    nextSessionDate: params.newSessionDate,
    briefsDeadline: params.briefsDeadline,
    verdictText: params.verdictText,
    previousNotes: session.notes,
  };

  const currentHistory = session.history || [];
  const updatedHistory = [historyRecord, ...currentHistory];
  const newRolloverCount = (session.rolloverCount || 0) + 1;

  if (params.decisionType === 'صدور الحكم') {
    return {
      ...session,
      isCompleted: true,
      isReservedForJudgment: false,
      judgmentNotes: params.verdictText || params.decisionReason,
      notes: params.newNotes ?? session.notes,
      rolloverCount: newRolloverCount,
      history: updatedHistory,
    };
  }

  if (params.decisionType === 'حجز للحكم' || params.decisionType === 'مد أجل الحكم') {
    return {
      ...session,
      sessionDate: params.newSessionDate || session.sessionDate,
      sessionTime: params.newSessionTime || session.sessionTime || '09:30',
      sessionType: 'نطق بالحكم',
      isReservedForJudgment: true,
      judgmentDate: params.newSessionDate,
      briefsDeadline: params.briefsDeadline || undefined,
      postponementReason: params.decisionReason,
      notes: params.newNotes ?? session.notes,
      isCompleted: false,
      rolloverCount: newRolloverCount,
      history: updatedHistory,
      lastNotifiedAt: undefined, // Reset notification for the new date
    };
  }

  // Standard Postponement or Re-opening Pleadings (تأجيل أو إعادة للمرافعة)
  return {
    ...session,
    sessionDate: params.newSessionDate || session.sessionDate,
    sessionTime: params.newSessionTime || session.sessionTime || '09:30',
    sessionType: params.newSessionType || (params.decisionType === 'إعادة للمرافعة' ? 'مرافعة' : session.sessionType),
    isReservedForJudgment: false,
    briefsDeadline: params.briefsDeadline || undefined,
    postponementReason: params.decisionReason,
    notes: params.newNotes ?? session.notes,
    isCompleted: false,
    rolloverCount: newRolloverCount,
    history: updatedHistory,
    lastNotifiedAt: undefined, // Reset notification for the new date
  };
};
