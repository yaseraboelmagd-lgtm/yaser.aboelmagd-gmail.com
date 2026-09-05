import React, { useState } from 'react';
import { ShieldCheck, Sparkles, Copy, Check, Bookmark, Send, AlertCircle, Gavel } from 'lucide-react';

interface DefendantViewProps {
  onSaveConsultation: (title: string, query: string, result: string, type: 'defendant') => void;
}

export const DefendantView: React.FC<DefendantViewProps> = ({ onSaveConsultation }) => {
  const [caseDetails, setCaseDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const sampleCases = [
    'اتهم شخص زوراً بخيانة الأمانة بموجب إيصال أمانة وقعه تحت الضغط ولم يستلم مبالغ مالية.',
    'بلاغ كيدي ضد صاحب محل تجاري بتهمة بيع سلع مجهولة المصدر، بينما البضائع بفواتير رسمية.',
    'قضية منازعة عمالية بعد فصل تعسفي من شركة دون إنذار قانوني طبقاً لقانون العمل.',
  ];

  const handleAnalyze = async (textToAnalyze?: string) => {
    const details = textToAnalyze || caseDetails;
    if (!details.trim() || loading) return;

    if (textToAnalyze) setCaseDetails(textToAnalyze);
    setLoading(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/defense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseDetails: details }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل تحليل موقف الدفاع');
      setAnalysisResult(data.analysis);
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
    onSaveConsultation(caseDetails.slice(0, 45) + '...', caseDetails, analysisResult, 'defendant');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0A0A] text-gray-200">
      
      {/* Header */}
      <header className="h-20 px-8 flex items-center justify-between border-b border-[#222222] bg-[#0F0F0F]">
        <div className="flex items-center gap-4 text-sm">
          <span className="px-3 py-1 bg-[#222222] rounded-full text-[#C5A059] border border-[#333333]">محامي الدفاع والدفوع القانونية</span>
          <span className="text-gray-400 hidden sm:inline">تحليل حقوق المتهم والدعاوى الجنائية والمدنية</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C5A059] to-[#8E6E32] flex items-center justify-center text-xs text-black font-bold">
          AI
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto max-w-4xl w-full mx-auto">
        
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#222222] shadow-xl">
          <h2 className="text-lg font-bold text-[#C5A059] mb-2">أدخل تفاصيل التهمة أو النزاع الموجه ضدك:</h2>
          <p className="text-xs text-gray-400 mb-4">سيقوم النظام بتحليل الاتهام وتقديم الثغرات والدفوع القانونية المناسبة طبقاً للقانون المصري.</p>
          
          <textarea
            value={caseDetails}
            onChange={(e) => setCaseDetails(e.target.value)}
            placeholder="اكتب تفاصيل الاتهام أو النزاع بدقة (مثل: تفاصيل إيصال الأمانة، بلاغ الشرطة، المحضر)..."
            rows={4}
            className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-[#C5A059] transition"
          />

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-[#C5A059]" />
              <span>استراتيجية دفاعية مبدئية للاستئناس وأخذ الحيطة.</span>
            </div>
            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !caseDetails.trim()}
              className="w-full sm:w-auto bg-[#C5A059] hover:bg-[#b48f45] disabled:opacity-50 text-black font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-[#C5A059]/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري إعداد استراتيجية الدفاع...</span>
                </>
              ) : (
                <>
                  <Gavel className="w-5 h-5" />
                  <span>تحليل موقف الدفاع</span>
                </>
              )}
            </button>
          </div>

          {/* Sample Cases */}
          <div className="mt-6 pt-5 border-t border-[#222222]">
            <div className="text-xs font-semibold text-[#C5A059] mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>أمثلة لحالات دفاع شائعة:</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {sampleCases.map((sample, idx) => (
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
                <ShieldCheck className="w-5 h-5" />
                <span>تقرير استراتيجية الدفاع القانوني</span>
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
