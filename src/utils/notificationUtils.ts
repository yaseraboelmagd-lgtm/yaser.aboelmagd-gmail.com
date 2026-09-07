import { CourtSession } from '../types';
import { formatArabicDate } from './sessionUtils';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export const REMINDER_PRESETS: { hours: number; label: string }[] = [
  { hours: 24, label: 'قبل الموعد بـ 24 ساعة (افتراضي - يوم كامل)' },
  { hours: 12, label: 'قبل الموعد بـ 12 ساعة' },
  { hours: 48, label: 'قبل الموعد بـ 48 ساعة (يومان)' },
  { hours: 72, label: 'قبل الموعد بـ 3 أيام (72 ساعة)' },
  { hours: 6, label: 'قبل الموعد بـ 6 ساعات' },
  { hours: 2, label: 'قبل الموعد بساعتين' },
  { hours: 1, label: 'قبل الموعد بساعة واحدة' },
];

/**
 * Checks if Notification API is available in the current browser/environment.
 */
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

/**
 * Returns the current notification permission state.
 */
export const getNotificationPermission = (): NotificationPermissionState => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
};

/**
 * Requests web notification permission from the user.
 */
export const requestNotificationPermission = async (): Promise<NotificationPermissionState> => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermissionState;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

/**
 * Plays a pleasant acoustic chime using the Web Audio API without requiring external audio files.
 */
export const playNotificationChime = (): void => {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic 1 (587.33 Hz - D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Harmonic 2 (880 Hz - A5) slightly delayed for a pleasant bell feel
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.22, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.85);
  } catch (e) {
    // AudioContext might be constrained before user gesture; gracefully ignore
  }
};

/**
 * Formats lead hours into clear Arabic wording.
 */
export const formatLeadHoursText = (hours: number): string => {
  if (hours === 1) return 'قبل ساعة واحدة';
  if (hours === 2) return 'قبل ساعتين';
  if (hours <= 10) return `قبل ${hours} ساعات`;
  if (hours === 24) return 'قبل 24 ساعة (يوم كامل)';
  if (hours === 48) return 'قبل 48 ساعة (يومان)';
  if (hours === 72) return 'قبل 3 أيام (72 ساعة)';
  return `قبل ${hours} ساعة`;
};

/**
 * Triggers a browser desktop notification for a court session.
 */
export const sendSessionNotification = (
  session: CourtSession,
  leadHours: number = 24,
  isTest: boolean = false
): boolean => {
  playNotificationChime();

  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const titlePrefix = isTest ? '🔔 [تجربة إشعار] تذكير بجلسة قضائية' : '⚖️ تذكير بموعد جلسة قضائية قادمة';
  const title = `${titlePrefix}: ${session.caseTitle}`;

  const bodyParts = [
    `المحكمة: ${session.courtName}`,
    `الموعد: ${formatArabicDate(session.sessionDate)} - الساعة ${session.sessionTime || '09:30'}`,
    `نوع الجلسة: ${session.sessionType}`,
    isTest
      ? `(تم ضبط التنبيه ليكون ${formatLeadHoursText(leadHours)} من موعد انعقاد الجلسة)`
      : `تنبيه مسبق: متبقي حوالي ${leadHours} ساعة على موعد الجلسة`,
  ];

  if (session.caseNumber) {
    bodyParts.unshift(`رقم الدعوى: ${session.caseNumber}`);
  }
  if (session.notes) {
    bodyParts.push(`المطلوب بالجلسة: ${session.notes.slice(0, 80)}`);
  }

  try {
    const notification = new Notification(title, {
      body: bodyParts.join('\n'),
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `court-session-${session.id}-${leadHours}`,
      requireInteraction: true,
      dir: 'rtl',
      lang: 'ar',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (error) {
    console.error('Failed to trigger browser notification:', error);
    return false;
  }
};

/**
 * Sends a demonstration test notification to verify audio and visual alert delivery.
 */
export const sendTestNotification = async (): Promise<{
  success: boolean;
  permission: NotificationPermissionState;
  message: string;
}> => {
  const currentPerm = getNotificationPermission();

  if (currentPerm === 'unsupported') {
    return {
      success: false,
      permission: 'unsupported',
      message: 'المتصفح الحالي لا يدعم إشعارات الويب (Web Notifications).',
    };
  }

  let finalPerm: NotificationPermissionState = currentPerm;
  if (currentPerm === 'default') {
    finalPerm = await requestNotificationPermission();
  }

  if (finalPerm !== 'granted') {
    return {
      success: false,
      permission: finalPerm,
      message:
        finalPerm === 'denied'
          ? 'تم رفض إذن الإشعارات من إعدادات المتصفح. يرجى السماح بالإشعارات من شريط العنوان لتصلك التنبيهات.'
          : 'لم يتم منح إذن الإشعارات بعد.',
    };
  }

  const sampleSession: CourtSession = {
    id: 'test-notification',
    caseTitle: 'دعوى تجريبية (فحص إشعارات المتصفح)',
    caseNumber: 'رقم تجريبي 101 لسنة 2026',
    courtName: 'محكمة استئناف القاهرة',
    sessionDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    sessionTime: '09:30',
    sessionType: 'مرافعة',
    notes: 'تم تفعيل التنبيه بنجاح! ستصلك إشعارات قبل 24 ساعة من مواعيد جلساتك القادمة.',
    createdAt: new Date().toISOString(),
    reminderEnabled: true,
    reminderLeadHours: 24,
  };

  const sent = sendSessionNotification(sampleSession, 24, true);

  return {
    success: sent,
    permission: 'granted',
    message: sent
      ? 'تم إرسال إشعار التجربة بنجاح إلى سطح المكتب وتشغيل نغمة التنبيه!'
      : 'تعذر إرسال الإشعار، يرجى مراجعة أذونات النظام.',
  };
};

/**
 * Evaluates active court sessions and fires notifications for those that reached their reminder window.
 * Returns the list of session IDs that were newly notified.
 */
export const checkDueSessionsForNotification = (
  sessions: CourtSession[],
  onSessionNotified: (sessionId: string) => void
): string[] => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return [];
  }

  const now = Date.now();
  const notifiedIds: string[] = [];

  sessions.forEach((session) => {
    // Only check active sessions that have reminders enabled (default is enabled)
    if (session.isCompleted || session.reminderEnabled === false) {
      return;
    }

    if (!session.sessionDate) return;

    // Determine target session timestamp
    const [year, month, day] = session.sessionDate.split('-').map(Number);
    const [hoursStr, minutesStr] = (session.sessionTime || '09:00').split(':');
    const sessionTargetDate = new Date(
      year,
      (month || 1) - 1,
      day || 1,
      Number(hoursStr) || 9,
      Number(minutesStr) || 0,
      0
    );

    const sessionTargetMs = sessionTargetDate.getTime();
    const leadHours = session.reminderLeadHours ?? 24; // Default 24 hours as requested
    const leadMs = leadHours * 60 * 60 * 1000;

    const reminderTriggerMs = sessionTargetMs - leadMs;
    // Session is eligible if current time is past the reminder trigger time,
    // and session hasn't passed more than 2 hours ago.
    const isWithinReminderWindow =
      now >= reminderTriggerMs && now < sessionTargetMs + 2 * 60 * 60 * 1000;

    if (!isWithinReminderWindow) {
      return;
    }

    // Check if we already notified for this session
    // If lastNotifiedAt is present and occurred after the reminderTriggerMs, skip
    if (session.lastNotifiedAt) {
      const lastNotifiedMs = new Date(session.lastNotifiedAt).getTime();
      // If notified within the last 12 hours or after the trigger time, skip
      if (now - lastNotifiedMs < 12 * 60 * 60 * 1000) {
        return;
      }
    }

    // Trigger the notification!
    const sent = sendSessionNotification(session, leadHours, false);
    if (sent) {
      notifiedIds.push(session.id);
      onSessionNotified(session.id);
    }
  });

  return notifiedIds;
};
