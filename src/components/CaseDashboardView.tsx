import React from 'react';
import { CourtSession, SavedItem, ThemeMode } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Scale,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Bookmark,
  Building2,
  Sparkles,
} from 'lucide-react';
import { calculateTimeRemaining, getCountdownLabel } from '../utils/sessionUtils';
import { isSessionOverdue } from '../utils/rolloverUtils';

interface CaseDashboardViewProps {
  sessions: CourtSession[];
  savedItems: SavedItem[];
  theme: ThemeMode;
  onOpenSessionsModal: () => void;
  onOpenNewSession: () => void;
  onOpenRollover: (sessionId?: string) => void;
  setMode: (mode: any) => void;
}

export const CaseDashboardView: React.FC<CaseDashboardViewProps> = ({
  sessions,
  savedItems,
  theme,
  onOpenSessionsModal,
  onOpenNewSession,
  onOpenRollover,
  setMode,
}) => {
  const isLight = theme === 'light';

  // Statistics calculation
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.isCompleted).length;
  const reservedSessions = sessions.filter((s) => s.isReservedForJudgment && !s.isCompleted).length;
  const activeSessions = sessions.filter((s) => !s.isCompleted && !s.isReservedForJudgment).length;
  const overdueSessions = sessions.filter((s) => isSessionOverdue(s) && !s.isCompleted).length;

  // Chart 1: Status distribution data
  const statusData = [
    { name: 'قيد التداول', value: activeSessions, color: '#3B82F6' },
    { name: 'محجوزة للحكم', value: reservedSessions, color: '#F59E0B' },
    { name: 'منتهية / صدر حكم', value: completedSessions, color: '#10B981' },
    { name: 'متأخرة / مستحقة', value: overdueSessions, color: '#EF4444' },
  ].filter((item) => item.value > 0);

  // Chart 2: Session types distribution
  const typeCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    const t = s.sessionType || 'أخرى';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });
  const typeData = Object.keys(typeCounts).map((key) => ({
    name: key,
    count: typeCounts[key],
  }));

  // Nearest upcoming sessions
  const sortedUpcoming = [...sessions]
    .filter((s) => !s.isCompleted)
    .sort((a, b) => {
      const aTime = new Date(`${a.sessionDate}T${a.sessionTime || '09:00'}`).getTime();
      const bTime = new Date(`${b.sessionDate}T${b.sessionTime || '09:00'}`).getTime();
      return aTime - bTime;
    })
    .slice(0, 5);

  return (
    <div className={`flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-8 space-y-8 ${isLight ? 'bg-[#FBF9F5] text-[#1C1917]' : 'bg-[#0A0A0A] text-gray-100'}`}>
      
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isLight ? 'bg-white border-amber-200 shadow-sm' : 'bg-[#141414] border-[#262626]'
      }`}>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[#C5A059] text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>نظام الإدارة القانونية الذكية</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">لوحة تحكم القضايا والجلسات</h1>
          <p className="text-sm text-gray-400">
            متابعة شاملة لحالة القضايا، مواعيد الجلسات القادمة، والإحصائيات القضائية بدقة فائقة.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onOpenNewSession}
            className="flex items-center gap-2 bg-[#C5A059] hover:bg-[#b08d4b] text-black font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة جلسة جديدة</span>
          </button>
          <button
            onClick={onOpenSessionsModal}
            className={`flex items-center gap-2 border px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              isLight ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800' : 'bg-[#1A1A1A] hover:bg-[#222222] border-[#333333] text-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#C5A059]" />
            <span>جدول الجلسات الكامل</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className={`p-5 rounded-2xl border transition ${
          isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#121212] border-[#222222]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">إجمالي القضايا والجلسات</span>
            <div className="w-9 h-9 rounded-xl bg-[#C5A059]/15 text-[#C5A059] flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold">{totalSessions}</span>
            <span className="text-xs text-emerald-500 font-medium">قيد المتابعة</span>
          </div>
        </div>

        {/* Card 2: Active */}
        <div className={`p-5 rounded-2xl border transition ${
          isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#121212] border-[#222222]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">قيد التداول والمرافعة</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold">{activeSessions}</span>
            <span className="text-xs text-blue-400 font-medium">جلسة نشطة</span>
          </div>
        </div>

        {/* Card 3: Reserved */}
        <div className={`p-5 rounded-2xl border transition ${
          isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#121212] border-[#222222]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">محجوزة للحكم ⚖️</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold">{reservedSessions}</span>
            <span className="text-xs text-amber-400 font-medium">بانتظار النطق</span>
          </div>
        </div>

        {/* Card 4: Completed / Overdue */}
        <div className={`p-5 rounded-2xl border transition ${
          isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#121212] border-[#222222]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">المنتهية أو المستحقة</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold">{completedSessions}</span>
            {overdueSessions > 0 && (
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">
                {overdueSessions} متأخرة
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
          isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#121212] border-[#222222]'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059]"></span>
              توزيع القضايا حسب الحالة القضائية
            </h3>
            <span className="text-xs text-gray-400">إجمالي الحالات ({totalSessions})</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {totalSessions === 0 ? (
              <p className="text-xs text-gray-500">لا توجد جلسات مسجلة بعد لعرض الرسوم البيانية.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#181818',
                      borderColor: '#333',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Session Types Bar Chart */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
          isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#121212] border-[#222222]'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059]"></span>
              أنواع الجلسات القضائية المسجلة
            </h3>
            <span className="text-xs text-gray-400">التصنيفات القانونية</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {typeData.length === 0 ? (
              <p className="text-xs text-gray-500">لا توجد بيانات كافية.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={11}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#181818',
                      borderColor: '#333',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#C5A059" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Sessions Quick List & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nearest Sessions Widget */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border space-y-4 ${
          isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#121212] border-[#222222]'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C5A059]" />
              أقرب الجلسات القادمة
            </h3>
            <button
              onClick={onOpenSessionsModal}
              className="text-xs text-[#C5A059] hover:underline flex items-center gap-1 font-medium"
            >
              <span>عرض الكل</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

          {sortedUpcoming.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              لا توجد جلسات قادمة مسجلة. يمكنك إضافة جلسة جديدة للبدء.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedUpcoming.map((s) => {
                const timeRem = calculateTimeRemaining(s.sessionDate, s.sessionTime);
                const isOverdue = isSessionOverdue(s);
                return (
                  <div
                    key={s.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                      isLight ? 'bg-[#FDFCFB] border-gray-200 hover:border-amber-300' : 'bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#C5A059]/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-100">{s.caseTitle}</span>
                        {s.isReservedForJudgment && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                            محجوزة للحكم ⚖️
                          </span>
                        )}
                        {isOverdue && !s.isReservedForJudgment && (
                          <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full">
                            جلسة فائتة
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-[#C5A059]" />
                          {s.courtName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                          {s.sessionDate} {s.sessionTime ? `(${s.sessionTime})` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-xs bg-[#242424] text-[#C5A059] px-2.5 py-1 rounded-lg font-medium">
                        {getCountdownLabel(timeRem)}
                      </span>
                      <button
                        onClick={() => onOpenRollover(s.id)}
                        className="text-xs bg-[#C5A059]/15 hover:bg-[#C5A059]/25 text-[#C5A059] px-3 py-1 rounded-lg font-medium transition cursor-pointer"
                      >
                        قرار الجلسة / ترحيل
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Tools & Shortcuts */}
        <div className={`p-6 rounded-2xl border space-y-4 flex flex-col justify-between ${
          isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#121212] border-[#222222]'
        }`}>
          <div>
            <h3 className="text-base font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              اختصارات سريعة
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              الوصول السريع لأدوات الذكاء الاصطناعي وصياغة العقود والاستشارات القانونية.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => setMode('advisor')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#1A1A1A] hover:bg-[#222222] border border-[#333333] hover:border-[#C5A059]/50 text-xs transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">⚖️</span>
                  <span className="font-semibold text-gray-200 group-hover:text-white">المستشار القانوني الآلي</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#C5A059] rotate-180" />
              </button>

              <button
                onClick={() => setMode('contract')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#1A1A1A] hover:bg-[#222222] border border-[#333333] hover:border-[#C5A059]/50 text-xs transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">📝</span>
                  <span className="font-semibold text-gray-200 group-hover:text-white">صياغة العقود الرسمية</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#C5A059] rotate-180" />
              </button>

              <button
                onClick={() => setMode('defendant')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#1A1A1A] hover:bg-[#222222] border border-[#333333] hover:border-[#C5A059]/50 text-xs transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🛡️</span>
                  <span className="font-semibold text-gray-200 group-hover:text-white">محامي الدفاع والدفوع</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#C5A059] rotate-180" />
              </button>

              <button
                onClick={() => setMode('analyst')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#1A1A1A] hover:bg-[#222222] border border-[#333333] hover:border-[#C5A059]/50 text-xs transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🔎</span>
                  <span className="font-semibold text-gray-200 group-hover:text-white">محلل النزاعات القانونية</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#C5A059] rotate-180" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#222222] flex items-center justify-between text-[11px] text-gray-400">
            <span>الاستشارات المحفوظة: {savedItems.length}</span>
            <span className="text-[#C5A059] font-medium">محدث فورياً</span>
          </div>
        </div>
      </div>

    </div>
  );
};
