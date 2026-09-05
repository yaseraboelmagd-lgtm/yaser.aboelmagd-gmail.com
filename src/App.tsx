import React, { useState, useEffect } from 'react';
import { AppMode, SavedItem, CourtSession } from './types';
import { Navbar } from './components/Navbar';
import { LegalAdvisorChat } from './components/LegalAdvisorChat';
import { DefendantView } from './components/DefendantView';
import { CaseAnalystView } from './components/CaseAnalystView';
import { ContractDraftView } from './components/ContractDraftView';
import { LegalLibraryView } from './components/LegalLibraryView';
import { SavedModal } from './components/SavedModal';
import { SessionCountdownBanner } from './components/SessionCountdownBanner';
import { SessionsModal } from './components/SessionsModal';
import { getDefaultSampleSessions } from './utils/sessionUtils';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('advisor');
  
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
      // Provide default sample sessions so users immediately see countdown in action
      return getDefaultSampleSessions();
    } catch {
      return getDefaultSampleSessions();
    }
  });
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [initialSessionAddOpen, setInitialSessionAddOpen] = useState(false);

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

  return (
    <div dir="rtl" className="flex flex-row-reverse h-screen bg-[#0A0A0A] text-gray-200 font-['Cairo',sans-serif] overflow-hidden">
      
      {/* Sidebar Navigation */}
      <Navbar
        currentMode={currentMode}
        setMode={setCurrentMode}
        savedCount={savedItems.length}
        openSavedModal={() => setIsSavedModalOpen(true)}
        sessionsCount={upcomingSessionsCount}
        openSessionsModal={handleOpenSessionsList}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0A0A0A]">
        {/* Countdown Banner on the Main Screen */}
        <SessionCountdownBanner
          sessions={sessions}
          onOpenSessionsModal={handleOpenSessionsList}
          onAddNewSession={handleOpenNewSession}
        />

        {/* Dynamic Views */}
        {currentMode === 'advisor' && <LegalAdvisorChat onSaveConsultation={handleSaveConsultation} />}
        {currentMode === 'defendant' && <DefendantView onSaveConsultation={handleSaveConsultation} />}
        {currentMode === 'analyst' && <CaseAnalystView onSaveConsultation={handleSaveConsultation} />}
        {currentMode === 'contract' && <ContractDraftView onSaveConsultation={handleSaveConsultation} />}
        {currentMode === 'library' && <LegalLibraryView />}
      </main>

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
