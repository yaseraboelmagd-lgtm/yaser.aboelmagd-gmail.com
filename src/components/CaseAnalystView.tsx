import React, { useState } from 'react';
import { Search, Sparkles, Copy, Check, Bookmark, FileText, ArrowRight } from 'lucide-react';

interface CaseAnalystViewProps {
  onSaveConsultation: (title: string, query: string, result: string, type: 'analyst') => void;
}

export const CaseAnalystView: React.FC<CaseAnalystViewProps> = ({ onSaveConsultation }) => {
  const [problemDescription, setProblemDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const sampleProblems = [
    'نزاع بين شريكين في شركة مساهمة مصرية حول توزيع الأرباح وإدارة الأصول.',
    'مستأجر امتنع عن دفع الأجرة لمدة 4 أشهر متتالية رغم الإنذار الرسمي على يد محضر.',
    'حادث تصادم سيارة تسبب في إصابات غير عشوائية وتلفيات بالسيارة مع هروب المتسبب.',
  ];

  const handleAnalyze = async (textToAnalyze?: string) => {
    const desc = textToAnalyze || problemDescription;
    if (!desc.trim() || loading) return;

    if (textToAnalyze) setProblemDescription(textToAnalyze);
    setLoading(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemDescription: desc }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل تحليل المشكلة');
      setAnalysisResult(data.result);
    } catch (err: any) {
      setAnalysisResult(`حدث خطأ أثناء التحليل: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!analysisResult) return;
    onSaveConsultation(problemDescription.slice(0, 45) + '...', problemDescription, analysisResult, 'analyst');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0A0A] text-gray-200">
      
      {/* Header */}
      <header className="h-20 px-8 flex items-center justify-between border-b border-[#222222] bg-[#0F0F0F]">
        <div className="flex items-center gap-4 text-sm">
          <span className="px-3 py-1 bg-[#222222] rounded-full text-[#C5A059] border border-[#333333]">محلل القضايا والمنازعات</span>
          <span className="text-gray-400 hidden sm:inline">تنظيم الخطوات وخارطة الطريق القانونية</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C5A059] to-[#8E6E32] flex items-center justify-center text-xs text-black font-bold">
          AI
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto max-w-4xl w-full mx-auto">
        
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#222222] shadow-xl">
          <h2 className="text-lg font-bold text-[#C5A059] mb-2">اشرح المشكلة أو النزاع القانوني بالتفصيل:</h2>
          <p className="text-xs text-gray-400 mb-4">يقوم محلل القضايا بتقديم تقرير شامل، تحديد الوثائق المطلوبة، وخارطة طريق عملية.</p>

          <textarea
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            placeholder="اكتب تفاصيل النزاع (الأطراف، العقود الموقعة، تاريخ النزاع، ما تم اتخاذه من خطوات سابقة)..."
            rows={4}
            className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-[#C5A059] transition"
          />

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#C5A059]" />
              <span>نحلل طبيعة النزاع ونقترح خارطة طريق قانونية متكاملة.</span>
            </div>
            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !problemDescription.trim()}
              className="w-full sm:w-auto bg-[#C5A059] hover:bg-[#b48f45] disabled:opacity-50 text-black font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-[#C5A059]/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري تحليل المشكلة القانونية...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5" />
                  <span>تحليل النزاع وإعداد الخارطة</span>
                </>
              )}
            </button>
          </div>

          {/* Sample Problems */}
          <div className="mt-6 pt-5 border-t border-[#222222]">
            <div className="text-xs font-semibold text-[#C5A059] mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>أمثلة لنزاعات شائعة:</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {sampleProblems.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnalyze(sample)}
                  className="text-right text-xs bg-[#222222] hover:bg-[#2A2A2A] text-gray-300 hover:text-white border border-[#333333] p-3 rounded-xl transition"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analysis Result */}
        {analysisResult && (
          <div className="bg-[#222222] rounded-2xl border border-[#333333] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#333333]">
              <div className="flex items-center gap-2 text-[#C5A059] font-bold">
                <Search className="w-5 h-5" />
                <span>تقرير تحليل النزاع وخارطة الطريق</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs bg-[#1A1A1A] hover:bg-[#2A2A2A] text-gray-300 border border-[#333333] px-3 py-1.5 rounded-lg transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ التقرير'}</span>
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 text-xs bg-[#C5A059] hover:bg-[#b48f45] text-black px-3 py-1.5 rounded-lg transition font-bold"
                >
                  {saved ? <Check className="w-4 h-4 text-emerald-900" /> : <Bookmark className="w-4 h-4" />}
                  <span>{saved ? 'تم الحفظ' : 'حفظ التحليل'}</span>
                </button>
              </div>
            </div>

            <div className="whitespace-pre-wrap text-sm text-gray-200 leading-relaxed font-normal">
              {analysisResult}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
