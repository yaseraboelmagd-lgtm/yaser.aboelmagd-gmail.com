export type AppMode = 'advisor' | 'defendant' | 'analyst' | 'contract' | 'library' | 'saved';

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
