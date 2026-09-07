export type AppMode = 'dashboard' | 'advisor' | 'defendant' | 'analyst' | 'contract' | 'library' | 'saved';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface SavedItem {
  id: string;
  type: 'advisor' | 'defendant' | 'analyst' | 'contract';
  title: string;
  query: string;
  result: string;
  date: string;
}

export type CourtSessionType =
  | 'مرافعة'
  | 'نطق بالحكم'
  | 'سماع شهود واستجواب'
  | 'تقديم مستندات'
  | 'إيداع تقرير خبير'
  | 'تجديد حبس / معارضة'
  | 'أخرى';

export type RolloverDecisionType =
  | 'تأجيل'
  | 'حجز للحكم'
  | 'مد أجل الحكم'
  | 'إعادة للمرافعة'
  | 'صدور الحكم';

export interface SessionHistoryRecord {
  id: string;
  previousDate: string; // YYYY-MM-DD
  previousTime?: string; // HH:mm
  decisionDate: string; // ISO date string of the action
  decisionType: RolloverDecisionType;
  decisionReason: string; // e.g. "التأجيل لتقديم أصل المستندات" or "حجزت للحكم مع مذكرات خلال أسبوع"
  nextSessionDate?: string; // New date
  briefsDeadline?: string; // أجل تقديم المذكرات
  verdictText?: string; // منطوق الحكم في حال الانتهاء
  previousNotes?: string; // الملاحظات القديمة
}

export interface SessionAttachment {
  id: string;
  name: string;
  type: 'image' | 'pdf';
  dataUrl: string;
  size?: number;
  uploadedAt: string;
}

export interface CourtSession {
  id: string;
  caseTitle: string;
  caseNumber?: string;
  courtName: string;
  sessionDate: string; // YYYY-MM-DD
  sessionTime?: string; // HH:mm
  sessionType: CourtSessionType;
  notes?: string;
  isCompleted?: boolean;
  createdAt: string;
  reminderEnabled?: boolean; // Whether web notification reminder is active (default true)
  reminderLeadHours?: number; // Hours before session time to notify (default 24)
  lastNotifiedAt?: string; // ISO timestamp when reminder was last sent

  // Automated Rollover & Judgment Reservation Properties
  isReservedForJudgment?: boolean; // هل الدعوى محجوزة للحكم؟
  judgmentDate?: string; // تاريخ جلسة النطق بالحكم
  judgmentNotes?: string; // منطوق الحكم أو ملخص قرار الحجز
  briefsDeadline?: string; // مهلة تقديم مذكرات الدفاع والمستندات المصرح بها (YYYY-MM-DD)
  postponementReason?: string; // سبب أو قرار آخر تأجيل
  rolloverCount?: number; // إجمالي مرات الترحيل / التأجيل
  history?: SessionHistoryRecord[]; // سجل ترحيل الجلسات والقرارات السابقة
  attachments?: SessionAttachment[]; // الملفات والصور المرفقة بالجلسة
}

export interface LegalArticle {
  id: string;
  title: string;
  category: string;
  description: string;
  keyArticles: string;
  summary: string;
  commonQuestions: { q: string; a: string }[];
}

export type LegalTermCategory =
  | 'جميع الفروع'
  | 'قانون مدني'
  | 'قانون جنائي'
  | 'مرافعات وإجراءات'
  | 'أحوال شخصية'
  | 'قانون تجاري وشركات'
  | 'قانون الإثبات'
  | 'قانون العمل';

export interface LegalTerm {
  id: string;
  term: string; // المصطلح القانوني باللغة العربية
  termEnglish?: string; // المقابل بالإنجليزية أو اللاتينية
  category: LegalTermCategory; // الفرع القانوني
  definition: string; // التعريف المعتمد في القانون والقضاء المصري
  legalBasis: string; // السند القانوني والنصوص الحاكمة في التشريع المصري
  practicalExample: string; // تطبيق عملي وقضائي في المحاكم المصرية
  keyPoints?: string[]; // العناصر والشروط الجوهرية
  relatedTerms?: string[]; // مصطلحات مرتبطة
}

export type ThemeMode = 'dark' | 'light';
export type ReadingFontSize = 'normal' | 'large' | 'xlarge';
export type ReadingLineHeight = 'normal' | 'relaxed' | 'loose';

export interface AppSettings {
  theme: ThemeMode;
  fontSize: ReadingFontSize;
  lineHeight: ReadingLineHeight;
  highContrast: boolean;
  courtRemindersSound: boolean;
}
