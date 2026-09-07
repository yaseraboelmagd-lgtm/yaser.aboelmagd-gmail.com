import React, { useState, useEffect } from 'react';
import { AppMode, SavedItem, CourtSession, AppSettings, RolloverDecisionType, CourtSessionType } from './types';
import { Navbar } from './components/Navbar';
import { LegalAdvisorChat } from './components/LegalAdvisorChat';
import { DefendantView } from './components/DefendantView';
import { CaseAnalystView } from './components/CaseAnalystView';
import { ContractDraftView } from './components/ContractDraftView';
import { LegalLibraryView } from './components/LegalLibraryView';
import { CaseDashboardView } from './components/CaseDashboardView';
import { SavedModal } from './components/SavedModal';
import { SessionCountdownBanner } from './components/SessionCountdownBanner';
import { SessionsModal } from './components/SessionsModal';
import { SettingsModal } from './components/SettingsModal';
import { SessionRolloverModal } from './components/SessionRolloverModal';
import { getDefaultSampleSessions } from './utils/sessionUtils';
import { checkDueSessionsForNotification } from './utils/notificationUtils';
import { applyRolloverToSession } from './utils/rolloverUtils';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  fontSize: 'normal',
  lineHeight: 'normal',
  highContrast: false,
  courtRemindersSound: true,
};

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('dashboard');

  // General App Settings & Reading Mode State
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem('smart_lawyer_settings');
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Error loading settings from localStorage:', e);
    }
    return DEFAULT_SETTINGS;
  });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Synchronize settings with localStorage and HTML class
  useEffect(() => {
    try {
      localStorage.setItem('smart_lawyer_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }

    if (settings.theme === 'light') {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light-mode');
      document.documentElement.classList.add('dark');
    }
  }, [settings]);

  const handleToggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };
  
  // Saved Consultations State
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    try {
      const stored = localStorage.getItem('smart_lawyer_saved');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

  // Court Sessions & Hearing Reminders State
  const [sessions, setSessions] = useState<CourtSession[]>(() => {
    try {
      const stored = localStorage.getItem('smart_lawyer_sessions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return getDefaultSampleSessions();
    } catch {
      return getDefaultSampleSessions();
    }
  });
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [initialSessionAddOpen, setInitialSessionAddOpen] = useState(false);

  // Rollover and Judgment Reservation state
  const [isRolloverModalOpen, setIsRolloverModalOpen] = useState(false);
  const [activeRolloverSessionId, setActiveRolloverSessionId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('smart_lawyer_saved', JSON.stringify(savedItems));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [savedItems]);

  useEffect(() => {
    try {
      localStorage.setItem('smart_lawyer_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions to localStorage:', e);
    }
  }, [sessions]);

  // Periodic Web Notification Checker for upcoming court sessions
  useEffect(() => {
    const runReminderCheck = () => {
      checkDueSessionsForNotification(sessions, (notifiedId) => {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === notifiedId ? { ...s, lastNotifiedAt: new Date().toISOString() } : s
          )
        );
      });
    };

    runReminderCheck();
    const timer = setInterval(runReminderCheck, 30000);
    return () => clearInterval(timer);
  }, [sessions]);

  // Session Handlers
  const handleAddSession = (sessionData: Omit<CourtSession, 'id' | 'createdAt'>) => {
    const newSession: CourtSession = {
      ...sessionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);
  };

  const handleUpdateSession = (id: string, updated: Partial<CourtSession>) => {
    setSessions((prev) =>
      prev.map((session) => (session.id === id ? { ...session, ...updated } : session))
    );
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== id));
  };

  const handleOpenNewSession = () => {
    setInitialSessionAddOpen(true);
    setIsSessionsModalOpen(true);
  };

  const handleOpenSessionsList = () => {
    setInitialSessionAddOpen(false);
    setIsSessionsModalOpen(true);
  };

  const handleOpenRollover = (sessionId?: string) => {
    setActiveRolloverSessionId(sessionId || null);
    setIsRolloverModalOpen(true);
  };

  const handleApplyRollover = (
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
  ) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? applyRolloverToSession(s, params) : s))
    );
  };

  // Consultation Handlers
  const handleSaveConsultation = (title: string, query: string, result: string, type: 'advisor' | 'defendant' | 'analyst' | 'contract') => {
    const newItem: SavedItem = {
      id: Date.now().toString(),
      type,
      title,
      query,
      result,
      date: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }),
    };
    setSavedItems((prev) => [newItem, ...prev]);
  };

  const handleDeleteItem = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع الاستشارات المحفوظة؟')) {
      setSavedItems([]);
    }
  };

  const upcomingSessionsCount = sessions.filter((s) => !s.isCompleted).length;
  const isLight = settings.theme === 'light';

  const readingClasses = [
    isLight ? 'light-mode' : 'dark',
    settings.fontSize === 'large' ? 'reading-size-large' : settings.fontSize === 'xlarge' ? 'reading-size-xlarge' : '',
    settings.lineHeight === 'relaxed' ? 'reading-line-relaxed' : settings.lineHeight === 'loose' ? 'reading-line-loose' : '',
    settings.highContrast ? 'high-contrast-mode' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      dir="rtl"
      className={`flex flex-row-reverse h-screen font-['Cairo',sans-serif] overflow-hidden transition-colors duration-200 ${
        isLight ? 'bg-[#FBF9F5] text-[#1C1917]' : 'bg-[#0A0A0A] text-gray-200'
      } ${readingClasses}`}
    >
      {/* Sidebar Navigation */}
      <Navbar
        currentMode={currentMode}
        setMode={setCurrentMode}
        savedCount={savedItems.length}
        openSavedModal={() => setIsSavedModalOpen(true)}
        sessionsCount={upcomingSessionsCount}
        openSessionsModal={handleOpenSessionsList}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        openSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 flex flex-col relative overflow-hidden transition-colors duration-200 ${
          isLight ? 'bg-[#FBF9F5]' : 'bg-[#0A0A0A]'
        }`}
      >
        {/* Countdown Banner on the Main Screen */}
        <SessionCountdownBanner
          sessions={sessions}
          onOpenSessionsModal={handleOpenSessionsList}
          onAddNewSession={handleOpenNewSession}
          onOpenRollover={handleOpenRollover}
        />

        {/* Dynamic Views */}
        {currentMode === 'dashboard' && (
          <CaseDashboardView
            sessions={sessions}
            savedItems={savedItems}
            theme={settings.theme}
            onOpenSessionsModal={handleOpenSessionsList}
            onOpenNewSession={handleOpenNewSession}
            onOpenRollover={handleOpenRollover}
            setMode={setCurrentMode}
          />
        )}
        {currentMode === 'advisor' && <LegalAdvisorChat onSaveConsultation={handleSaveConsultation} />}
        {currentMode === 'defendant' && <DefendantView onSaveConsultation={handleSaveConsultation} />}
        {currentMode === 'analyst' && <CaseAnalystView onSaveConsultation={handleSaveConsultation} />}
        {currentMode === 'contract' && <ContractDraftView onSaveConsultation={handleSaveConsultation} />}
        {currentMode === 'library' && <LegalLibraryView />}
      </main>

      {/* General Settings & Reading Experience Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetSettings={handleResetSettings}
      />

      {/* Court Sessions & Reminders Modal */}
      <SessionsModal
        isOpen={isSessionsModalOpen}
        onClose={() => {
          setIsSessionsModalOpen(false);
          setInitialSessionAddOpen(false);
        }}
        sessions={sessions}
        onAddSession={handleAddSession}
        onUpdateSession={handleUpdateSession}
        onDeleteSession={handleDeleteSession}
        initialAddOpen={initialSessionAddOpen}
        onOpenRollover={handleOpenRollover}
      />

      {/* Session Rollover & Judgment Reservation Modal */}
      <SessionRolloverModal
        isOpen={isRolloverModalOpen}
        onClose={() => {
          setIsRolloverModalOpen(false);
          setActiveRolloverSessionId(null);
        }}
        sessions={sessions}
        initialSessionId={activeRolloverSessionId}
        onApplyRollover={handleApplyRollover}
      />

      {/* Saved Consultations Modal */}
      <SavedModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedItems={savedItems}
        onDeleteItem={handleDeleteItem}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
