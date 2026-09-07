import { CourtSession } from '../types';

export interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  urgencyLevel: 'urgent' | 'warning' | 'normal' | 'past';
}

/**
 * Calculates remaining time until a session date and time.
 */
export const calculateTimeRemaining = (
  sessionDate: string,
  sessionTime: string = '09:00'
): TimeRemaining => {
  if (!sessionDate) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
      isToday: false,
      isTomorrow: false,
      urgencyLevel: 'past',
    };
  }

  // Parse YYYY-MM-DD
  const [year, month, day] = sessionDate.split('-').map(Number);
  const [hoursStr, minutesStr] = (sessionTime || '09:00').split(':');
  const targetDate = new Date(
    year,
    (month || 1) - 1,
    day || 1,
    Number(hoursStr) || 9,
    Number(minutesStr) || 0,
    0
  );

  const now = new Date();
  const totalMs = targetDate.getTime() - now.getTime();

  // Check same calendar day
  const isToday =
    now.getFullYear() === targetDate.getFullYear() &&
    now.getMonth() === targetDate.getMonth() &&
    now.getDate() === targetDate.getDate();

  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(now.getDate() + 1);
  const isTomorrow =
    tomorrowDate.getFullYear() === targetDate.getFullYear() &&
    tomorrowDate.getMonth() === targetDate.getMonth() &&
    tomorrowDate.getDate() === targetDate.getDate();

  if (totalMs <= 0 && !isToday) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
      isToday: false,
      isTomorrow: false,
      urgencyLevel: 'past',
    };
  }

  const positiveMs = Math.max(0, totalMs);
  const seconds = Math.floor((positiveMs / 1000) % 60);
  const minutes = Math.floor((positiveMs / (1000 * 60)) % 60);
  const hours = Math.floor((positiveMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(positiveMs / (1000 * 60 * 60 * 24));

  let urgencyLevel: 'urgent' | 'warning' | 'normal' | 'past' = 'normal';
  if (isToday) {
    urgencyLevel = 'urgent';
  } else if (days <= 2) {
    urgencyLevel = 'urgent';
  } else if (days <= 5) {
    urgencyLevel = 'warning';
  }

  return {
    totalMs,
    days,
    hours,
    minutes,
    seconds,
    isPast: totalMs < 0 && !isToday,
    isToday,
    isTomorrow,
    urgencyLevel,
  };
};

/**
 * Returns Arabic human-readable string for countdown status
 */
export const getCountdownLabel = (timeRemaining: TimeRemaining): string => {
  if (timeRemaining.isPast) {
    return 'انتهت الجلسة';
  }
  if (timeRemaining.isToday) {
    if (timeRemaining.totalMs <= 0) {
      return 'الجلسة منعقدة اليوم!';
    }
    return `اليوم (متبقي ${timeRemaining.hours} س و ${timeRemaining.minutes} د)`;
  }
  if (timeRemaining.isTomorrow) {
    return `غداً (متبقي ${timeRemaining.hours} ساعة)`;
  }
  if (timeRemaining.days === 1) {
    return `متبقي يوم واحد و ${timeRemaining.hours} س`;
  }
  if (timeRemaining.days === 2) {
    return `متبقي يومان و ${timeRemaining.hours} س`;
  }
  if (timeRemaining.days >= 3 && timeRemaining.days <= 10) {
    return `متبقي ${timeRemaining.days} أيام و ${timeRemaining.hours} س`;
  }
  return `متبقي ${timeRemaining.days} يوماً`;
};

/**
 * Formats a YYYY-MM-DD date into localized Arabic date.
 */
export const formatArabicDate = (dateStr: string): string => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Sorts sessions and finds the closest non-completed upcoming session.
 */
export const getClosestUpcomingSession = (sessions: CourtSession[]): CourtSession | null => {
  const activeSessions = (sessions || []).filter((s) => !s.isCompleted);
  if (activeSessions.length === 0) return null;

  const now = new Date();
  // Sort by target timestamp ascending
  const sorted = [...activeSessions].sort((a, b) => {
    const [ay, am, ad] = a.sessionDate.split('-').map(Number);
    const [ah, ami] = (a.sessionTime || '09:00').split(':').map(Number);
    const dateA = new Date(ay, (am || 1) - 1, ad || 1, ah || 9, ami || 0).getTime();

    const [by, bm, bd] = b.sessionDate.split('-').map(Number);
    const [bh, bmi] = (b.sessionTime || '09:00').split(':').map(Number);
    const dateB = new Date(by, (bm || 1) - 1, bd || 1, bh || 9, bmi || 0).getTime();

    return dateA - dateB;
  });

  // Prefer the first one that is either today or in the future
  const upcoming = sorted.find((s) => {
    const [y, m, d] = s.sessionDate.split('-').map(Number);
    const sessionDay = new Date(y, (m || 1) - 1, d || 1, 23, 59, 59);
    return sessionDay.getTime() >= now.getTime();
  });

  return upcoming || sorted[0] || null;
};

/**
 * Default sample sessions for initial load
 */
export const getDefaultSampleSessions = (): CourtSession[] => {
  const today = new Date();
  
  // 3 days from now
  const session1Date = new Date(today);
  session1Date.setDate(today.getDate() + 3);
  const session1Str = session1Date.toISOString().split('T')[0];

  // 8 days from now
  const session2Date = new Date(today);
  session2Date.setDate(today.getDate() + 8);
  const session2Str = session2Date.toISOString().split('T')[0];

  // Briefs deadline: 4 days from now
  const briefDate = new Date(today);
  briefDate.setDate(today.getDate() + 4);
  const briefDateStr = briefDate.toISOString().split('T')[0];

  // Past session date (10 days ago for previous history)
  const prevDate = new Date(today);
  prevDate.setDate(today.getDate() - 10);
  const prevDateStr = prevDate.toISOString().split('T')[0];

  return [
    {
      id: 'demo-1',
      caseTitle: 'دعوى صحة ونفاذ عقد بيع عقار سكني',
      caseNumber: 'رقم ٤١٢ لسنة ٢٠٢٥ مدني كلي',
      courtName: 'محكمة شمال القاهرة الابتدائية - الدائرة الخامسة مدني',
      sessionDate: session1Str,
      sessionTime: '09:30',
      sessionType: 'مرافعة',
      notes: 'تقديم أصل عقد البيع الابتدائي وحافظة المستندات وإعلان الخصوم.',
      isCompleted: false,
      createdAt: new Date().toISOString(),
      rolloverCount: 1,
      postponementReason: 'التأجيل لتقديم أصل عقد البيع المسجل وإعلان شواهد التزوير',
      history: [
        {
          id: 'hist-demo-1',
          previousDate: prevDateStr,
          previousTime: '09:30',
          decisionDate: new Date().toISOString(),
          decisionType: 'تأجيل',
          decisionReason: 'التأجيل لتقديم أصل عقد البيع المسجل وإعلان شواهد التزوير',
          nextSessionDate: session1Str,
          previousNotes: 'جلسة أولى لورود الصحيفة وإعلان المدعى عليه',
        },
      ],
    },
    {
      id: 'demo-2',
      caseTitle: 'جنحة إصدار شيك بدون رصيد كافي',
      caseNumber: 'جنحة رقم ٨٥٤ لسنة ٢٠٢٥ جنح النزهة',
      courtName: 'محكمة مصر الجديدة الجزئية - محكمة الجنح',
      sessionDate: session2Str,
      sessionTime: '10:00',
      sessionType: 'نطق بالحكم',
      notes: 'حجزت للحكم مع التصريح بمذكرات الدفاع الختامية وإيداع تقرير المحاسب.',
      isCompleted: false,
      isReservedForJudgment: true,
      judgmentDate: session2Str,
      briefsDeadline: briefDateStr,
      postponementReason: 'حجز الدعوى للنطق بالحكم مع التصريح بمذكرات دفاع ومستندات خلال أسبوعين',
      createdAt: new Date().toISOString(),
      rolloverCount: 1,
      history: [
        {
          id: 'hist-demo-2',
          previousDate: prevDateStr,
          previousTime: '10:00',
          decisionDate: new Date().toISOString(),
          decisionType: 'حجز للحكم',
          decisionReason: 'حجز الدعوى للنطق بالحكم مع التصريح بمذكرات دفاع ومستندات تبادل بين الخصوم',
          nextSessionDate: session2Str,
          briefsDeadline: briefDateStr,
          previousNotes: 'المرافعة الختامية وسماع مرافعة الدفاع عن المتهم',
        },
      ],
    },
  ];
};
