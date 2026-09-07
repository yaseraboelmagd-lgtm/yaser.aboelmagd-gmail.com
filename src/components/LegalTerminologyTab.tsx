import React, { useState, useMemo } from 'react';
import { EGYPTIAN_LEGAL_TERMS, LEGAL_TERM_CATEGORIES } from '../data/legalTerms';
import { LegalTerm, LegalTermCategory } from '../types';
import {
  Search,
  Scale,
  BookOpen,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  BookmarkCheck,
  Sparkles,
  ExternalLink,
  X,
  Gavel,
  ShieldAlert,
} from 'lucide-react';

const ALPHABET_LETTERS = [
  'الكل',
  'أ',
  'ا',
  'إ',
  'ب',
  'ت',
  'ح',
  'خ',
  'د',
  'ر',
  'ش',
  'ص',
  'ط',
  'ع',
  'ف',
  'ق',
  'م',
  'ن',
  'هـ',
  'و',
  'ي',
];

const POPULAR_SEARCH_TERMS = [
  'حجية الأمر المقضي',
  'القوة القاهرة',
  'التلبس',
  'الخلع',
  'خيانة الأمانة',
  'صحة التوقيع',
  'أمر الأداء',
  'التعسف في استعمال الحق',
];

export const LegalTerminologyTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LegalTermCategory>('جميع الفروع');
  const [selectedLetter, setSelectedLetter] = useState<string>('الكل');
  const [expandedTermId, setExpandedTermId] = useState<string | null>('res-judicata');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyDefinition = (term: LegalTerm, e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `${term.term} ${term.termEnglish ? `(${term.termEnglish})` : ''}\nالفرع: ${term.category}\nالتعريف: ${term.definition}\nالسند القانوني: ${term.legalBasis}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(term.id);
    showToast(`تم نسخ تعريف مصطلح "${term.term}" إلى الحافظة`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Helper to normalize Arabic characters for robust search and letter matching
  const normalizeArabic = (text: string) => {
    return text
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[\u064B-\u065F]/g, ''); // Remove Tashkeel
  };

  const filteredTerms = useMemo(() => {
    return EGYPTIAN_LEGAL_TERMS.filter((item) => {
      // 1. Category filter
      if (selectedCategory !== 'جميع الفروع' && item.category !== selectedCategory) {
        return false;
      }

      // 2. Alphabet filter
      if (selectedLetter !== 'الكل') {
        const firstChar = normalizeArabic(item.term.trim()).charAt(0);
        const targetChar = normalizeArabic(selectedLetter.trim()).charAt(0);
        if (firstChar !== targetChar) {
          // If starts with "ال" (definite article), check letter after "ال"
          const cleanTerm = item.term.trim();
          if (cleanTerm.startsWith('ال') && cleanTerm.length > 2) {
            const letterAfterAl = normalizeArabic(cleanTerm.substring(2)).charAt(0);
            if (letterAfterAl !== targetChar) {
              return false;
            }
          } else {
            return false;
          }
        }
      }

      // 3. Search query filter
      if (searchTerm.trim()) {
        const queryNorm = normalizeArabic(searchTerm.toLowerCase().trim());
        const termNorm = normalizeArabic(item.term.toLowerCase());
        const engNorm = (item.termEnglish || '').toLowerCase();
        const defNorm = normalizeArabic(item.definition.toLowerCase());
        const basisNorm = normalizeArabic(item.legalBasis.toLowerCase());
        const exNorm = normalizeArabic(item.practicalExample.toLowerCase());
        const keyPointsNorm = normalizeArabic((item.keyPoints || []).join(' ').toLowerCase());

        const matches =
          termNorm.includes(queryNorm) ||
          engNorm.includes(searchTerm.toLowerCase().trim()) ||
          defNorm.includes(queryNorm) ||
          basisNorm.includes(queryNorm) ||
          exNorm.includes(queryNorm) ||
          keyPointsNorm.includes(queryNorm);

        if (!matches) return false;
      }

      return true;
    });
  }, [searchTerm, selectedCategory, selectedLetter]);

  const getCategoryBadgeColor = (cat: LegalTermCategory) => {
    switch (cat) {
      case 'قانون مدني':
        return 'bg-amber-950/40 text-[#C5A059] border-amber-800/50';
      case 'قانون جنائي':
        return 'bg-red-950/40 text-red-400 border-red-800/50';
      case 'مرافعات وإجراءات':
        return 'bg-sky-950/40 text-sky-400 border-sky-800/50';
      case 'قانون الإثبات':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50';
      case 'أحوال شخصية':
        return 'bg-purple-950/40 text-purple-400 border-purple-800/50';
      case 'قانون تجاري وشركات':
        return 'bg-indigo-950/40 text-indigo-400 border-indigo-800/50';
      case 'قانون العمل':
        return 'bg-amber-800/20 text-orange-300 border-orange-800/50';
      default:
        return 'bg-[#222222] text-gray-300 border-[#333333]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] border border-[#C5A059] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4 text-[#C5A059]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Search & Filter Card */}
      <div className="bg-[#1A1A1A] rounded-2xl shadow-xl border border-[#2B2B2B] p-5 space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-4 top-3.5 w-4 h-4 text-[#C5A059]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم العربي، اللاتيني، أو التعريف (مثل: حجية الأمر المقضي، Force Majeure، التلبس)..."
              className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl pr-11 pl-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-[#C5A059] transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-3.5 text-gray-400 hover:text-white p-0.5 rounded-full hover:bg-[#222222] transition"
                title="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end text-xs text-gray-400">
            <span className="bg-[#121212] px-3 py-2 rounded-xl border border-[#2B2B2B] font-mono">
              <span className="text-[#C5A059] font-bold">{filteredTerms.length}</span> مصطلح متطابق
            </span>
            {(searchTerm || selectedCategory !== 'جميع الفروع' || selectedLetter !== 'الكل') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('جميع الفروع');
                  setSelectedLetter('الكل');
                }}
                className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer"
              >
                إعادة ضبط التصفية
              </button>
            )}
          </div>
        </div>

        {/* Popular Quick Suggestions */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="text-gray-400 flex items-center gap-1 shrink-0 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>الأكثر بحثاً:</span>
          </span>
          {POPULAR_SEARCH_TERMS.map((popTerm) => (
            <button
              key={popTerm}
              onClick={() => {
                setSearchTerm(popTerm);
                setSelectedCategory('جميع الفروع');
                setSelectedLetter('الكل');
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] transition cursor-pointer ${
                searchTerm === popTerm
                  ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059] font-semibold'
                  : 'bg-[#121212] border-[#2A2A2A] text-gray-400 hover:text-gray-200 hover:border-[#444444]'
              }`}
            >
              {popTerm}
            </button>
          ))}
        </div>

        {/* Branch / Category Filter Buttons */}
        <div className="pt-2 border-t border-[#242424]">
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {LEGAL_TERM_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                    isSelected
                      ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-md'
                      : 'bg-[#121212] border-[#2A2A2A] text-gray-300 hover:text-white hover:border-[#444444]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Alphabetical Quick Index */}
        <div className="pt-2 border-t border-[#242424]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[11px] text-gray-400 shrink-0 font-medium ml-1">تصفح بالحرف:</span>
            {ALPHABET_LETTERS.map((letter) => {
              const isSelected = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition flex items-center justify-center cursor-pointer border ${
                    isSelected
                      ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-sm'
                      : 'bg-[#141414] border-[#2A2A2A] text-gray-400 hover:text-white hover:border-[#444444]'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Terminology List */}
      <div className="space-y-4">
        {filteredTerms.length === 0 ? (
          <div className="bg-[#1A1A1A] rounded-2xl p-12 text-center text-gray-400 border border-[#222222]">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-white">لا توجد مصطلحات قانونية مطابقة لبحثك</p>
            <p className="text-xs mt-1 text-gray-500 max-w-md mx-auto">
              جرب البحث بكلمات أخرى أو تغيير التصنيف القانوني، أو استعرض كافة المصطلحات باختيار "جميع الفروع".
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('جميع الفروع');
                setSelectedLetter('الكل');
              }}
              className="mt-4 px-4 py-2 bg-[#C5A059] hover:bg-[#D4B26F] text-black font-bold text-xs rounded-xl transition cursor-pointer"
            >
              عرض كافة المصطلحات القانونية
            </button>
          </div>
        ) : (
          filteredTerms.map((termItem) => {
            const isExpanded = expandedTermId === termItem.id;
            const isCopied = copiedId === termItem.id;

            return (
              <div
                key={termItem.id}
                className={`bg-[#1A1A1A] rounded-2xl border transition shadow-lg overflow-hidden ${
                  isExpanded ? 'border-[#C5A059]/50 shadow-[#C5A059]/5' : 'border-[#262626] hover:border-[#3A3A3A]'
                }`}
              >
                {/* Header / Term Row */}
                <div
                  onClick={() => setExpandedTermId(isExpanded ? null : termItem.id)}
                  className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-[#202020] transition select-none"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#121212] border border-[#333333] text-[#C5A059] flex items-center justify-center shrink-0 font-bold mt-0.5">
                      <Scale className="w-5 h-5" />
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-bold text-white tracking-wide">
                          {termItem.term}
                        </h3>

                        {termItem.termEnglish && (
                          <span className="text-xs text-gray-400 font-mono italic bg-[#111111] px-2 py-0.5 rounded-md border border-[#2B2B2B]">
                            {termItem.termEnglish}
                          </span>
                        )}

                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${getCategoryBadgeColor(
                            termItem.category
                          )}`}
                        >
                          {termItem.category}
                        </span>
                      </div>

                      {/* Snippet / Definition Preview */}
                      <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                        {termItem.definition}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    <button
                      onClick={(e) => handleCopyDefinition(termItem, e)}
                      title="نسخ تعريف وسند المصطلح"
                      className="p-2 text-gray-400 hover:text-white bg-[#121212] hover:bg-[#252525] border border-[#2E2E2E] rounded-xl transition cursor-pointer"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <div className="p-2 text-gray-400 hover:text-white bg-[#121212] border border-[#2E2E2E] rounded-xl transition">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-[#252525] bg-[#121212] space-y-4 animate-in fade-in duration-150">
                    {/* Full Definition */}
                    <div className="bg-[#181818] p-4 rounded-xl border border-[#2B2B2B] space-y-1.5">
                      <span className="text-xs font-bold text-[#C5A059] flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-[#C5A059]" />
                        <span>التعريف المعتمد في الفقه والقضاء المصري:</span>
                      </span>
                      <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal">
                        {termItem.definition}
                      </p>
                    </div>

                    {/* Legal Basis & Statutory References */}
                    <div className="bg-[#181818] p-4 rounded-xl border border-[#2B2B2B] space-y-1.5">
                      <span className="text-xs font-bold text-[#C5A059] flex items-center gap-1.5">
                        <Gavel className="w-4 h-4 text-[#C5A059]" />
                        <span>السند القانوني والنصوص الحاكمة في التشريع المصري:</span>
                      </span>
                      <p className="text-xs text-gray-300 leading-relaxed font-mono bg-[#0D0D0D] p-3 rounded-lg border border-[#262626]">
                        {termItem.legalBasis}
                      </p>
                    </div>

                    {/* Practical Court Application / Example */}
                    <div className="bg-[#181818] p-4 rounded-xl border border-[#2B2B2B] space-y-1.5">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                        <span>تطبيق ومثال عملي وقضائي في المحاكم المصرية:</span>
                      </span>
                      <p className="text-xs text-gray-300 leading-relaxed bg-[#0D0D0D] p-3 rounded-lg border border-[#262626]">
                        {termItem.practicalExample}
                      </p>
                    </div>

                    {/* Key Elements / Conditions */}
                    {termItem.keyPoints && termItem.keyPoints.length > 0 && (
                      <div className="bg-[#181818] p-4 rounded-xl border border-[#2B2B2B] space-y-2">
                        <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-sky-400" />
                          <span>الشروط والعناصر الجوهرية للمبدأ:</span>
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {termItem.keyPoints.map((point, idx) => (
                            <div
                              key={idx}
                              className="bg-[#0D0D0D] p-2.5 rounded-lg border border-[#242424] text-xs text-gray-300 flex items-start gap-2"
                            >
                              <span className="w-4 h-4 rounded-full bg-sky-950 text-sky-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border border-sky-800">
                                {idx + 1}
                              </span>
                              <span className="leading-snug">{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Terms */}
                    {termItem.relatedTerms && termItem.relatedTerms.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                        <span className="text-gray-400 text-xs font-medium">مفاهيم ومصطلحات مرتبطة:</span>
                        {termItem.relatedTerms.map((relTerm, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSearchTerm(relTerm);
                              setSelectedCategory('جميع الفروع');
                              setSelectedLetter('الكل');
                            }}
                            className="bg-[#1C1C1C] hover:bg-[#252525] text-gray-300 hover:text-[#C5A059] px-2.5 py-1 rounded-lg border border-[#333333] transition flex items-center gap-1 text-xs cursor-pointer"
                          >
                            <span>{relTerm}</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
