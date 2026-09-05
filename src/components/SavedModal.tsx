import React, { useState, useEffect } from 'react';
import { SavedItem } from '../types';
import {
  BookmarkCheck,
  X,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Scale,
  ShieldCheck,
  Search,
  Printer,
  FileText,
  FileDown,
  Share2,
  FileSignature,
} from 'lucide-react';
import {
  downloadTxtFile,
  formatSingleConsultationTxt,
  formatAllConsultationsTxt,
  triggerPrintDocument,
} from '../utils/exportUtils';

interface SavedModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: SavedItem[];
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const SavedModal: React.FC<SavedModalProps> = ({
  isOpen,
  onClose,
  savedItems,
  onDeleteItem,
  onClearAll,
}) => {
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const filteredItems = savedItems.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.query.toLowerCase().includes(q) ||
      item.result.toLowerCase().includes(q)
    );
  });

  // Keep selected item valid or select first
  useEffect(() => {
    if (!isOpen) {
      setSelectedItem(null);
      setSearchQuery('');
      return;
    }
    if (filteredItems.length > 0) {
      if (!selectedItem || !filteredItems.some((it) => it.id === selectedItem.id)) {
        setSelectedItem(filteredItems[0]);
      }
    } else {
      setSelectedItem(null);
    }
  }, [isOpen, filteredItems.length]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showFeedback('تم نسخ النص إلى الحافظة');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export single item to TXT
  const handleExportSingleTxt = (item: SavedItem) => {
    const content = formatSingleConsultationTxt(item);
    const sanitizedTitle = item.title.replace(/[\/\\?%*:|"<>]/g, '_').trim();
    downloadTxtFile(`${sanitizedTitle}_استشارة.txt`, content);
    showFeedback('تم تحميل ملف الاستشارة بصيغة TXT بنجاح');
  };

  // Export all items to TXT
  const handleExportAllTxt = (itemsToExport: SavedItem[]) => {
    if (itemsToExport.length === 0) return;
    const content = formatAllConsultationsTxt(itemsToExport);
    downloadTxtFile(`سجل_الاستشارات_القانونية_${itemsToExport.length}.txt`, content);
    showFeedback(`تم تصدير ${itemsToExport.length} استشارة في ملف TXT بنجاح`);
  };

  // Print/Export single item as PDF
  const handlePrintSinglePdf = (item: SavedItem) => {
    triggerPrintDocument([item], item.title);
    showFeedback('جاري تجهيز وثيقة الاستشارة وفتح نافذة الطباعة / الحفظ كـ PDF');
  };

  // Print/Export all items as PDF
  const handlePrintAllPdf = (itemsToExport: SavedItem[]) => {
    if (itemsToExport.length === 0) return;
    triggerPrintDocument(itemsToExport, `سجل الاستشارات القانونية (${itemsToExport.length})`);
    showFeedback(`جاري تجهيز تقرير يشمل ${itemsToExport.length} استشارة للطباعة كـ PDF`);
  };

  // Share item via Web Share or clipboard
  const handleShare = async (item: SavedItem) => {
    const shareText = `المحامي الذكي | ${item.title}\n\n[المسألة]: ${item.query}\n\n[التحليل القانوني]:\n${item.result}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: shareText,
        });
        showFeedback('تمت المشاركة بنجاح');
        return;
      } catch {
        // user cancelled or share failed, fallback to copy
      }
    }
    navigator.clipboard.writeText(shareText);
    showFeedback('تم نسخ تقرير الاستشارة كاملاً للمشاركة عبر الرسائل أو البريد');
  };

  const getTypeBadge = (type: 'advisor' | 'defendant' | 'analyst' | 'contract') => {
    switch (type) {
      case 'advisor':
        return <span className="bg-[#222222] text-[#C5A059] border border-[#333333] text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5"><Scale className="w-3 h-3" /> مستشار قانوني</span>;
      case 'defendant':
        return <span className="bg-[#222222] text-emerald-400 border border-[#333333] text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> محامي دفاع</span>;
      case 'analyst':
        return <span className="bg-[#222222] text-blue-400 border border-[#333333] text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5"><Search className="w-3 h-3" /> محلل قضايا</span>;
      case 'contract':
        return <span className="bg-[#222222] text-amber-400 border border-[#333333] text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5"><FileSignature className="w-3 h-3" /> مسودة عقد</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0F0F0F] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-[#222222]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-[#1A1A1A] text-white flex items-center justify-between border-b border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A059] text-black flex items-center justify-center font-bold">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#C5A059]">السجل المحفوظ والاستشارات</h2>
              <p className="text-xs text-gray-400">جميع الاستشارات والتحليلات القانونية المحفوظة محلياً مع خيارات التصدير والطباعة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-gray-300 hover:text-white flex items-center justify-center transition border border-[#333333]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback notification toast */}
        {feedbackToast && (
          <div className="bg-[#1A1A1A] border-b border-[#C5A059]/40 px-6 py-2.5 flex items-center justify-between text-xs text-[#C5A059] transition-all">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{feedbackToast}</span>
            </span>
            <button
              onClick={() => setFeedbackToast(null)}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0A0A0A] flex flex-col">
          {savedItems.length === 0 ? (
            <div className="py-20 text-center text-gray-500 space-y-3 my-auto">
              <BookmarkCheck className="w-16 h-16 text-gray-700 mx-auto" />
              <p className="text-base font-semibold text-gray-300">لا توجد استشارات محفوظة حتى الآن</p>
              <p className="text-xs text-gray-500">قم بحفظ أي استشارة أو تحليل قانوني للرجوع إليه في أي وقت.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في العناوين، الأسئلة، أو نصوص الاستشارات والتحليلات القانونية..."
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl pr-10 pl-10 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A059] transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {filteredItems.length === 0 ? (
                <div className="py-16 text-center text-gray-500 space-y-2 my-auto">
                  <Search className="w-12 h-12 text-gray-700 mx-auto" />
                  <p className="text-sm font-semibold text-gray-300">لا توجد نتائج مطابقة لبحثك</p>
                  <p className="text-xs text-gray-500">لم يتم العثور على استشارات تطابق "{searchQuery}".</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
                  
                  {/* List */}
                  <div className="md:col-span-1 space-y-3 overflow-y-auto max-h-[50vh] pr-1">
                    {filteredItems.map((item) => {
                      const isSelected = selectedItem?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={`p-4 rounded-2xl border cursor-pointer transition text-right ${
                            isSelected
                              ? 'bg-[#1A1A1A] border-[#C5A059] shadow-lg'
                              : 'bg-[#1A1A1A]/60 hover:bg-[#1A1A1A] border-[#222222]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            {getTypeBadge(item.type)}
                            <span className="text-[10px] text-gray-500">{item.date}</span>
                          </div>
                          <h3 className="text-sm font-bold text-white truncate mb-1">{item.title}</h3>
                          <p className="text-xs text-gray-400 line-clamp-2">{item.query}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Detail view */}
                  <div className="md:col-span-2 bg-[#1A1A1A] rounded-2xl border border-[#222222] p-5 flex flex-col justify-between overflow-y-auto max-h-[50vh]">
                    {selectedItem ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-[#222222] pb-3 flex-wrap gap-2">
                          <div>
                            {getTypeBadge(selectedItem.type)}
                            <span className="text-xs text-gray-500 block mt-1">{selectedItem.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => handlePrintSinglePdf(selectedItem)}
                              title="طباعة أو تصدير الاستشارة كملف PDF"
                              className="flex items-center gap-1 text-xs bg-[#222222] hover:bg-[#2A2A2A] text-[#C5A059] border border-[#C5A059]/40 hover:border-[#C5A059] px-2.5 py-1.5 rounded-lg transition font-medium cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>طباعة / PDF</span>
                            </button>

                            <button
                              onClick={() => handleExportSingleTxt(selectedItem)}
                              title="تحميل الاستشارة كملف نصي TXT"
                              className="flex items-center gap-1 text-xs bg-[#222222] hover:bg-[#2A2A2A] text-gray-300 hover:text-white border border-[#333333] px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>تصدير TXT</span>
                            </button>

                            <button
                              onClick={() => handleShare(selectedItem)}
                              title="مشاركة الاستشارة"
                              className="flex items-center gap-1 text-xs bg-[#222222] hover:bg-[#2A2A2A] text-gray-300 hover:text-white border border-[#333333] px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>مشاركة</span>
                            </button>

                            <button
                              onClick={() => handleCopy(selectedItem.result, selectedItem.id)}
                              className="flex items-center gap-1 text-xs bg-[#222222] hover:bg-[#2A2A2A] text-gray-300 border border-[#333333] px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              {copiedId === selectedItem.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedId === selectedItem.id ? 'تم النسخ' : 'نسخ'}</span>
                            </button>

                            <button
                              onClick={() => onDeleteItem(selectedItem.id)}
                              className="flex items-center gap-1 text-xs bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-900/50 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-gray-400 mb-1">السؤال / النزاع:</h4>
                          <p className="text-sm font-semibold text-white bg-[#0A0A0A] p-3.5 rounded-xl border border-[#333333]">
                            {selectedItem.query}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-gray-400 mb-1">التحليل القانوني:</h4>
                          <div className="text-xs text-gray-200 bg-[#0A0A0A] p-4 rounded-xl border border-[#333333] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                            {selectedItem.result}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                        <ExternalLink className="w-12 h-12 text-gray-700 mb-2" />
                        <p className="text-sm font-medium text-gray-300">اختر استشارة من القائمة الجانبية لعرض التفاصيل</p>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {savedItems.length > 0 && (
          <div className="px-6 py-4 bg-[#1A1A1A] border-t border-[#222222] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-gray-400">
                المحفوظات: {filteredItems.length} {filteredItems.length !== savedItems.length ? `(من ${savedItems.length})` : ''}
              </span>
              <div className="h-4 w-px bg-[#333333] hidden sm:block" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400 hidden md:inline">تصدير السجل:</span>
                <button
                  onClick={() => handlePrintAllPdf(filteredItems)}
                  className="flex items-center gap-1.5 text-xs bg-[#222222] hover:bg-[#2A2A2A] text-[#C5A059] border border-[#C5A059]/40 hover:border-[#C5A059] px-3 py-1.5 rounded-lg transition font-medium cursor-pointer"
                  title="طباعة أو تصدير جميع الاستشارات المعروضة كملف PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>تصدير الكل (PDF)</span>
                </button>
                <button
                  onClick={() => handleExportAllTxt(filteredItems)}
                  className="flex items-center gap-1.5 text-xs bg-[#222222] hover:bg-[#2A2A2A] text-gray-300 hover:text-white border border-[#333333] px-3 py-1.5 rounded-lg transition font-medium cursor-pointer"
                  title="تحميل جميع الاستشارات كملف نصي TXT"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>تصدير الكل (TXT)</span>
                </button>
              </div>
            </div>

            <button
              onClick={onClearAll}
              className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-950/50 border border-red-900/40 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>مسح كل السجل</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
