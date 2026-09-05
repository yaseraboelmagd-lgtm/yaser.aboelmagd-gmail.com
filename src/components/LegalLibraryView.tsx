import React, { useState } from 'react';
import { EGYPTIAN_LEGAL_REFERENCES } from '../data/legalReferences';
import { BookOpen, Search, HelpCircle, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { LegalArticle } from '../types';

export const LegalLibraryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('civil-law');

  const categories = [
    { id: 'all', label: 'جميع القوانين' },
    { id: 'قانون مدني', label: 'القانون المدني' },
    { id: 'قانون العمل', label: 'قانون العمل' },
    { id: 'قانون جنائي', label: 'قانون العقوبات والجنايات' },
    { id: 'أحوال شخصية', label: 'الأحوال الشخصية' },
    { id: 'قانون إيجارات', label: 'الإيجارات' },
    { id: 'قانون تجاري', label: 'التجارة والشركات' },
  ];

  const filteredArticles = EGYPTIAN_LEGAL_REFERENCES.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.keyArticles.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0A0A] text-gray-200">
      
      {/* Header */}
      <header className="h-20 px-8 flex items-center justify-between border-b border-[#222222] bg-[#0F0F0F]">
        <div className="flex items-center gap-4 text-sm">
          <span className="px-3 py-1 bg-[#222222] rounded-full text-[#C5A059] border border-[#333333]">المكتبة القانونية المصرية المرجعية</span>
          <span className="text-gray-400 hidden sm:inline">أهم التشريعات والقوانين المعمول بها</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C5A059] to-[#8E6E32] flex items-center justify-center text-xs text-black font-bold">
          AI
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto max-w-5xl w-full mx-auto">
        
        {/* Search & Filter Bar */}
        <div className="bg-[#1A1A1A] rounded-2xl shadow-xl border border-[#222222] p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-4 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث في القوانين، المواد، أو الموضوعات..."
              className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl pr-11 pl-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-[#C5A059] transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-[#C5A059] text-black font-bold shadow-md'
                    : 'bg-[#222222] hover:bg-[#2A2A2A] text-gray-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {filteredArticles.length === 0 ? (
            <div className="bg-[#1A1A1A] rounded-2xl p-16 text-center text-gray-400 border border-[#222222]">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-white">لا توجد نتائج مطابقة لبحثك</p>
              <p className="text-xs mt-1 text-gray-500">جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً</p>
            </div>
          ) : (
            filteredArticles.map((article: LegalArticle) => {
              const isExpanded = expandedId === article.id;
              return (
                <div
                  key={article.id}
                  className="bg-[#1A1A1A] rounded-2xl shadow-xl border border-[#222222] overflow-hidden transition"
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : article.id)}
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-[#222222] transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#222222] text-[#C5A059] flex items-center justify-center shrink-0 font-bold mt-0.5 border border-[#333333]">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-base font-bold text-white">{article.title}</h2>
                          <span className="bg-[#222222] text-[#C5A059] text-xs px-3 py-0.5 rounded-full font-medium border border-[#333333]">
                            {article.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{article.description}</p>
                      </div>
                    </div>

                    <button className="text-gray-400 hover:text-white p-2">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-[#222222] bg-[#121212] space-y-4">
                      <div>
                        <span className="text-xs font-bold text-[#C5A059] block mb-1">نبذة عن التشريع:</span>
                        <p className="text-sm text-gray-300 leading-relaxed">{article.summary}</p>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-[#C5A059] block mb-1">أهم المواد القانونية:</span>
                        <div className="bg-[#1A1A1A] p-3.5 rounded-xl border border-[#333333] text-xs text-gray-200 font-mono">
                          {article.keyArticles}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-[#C5A059] block mb-2.5 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4" />
                          <span>أسئلة شائعة وتطبيقات عملية:</span>
                        </span>
                        <div className="space-y-3">
                          {article.commonQuestions.map((qa, i) => (
                            <div key={i} className="bg-[#1A1A1A] p-4 rounded-xl border border-[#333333] text-xs space-y-1.5">
                              <p className="font-bold text-white">س: {qa.q}</p>
                              <p className="text-gray-300 leading-relaxed">ج: {qa.a}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
