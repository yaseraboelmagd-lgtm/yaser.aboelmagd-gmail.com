import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, Bot, User, Sparkles, Bookmark, Check, Copy, RefreshCw, MessageSquare } from 'lucide-react';

interface LegalAdvisorChatProps {
  onSaveConsultation: (title: string, query: string, result: string, type: 'advisor') => void;
}

export const LegalAdvisorChat: React.FC<LegalAdvisorChatProps> = ({ onSaveConsultation }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      content: 'أهلاً بك في نظام **المحامي الذكي**. أنا مستشارك القانوني الافتراضي المتخصص في القانون المصري. كيف يمكنني مساعدتك اليوم في أي مسألة مدنية، جنائية، عمالية، أو أسرية؟',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'ما هي حقوق الموظف عند الفصل التعسفي طبقاً لقانون العمل المصري؟',
    'ما هي شروط وإجراءات رفع دعوى خلع في محكمة الأسرة؟',
    'كيف يتم كتابة عقد إيجار صحيح طبقاً للقانون المدني المصري؟',
    'ما هي عقوبة إصدار شيك بدون رصيد في القانون المصري؟',
    'ما هي مستندات وإجراءات تأسيس شركة ذات مسؤولية محدودة في مصر؟',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'حدث خطأ في الاتصال');

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `عذراً، حدث خطأ أثناء الاتصال بالمستشار القانوني: ${err.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = (msg: ChatMessage, prevUserQuery?: string) => {
    const title = prevUserQuery ? prevUserQuery.slice(0, 45) + '...' : 'استشارة قانونية';
    onSaveConsultation(title, prevUserQuery || 'استشارة عامة', msg.content, 'advisor');
    setSavedIds((prev) => ({ ...prev, [msg.id]: true }));
    setTimeout(() => {
      setSavedIds((prev) => ({ ...prev, [msg.id]: false }));
    }, 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0A0A] text-gray-200">
      
      {/* Top Header */}
      <header className="h-20 px-8 flex items-center justify-between border-b border-[#222222] bg-[#0F0F0F]">
        <div className="flex items-center gap-4 text-sm">
          <span className="px-3 py-1 bg-[#222222] rounded-full text-[#C5A059] border border-[#333333]">وضع الذكاء الاصطناعي نشط</span>
          <span className="text-gray-400 hidden sm:inline">تحليل القوانين المصرية وطبقا لأحكام النقض</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMessages([messages[0]])}
            className="text-xs flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#222222] text-gray-300 border border-[#333333] transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>محادثة جديدة</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C5A059] to-[#8E6E32] flex items-center justify-center text-xs text-black font-bold">
            AI
          </div>
        </div>
      </header>

      {/* Messages Section */}
      <section className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
        
        {messages.length <= 1 && (
          <div className="mb-6 bg-[#1A1A1A] p-6 rounded-2xl border border-[#222222]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C5A059] mb-3">
              <Sparkles className="w-4 h-4" />
              <span>أسئلة شائعة مقترحة في القانون المصري:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="text-xs bg-[#222222] hover:bg-[#2A2A2A] text-gray-200 hover:text-[#C5A059] border border-[#333333] px-3.5 py-2 rounded-xl transition text-right"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const prevUserQuery = isUser ? '' : messages[index - 1]?.content;

          return (
            <div
              key={msg.id}
              className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center border ${
                  isUser
                    ? 'bg-[#1A1A1A] border-[#333333] text-gray-200'
                    : 'bg-[#C5A059] border-[#C5A059] text-black font-bold'
                }`}
              >
                {isUser ? <User className="w-5 h-5 text-gray-300" /> : <span className="text-sm font-bold">AI</span>}
              </div>

              <div
                className={`p-6 rounded-2xl max-w-2xl text-sm leading-relaxed border shadow-xl ${
                  isUser
                    ? 'bg-[#1A1A1A] text-gray-100 rounded-tr-none border-[#222222]'
                    : 'bg-[#222222] text-gray-200 rounded-tl-none border-[#333333] space-y-4'
                }`}
              >
                {!isUser && (
                  <p className="font-bold text-[#C5A059] text-base">تحليل المستشار القانوني الذكي:</p>
                )}
                <div className="whitespace-pre-wrap font-normal leading-relaxed">{msg.content}</div>

                {!isUser && (
                  <div className="mt-4 pt-3 border-t border-[#333333] flex items-center justify-end gap-3 text-xs">
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#333333] transition"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === msg.id ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                    <button
                      onClick={() => handleSave(msg, prevUserQuery)}
                      className="flex items-center gap-1.5 text-[#C5A059] hover:text-[#b48f45] px-3 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#333333] transition font-medium"
                    >
                      {savedIds[msg.id] ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Bookmark className="w-3.5 h-3.5" />}
                      <span>{savedIds[msg.id] ? 'تم الحفظ' : 'حفظ الاستشارة'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#C5A059] shrink-0 flex items-center justify-center text-black font-bold text-sm">
              AI
            </div>
            <div className="bg-[#222222] border border-[#333333] rounded-2xl rounded-tl-none p-5 text-sm text-gray-400 flex items-center gap-3">
              <div className="flex space-x-1.5 space-x-reverse">
                <div className="w-2 h-2 bg-[#C5A059] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#C5A059] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-[#C5A059] rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span>المستشار القانوني يقوم بمراجعة النصوص والمواد القانونية المصرية...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </section>

      {/* Footer Input */}
      <footer className="p-6 bg-[#0F0F0F] border-t border-[#222222]">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="اسأل عن أي مادة قانونية أو استشارة..."
            className="w-full bg-[#1A1A1A] border border-[#333333] rounded-2xl py-4 px-6 pr-12 focus:outline-hidden focus:border-[#C5A059] transition-colors text-sm text-white placeholder-gray-500"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-2">
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-[#C5A059] hover:bg-[#b48f45] disabled:opacity-50 text-black px-6 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-lg shadow-[#C5A059]/10"
            >
              إرسال الاستشارة
            </button>
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-8 text-[10px] text-gray-500 uppercase tracking-widest">
          <span>ذكاء اصطناعي متخصص</span>
          <span>قوانين الدولة المصرية</span>
          <span>تشفير بيانات آمن</span>
        </div>
      </footer>

    </div>
  );
};
