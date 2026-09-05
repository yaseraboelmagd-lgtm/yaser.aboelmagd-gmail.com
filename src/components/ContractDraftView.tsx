import React, { useState } from 'react';
import {
  FileSignature,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  Printer,
  FileDown,
  Share2,
  Edit3,
  Eye,
  RefreshCw,
  Building,
  Home,
  Briefcase,
  Users,
  Hammer,
  ShieldAlert,
  ArrowRight,
  Info,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { downloadTxtFile, triggerPrintDocument } from '../utils/exportUtils';
import { SavedItem } from '../types';

interface ContractDraftViewProps {
  onSaveConsultation: (
    title: string,
    query: string,
    result: string,
    type: 'contract'
  ) => void;
}

interface ContractTemplatePreset {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  defaultType: string;
  description: string;
  sampleData: {
    contractType: string;
    firstParty: string;
    secondParty: string;
    subject: string;
    financials: string;
    duration: string;
    specialConditions: string;
  };
}

export const ContractDraftView: React.FC<ContractDraftViewProps> = ({
  onSaveConsultation,
}) => {
  // Mode tabs: 'presets' | 'guided' | 'freeform'
  const [activeTab, setActiveTab] = useState<'presets' | 'guided' | 'freeform'>('presets');

  // Form Fields
  const [contractType, setContractType] = useState('عقد إيجار شقة سكنية (قانون 4 لسنة 1996)');
  const [firstParty, setFirstParty] = useState('');
  const [secondParty, setSecondParty] = useState('');
  const [subject, setSubject] = useState('');
  const [financials, setFinancials] = useState('');
  const [duration, setDuration] = useState('');
  const [specialConditions, setSpecialConditions] = useState('');
  const [freeformPrompt, setFreeformPrompt] = useState('');

  // Result & State
  const [loading, setLoading] = useState(false);
  const [contractDraft, setContractDraft] = useState<string | null>(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [editableDraft, setEditableDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Popular Egyptian Legal Contract Presets
  const presets: ContractTemplatePreset[] = [
    {
      id: 'rent-residential',
      name: 'عقد إيجار وحدة سكنية',
      category: 'قانون الإيجار رقم 4 لسنة 1996',
      icon: <Home className="w-5 h-5 text-[#C5A059]" />,
      defaultType: 'عقد إيجار شقة سكنية وفقاً للقانون رقم 4 لسنة 1996 المعدل بالقانون 137 لسنة 2006',
      description: 'يتضمن شرط الصيغة التنفيذية أمام الشهر العقاري، التأمين، والشرط الفاسخ الصريح.',
      sampleData: {
        contractType: 'عقد إيجار شقة سكنية وفقاً لأحكام القانون رقم 4 لسنة 1996 المعدل بالقانون 137 لسنة 2006',
        firstParty: 'السيد / أحمد محمود إبراهيم - مصري الجنسية - بطاقة رقم قومي (28501011234567) - مقيم في مدينة نصر، القاهرة (طرف أول - مؤجر)',
        secondParty: 'السيد / محمد علي حسن - مصري الجنسية - بطاقة رقم قومي (29205021234567) - مقيم في الدقي، الجيزة (طرف ثانٍ - مستأجر)',
        subject: 'تأجير الشقة السكنية رقم (4) بالدور الثالث بالعقار رقم (15) شارع الطيران، مدينة نصر، القاهرة، المكونة من 3 غرف وصالة وحمام ومطبخ بغرض السكن العائلي فقط.',
        financials: 'القيمة الإيجارية الشهرية مبلغ وقدره 4,500 جنيه مصري تُدفع مقدماً أول كل شهر، مع سداد مبلغ 9,000 جنيه مصري كتأمين يُرد بنهاية الإيجار بعد خصم الفواتير والتلفيات إن وجدت.',
        duration: 'مدة الإيجار ثلاث سنوات تبدأ من 2026/10/01 وتنتهي في 2029/09/30 ولا تجدد إلا بعقد واتفاق كتابي جديد.',
        specialConditions: 'يحظر التأجير من الباطن أو التنازل عن الإيجار، وتخضع العين للشرط الفاسخ الصريح دون حاجة لتنبيه أو إعذار في حال التأخر عن سداد الأجرة لمدة 10 أيام، مع التعهد بتوثيق العقد بالصيغة التنفيذية أمام الشهر العقاري.',
      },
    },
    {
      id: 'sale-apartment',
      name: 'عقد بيع شقة سكنية ابتدائي',
      category: 'القانون المدني المصري',
      icon: <Building className="w-5 h-5 text-emerald-400" />,
      defaultType: 'عقد بيع ابتدائي لوحدة سكنية مع حصة شائعة في الأرض والأجزاء المشتركة',
      description: 'يشمل بنود أيلولة الملكية، المعاينة النافية للجهالة، وخلو المبيع من الديون وحقوق الارتفاق.',
      sampleData: {
        contractType: 'عقد بيع ابتدائي لعين شقة سكنية مع حصة شائعة في الأرض والأجزاء المشتركة',
        firstParty: 'السيد / حسن السيد عبد الرحمن - مصري الجنسية - بطاقة رقم قومي (27803051401234) - مقيم في المعادي، القاهرة (طرف أول - بائع)',
        secondParty: 'السيد / طارق إبراهيم كمال - مصري الجنسية - بطاقة رقم قومي (28911041604321) - مقيم في مصر الجديدة، القاهرة (طرف ثانٍ - مشترٍ)',
        subject: 'بيع الشقة رقم (12) بالعمارة رقم (8) مشروع المستثمرين، التجمع الخامس، بمساحة 160 متراً مربعاً، كاملة التشطيب ومزودة بعداد كهرباء ومياه، بحصة تعادل 1/12 في أرض العقار والأجزاء المشتركة.',
        financials: 'إجمالي الثمن المتفق عليه مبلغ 2,800,000 جنيه مصري (فقط مليونان وثمانمائة ألف جنيه)، سُدد منها مبلغ 1,800,000 جنيه نقداً بمجلس العقد، والباقي ومقداره 1,000,000 جنيه يُسدد عند الاستلام الفعلي.',
        duration: 'سريان العقد فوري وبات من تاريخ التوقيع، والتسليم الفعلي في موعد أقصاه شهرين من تاريخه.',
        specialConditions: 'يضمن البائع خلو المبيع من كافة الديون والرهون والضرائب العقارية، ويلتزم بالحضور أمام الشهر العقاري أو المحكمة المختصة للتصديق على التوقيعات أو إتمام إجراءات التسجيل ونقل الملكية.',
      },
    },
    {
      id: 'employment-contract',
      name: 'عقد عمل فردي محدد المدة',
      category: 'قانون العمل رقم 12 لسنة 2003',
      icon: <Briefcase className="w-5 h-5 text-blue-400" />,
      defaultType: 'عقد عمل فردي محدد المدة طبقاً لأحكام قانون العمل المصري رقم 12 لسنة 2003',
      description: 'يحدد ساعات العمل، فترة الاختبار القانونية (3 أشهر)، التأمينات، وسرية المعلومات.',
      sampleData: {
        contractType: 'عقد عمل فردي محدد المدة خاضع لأحكام قانون العمل المصري رقم 12 لسنة 2003',
        firstParty: 'شركة النيل للحلول التقنية (ش.م.م) - ويمثلها قانوناً السيد / المدير العام - مقرها 22 شارع مصدق، الدقي، الجيزة (طرف أول - صاحب العمل)',
        secondParty: 'السيد / محمود خالد مصطفى - مصري الجنسية - بطاقة رقم قومي (29508012104567) - مقيم في الهرم، الجيزة (طرف ثانٍ - عامل / موظف)',
        subject: 'التعيين في وظيفة "محاسب مالي أول" للقيام بكافة المهام المحاسبية وإعداد القوائم المالية وإدخال القيود وفقاً لتعليمات الإدارة.',
        financials: 'راتب شهري شامل قدره 12,000 جنيه مصري (فقط اثنا عشر ألف جنيه)، يُستقطع منه التأمينات الاجتماعية وضريبة كسب العمل طبقاً للقانون المصري.',
        duration: 'مدة العقد سنة ميلادية تبدأ من 2026/10/01 حتى 2027/09/30، وتخضع لثلاثة أشهر فترة اختبار قانونية.',
        specialConditions: 'يلتزم الطرف الثاني بالحفاظ التام على أسرار الشركة والعملاء وعدم منافسة صاحب العمل، وساعات العمل 8 ساعات يومياً مع يومين راحة أسبوعية ورصيد إجازات سنوية طبقاً للمادة 47 من قانون العمل.',
      },
    },
    {
      id: 'commercial-partnership',
      name: 'عقد اتفاق وشراكة تجارية',
      category: 'قانون التجارة رقم 17 لسنة 1999',
      icon: <Users className="w-5 h-5 text-purple-400" />,
      defaultType: 'عقد اتفاق وتأسيس شراكة تجارية وتوزيع الحصص والأرباح',
      description: 'ينظم رأس مال الشراكة، نسب توزيع الأرباح والخسائر، صلاحيات الإدارة، والتخارج.',
      sampleData: {
        contractType: 'عقد شراكة تجارية واستثمار مشترك في مشروع مطعم ومقهى سياحي',
        firstParty: 'السيد / شريف عصام الدين - بطاقة رقم قومي (28402011502468) - مقيم في الشيخ زايد، الجيزة (الشريك الأول)',
        secondParty: 'السيد / كريم وليد حمدي - بطاقة رقم قومي (28706031801357) - مقيم في المهندسين، الجيزة (الشريك الثاني)',
        subject: 'الشراكة في تمويل وتجهيز وإدارة فرع لمطعم ومقهى كائن في مول ترافيلر، التجمع الخامس، القاهرة الجديدة.',
        financials: 'رأس مال المشروع المبدئي 1,000,000 جنيه مصري مناصفة بنسبة 50% لكل طرف، وتوزع الأرباح الصافية بنسبة 50% لكل شريك بعد خصم المصروفات التشغيلية والاستهلاك.',
        duration: 'مدة الاتفاقية 5 سنوات تبدأ من تاريخ توقيع العقد، وتجدد تلقائياً ما لم يخطر أحد الطرفين الآخر كتابياً برغبته في التخارج قبل 3 أشهر.',
        specialConditions: 'الإدارة الفنية والتنفيذية للطرف الأول، بينما يتولى الطرف الثاني الإشراف المالي والمشتريات، وتخضع أي منازعات لاختصاص المحكمة الاقتصادية بالقاهرة.',
      },
    },
    {
      id: 'renovation-contract',
      name: 'عقد مقاولة وتشطيبات داخلية',
      category: 'القانون المدني (عقد المقاولة)',
      icon: <Hammer className="w-5 h-5 text-amber-500" />,
      defaultType: 'عقد مقاولة وتوريد وتركيب أعمال تشطيبات ديكورية ومعمارية',
      description: 'يتضمن جدول الدفعات، مواصفات المقايسة، غرامات التأخير اليومية، والضمان العشري.',
      sampleData: {
        contractType: 'عقد مقاولة أعمال تشطيبات متكاملة وتوريد وتركيب لوحدة سكنية',
        firstParty: 'السيد / سامح فؤاد إبراهيم - بطاقة رقم قومي (28004051203456) - مقيم في النزهة، القاهرة (طرف أول - رب العمل)',
        secondParty: 'مؤسسة الأهرام للديكور والمقاولات - ويمثلها المهندس / عادل فاروق - مقرها الشروق، القاهرة (طرف ثانٍ - المقاول)',
        subject: 'تنفيذ أعمال التشطيبات المعمارية والكهربائية والصحية والدهانات والنجارة للشقة السكنية الكائنة بمدينة الشروق طبقاً لجدول المقايسة المرفق.',
        financials: 'إجمالي قيمة المقاولة مبلغ 450,000 جنيه مصري تُدفع على 4 دفعات مرحلية مرتبطة بنسب الإنجاز الفعلي، مع خصم 10% كدفعة ضمان لمدة 6 أشهر بعد الاستلام.',
        duration: 'مدة التنفيذ 90 يوماً تبدأ من تاريخ استلام الموقع وسداد الدفعة الأولى.',
        specialConditions: 'غرامة تأخير 500 جنيه عن كل يوم تأخير غير مبرر، والتزام المقاول بإصلاح أي عيوب أو شروخ تطرأ على الأعمال طوال فترة الضمان على نفقته الخاصة.',
      },
    },
  ];

  const handleApplyPreset = (preset: ContractTemplatePreset) => {
    setContractType(preset.sampleData.contractType);
    setFirstParty(preset.sampleData.firstParty);
    setSecondParty(preset.sampleData.secondParty);
    setSubject(preset.sampleData.subject);
    setFinancials(preset.sampleData.financials);
    setDuration(preset.sampleData.duration);
    setSpecialConditions(preset.sampleData.specialConditions);
    setActiveTab('guided');
    showToast(`تم تحميل نموذج "${preset.name}" بنجاح في استمارة الصياغة`);
  };

  const handleGenerateContract = async (modeOverride?: 'preset' | 'form' | 'freeform') => {
    if (loading) return;
    setLoading(true);
    setContractDraft(null);
    setIsEditingDraft(false);

    try {
      let bodyData: any = {};

      if (activeTab === 'freeform') {
        if (!freeformPrompt.trim()) {
          showToast('يرجى كتابة تفاصيل أو مسودة الاتفاق المطلوب صياغته');
          setLoading(false);
          return;
        }
        bodyData = {
          contractType: 'عقد اتفاق وتراضي وفقاً للقانون المصري',
          customNotes: freeformPrompt,
          subject: freeformPrompt.slice(0, 150),
        };
      } else {
        if (!subject.trim() && !contractType.trim()) {
          showToast('يرجى توضيح نوع العقد وموضوعه الأساسي');
          setLoading(false);
          return;
        }
        bodyData = {
          contractType,
          firstParty,
          secondParty,
          subject,
          financials,
          duration,
          specialConditions,
        };
      }

      const res = await fetch('/api/contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'تعذر صياغة العقد، يرجى المحاولة مرة أخرى');
      }

      setContractDraft(data.contractDraft);
      setEditableDraft(data.contractDraft);
      showToast('تمت صياغة مسودة العقد بنجاح وفق المعايير القانونية المصرية');
    } catch (err: any) {
      setContractDraft(`حدث خطأ أثناء صياغة العقد: ${err.message}`);
      setEditableDraft(`حدث خطأ أثناء صياغة العقد: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = isEditingDraft ? editableDraft : contractDraft;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('تم نسخ مسودة العقد كاملة إلى الحافظة');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    const textToSave = isEditingDraft ? editableDraft : contractDraft;
    if (!textToSave) return;
    const title = `مسودة: ${contractType.slice(0, 40)}`;
    const query = subject || freeformPrompt.slice(0, 80) || contractType;
    onSaveConsultation(title, query, textToSave, 'contract');
    setSaved(true);
    showToast('تم حفظ مسودة العقد بنجاح في السجل المحفوظ');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDownloadTxt = () => {
    const textToDownload = isEditingDraft ? editableDraft : contractDraft;
    if (!textToDownload) return;
    const filename = `مسودة_عقد_${contractType.replace(/[\/\\?%*:|"<>]/g, '_').slice(0, 25)}.txt`;
    downloadTxtFile(filename, textToDownload);
    showToast('تم تنزيل مسودة العقد بصيغة ملف نصي منسق (TXT)');
  };

  const handlePrintPdf = () => {
    const textToPrint = isEditingDraft ? editableDraft : contractDraft;
    if (!textToPrint) return;

    // Create a mock SavedItem to leverage the beautiful printable layout
    const dummyItem: SavedItem = {
      id: Date.now().toString(),
      type: 'contract',
      title: contractType,
      query: `الطرف الأول: ${firstParty || 'غير محدد'}\nالطرف الثاني: ${secondParty || 'غير محدد'}\nالموضوع: ${subject || freeformPrompt}`,
      result: textToPrint,
      date: new Date().toLocaleDateString('ar-EG'),
    };

    triggerPrintDocument([dummyItem], `مسودة عقد قانوني - ${contractType}`);
    showToast('جاري فتح نافذة الطباعة والحفظ كـ PDF للمسودة الرسمية');
  };

  const handleShare = async () => {
    const textToShare = isEditingDraft ? editableDraft : contractDraft;
    if (!textToShare) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: contractType,
          text: `المحامي الذكي | مسودة عقد قانوني وفقاً للقانون المصري\n\n${textToShare}`,
        });
        showToast('تمت مشاركة مسودة العقد بنجاح');
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(textToShare);
    showToast('تم نسخ مسودة العقد للحافظة لمشاركتها');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0A0A] text-gray-200">
      {/* Header Bar */}
      <header className="h-20 px-6 sm:px-8 flex items-center justify-between border-b border-[#222222] bg-[#0F0F0F] shrink-0">
        <div className="flex items-center gap-3 sm:gap-4 text-sm">
          <div className="w-10 h-10 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
            <FileSignature className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">مساعد صياغة العقود</h1>
              <span className="px-2.5 py-0.5 bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 rounded-full text-[11px] font-semibold hidden sm:inline">
                النموذج المصري
              </span>
            </div>
            <p className="text-xs text-gray-400">
              إعداد مسودات عقود قانونية محكمة وفقاً للقانون المدني والتشريعات المصرية
            </p>
          </div>
        </div>

        {/* Tab Switcher in Header */}
        <div className="flex items-center gap-1.5 bg-[#181818] p-1 rounded-xl border border-[#2A2A2A]">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-[#C5A059] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            نماذج جاهزة
          </button>
          <button
            onClick={() => setActiveTab('guided')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'guided'
                ? 'bg-[#C5A059] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            استمارة مخصصة
          </button>
          <button
            onClick={() => setActiveTab('freeform')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'freeform'
                ? 'bg-[#C5A059] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            صياغة حرة
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-[#1A1A1A] border-b border-[#C5A059]/50 px-6 py-2.5 flex items-center justify-between text-xs text-[#C5A059] shrink-0">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </span>
          <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-5xl w-full mx-auto">
        {/* TAB 1: PRESETS */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <div className="bg-[#161616] p-5 rounded-2xl border border-[#2B2B2B]">
              <div className="flex items-center gap-2 text-[#C5A059] font-bold text-sm mb-1">
                <Sparkles className="w-4 h-4" />
                <span>نماذج العقود المصرية الأكثر استخداماً</span>
              </div>
              <p className="text-xs text-gray-400">
                اختر نموذجاً مصرياً معتمداً للبدء فوراً وتخصيص البيانات أو توليد المسودة مباشرة:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {presets.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#141414] hover:bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#C5A059]/50 rounded-2xl p-5 transition-all flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#222222] border border-[#333333] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                          {p.icon}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-[#C5A059] transition">
                            {p.name}
                          </h3>
                          <span className="text-[11px] text-gray-400">{p.category}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed mb-4">{p.description}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-[#222222]">
                    <button
                      onClick={() => handleApplyPreset(p)}
                      className="flex-1 py-2 px-3 bg-[#202020] hover:bg-[#282828] text-gray-200 hover:text-white text-xs font-semibold rounded-xl border border-[#333333] hover:border-[#C5A059]/50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>تعديل وتعبئة البيانات</span>
                    </button>
                    <button
                      onClick={() => {
                        handleApplyPreset(p);
                        setTimeout(() => handleGenerateContract('preset'), 150);
                      }}
                      className="py-2 px-3.5 bg-[#C5A059] hover:bg-[#D4B26F] text-black text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-md"
                      title="صياغة المسودة فوراً بالنموذج القياسي"
                    >
                      <span>صياغة فورية</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: GUIDED FORM */}
        {activeTab === 'guided' && (
          <div className="bg-[#141414] rounded-2xl p-6 border border-[#2B2B2B] shadow-xl space-y-5">
            <div className="border-b border-[#242424] pb-3">
              <h2 className="text-base font-bold text-[#C5A059] flex items-center gap-2">
                <FileSignature className="w-4 h-4" />
                <span>استمارة صياغة وتخصيص العقد القانوني</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                أدخل بيانات الأطراف والبنود الرئيسية، وسيتولى المساعد صياغة ديباجة العقد والبنود
                والشروط الجزائية وفق القانون المصري.
              </p>
            </div>

            {/* Contract Type */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                نوع وطبيعة العقد <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                placeholder="مثال: عقد إيجار شقة سكنية، عقد بيع سيارة، عقد اتفاق مقاولة وتوريدات..."
                className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#C5A059] transition"
              />
            </div>

            {/* Parties 2 Cols */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  بيانات الطرف الأول (بائع / مؤجر / صاحب عمل / شريك)
                </label>
                <textarea
                  rows={3}
                  value={firstParty}
                  onChange={(e) => setFirstParty(e.target.value)}
                  placeholder="الاسم، الجنسية، الرقم القومي (14 رقم)، محل الإقامة والموطن المختار، الصفة..."
                  className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C5A059] transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  بيانات الطرف الثاني (مشترٍ / مستأجر / موظف / مقاول)
                </label>
                <textarea
                  rows={3}
                  value={secondParty}
                  onChange={(e) => setSecondParty(e.target.value)}
                  placeholder="الاسم، الجنسية، الرقم القومي (14 رقم)، محل الإقامة والموطن المختار، الصفة..."
                  className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C5A059] transition resize-none"
                />
              </div>
            </div>

            {/* Subject / Object */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                موضوع ومحل العقد بالتفصيل (نافياً للجهالة) <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={2}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="وصف تفصيلي للعين، المساحة، الحدود، رقم الشقة أو العقار، أو نوع الوظيفة، أو المنتجات والخدمات المطلوبة..."
                className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#C5A059] transition resize-none"
              />
            </div>

            {/* Financials & Duration 2 Cols */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  المقابل المالي / الثمن / الأجرة وطريقة السداد
                </label>
                <input
                  type="text"
                  value={financials}
                  onChange={(e) => setFinancials(e.target.value)}
                  placeholder="مثال: 5,000 ج.م شهرياً مع تأمين شهرين / أو 1,200,000 ج.م تُدفع نقداً..."
                  className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  مدة العقد وتاريخ البدء والتجديد
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="مثال: سنتان تبدأ من 2026/10/01 ولا تجدد إلا باتفاق كتابي..."
                  className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059] transition"
                />
              </div>
            </div>

            {/* Special Conditions */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                شروط وبنود إضافية مخصصة (اختياري)
              </label>
              <textarea
                rows={2}
                value={specialConditions}
                onChange={(e) => setSpecialConditions(e.target.value)}
                placeholder="مثال: شرط جزائي بمبلغ 50,000 ج.م، التنازل عن الإيجار، وضع الصيغة التنفيذية أمام الشهر العقاري، شروط الفسخ الصريح..."
                className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C5A059] transition resize-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-[#242424] flex items-center justify-end">
              <button
                onClick={() => handleGenerateContract('form')}
                disabled={loading || !subject.trim()}
                className="w-full sm:w-auto px-8 py-3 bg-[#C5A059] hover:bg-[#D4B26F] disabled:opacity-50 text-black font-bold text-xs sm:text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري صياغة العقد بالنموذج القانوني المصري...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>توليد مسودة العقد الرسمية</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: FREEFORM AI PROMPT */}
        {activeTab === 'freeform' && (
          <div className="bg-[#141414] rounded-2xl p-6 border border-[#2B2B2B] shadow-xl space-y-4">
            <div className="border-b border-[#242424] pb-3">
              <h2 className="text-base font-bold text-[#C5A059] flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>الصياغة الحرة الذكية</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                اكتب أو الصق الاتفاق المبدئي بأسلوبك البسيط أو العامي، وسيقوم المحامي الذكي بإعادة
                صياغته إلى مسودة عقد قانوني رسمي كامل البنود والديباجة.
              </p>
            </div>

            <textarea
              rows={6}
              value={freeformPrompt}
              onChange={(e) => setFreeformPrompt(e.target.value)}
              placeholder="مثال: اتفقت أنا وأحمد إبراهيم على إني أأجر له المحل بتاعي في العجمي بالإسكندرية لمدة سنتين بأجرة 3000 جنيه شهرياً، ويدفع تأمين شهرين، ولا يحق له تأجيره لغيره، وإذا تأخر أسبوع عن دفع الإيجار يُعتبر العقد مفسوخاً فوراً..."
              className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl p-4 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A059] transition"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#C5A059]" />
                <span>سيتم إلحاق الديباجة وبنود الاختصاص القضائي والشهر العقاري تلقائياً.</span>
              </span>

              <button
                onClick={() => handleGenerateContract('freeform')}
                disabled={loading || !freeformPrompt.trim()}
                className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#D4B26F] disabled:opacity-50 text-black font-bold text-xs sm:text-sm rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري التحويل إلى صياغة رسمية...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>تحويل الاتفاق إلى عقد رسمي</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* GENERATED CONTRACT RESULT VIEWER & LIVE EDITOR */}
        {contractDraft && (
          <div className="bg-[#141414] rounded-2xl border border-[#C5A059]/40 shadow-2xl p-5 sm:p-7 space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A2A] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
                  <FileSignature className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>مسودة العقد القانوني النهائي</span>
                    <span className="bg-emerald-950/60 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-800">
                      جاهز للاستخدام والتوقيع
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    يمكنك تعديل بنود المسودة مباشرة أو طباعتها كـ PDF أو حفظها في سجلك.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsEditingDraft(!isEditingDraft)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                    isEditingDraft
                      ? 'bg-[#C5A059] text-black border-[#C5A059]'
                      : 'bg-[#1E1E1E] text-gray-300 hover:text-white border-[#333333]'
                  }`}
                  title="التبديل بين وضع التعديل المباشر ووضع المعاينة"
                >
                  {isEditingDraft ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                  <span>{isEditingDraft ? 'معاينة المسودة' : 'تعديل النص'}</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-[#1E1E1E] hover:bg-[#282828] text-gray-300 hover:text-white border border-[#333333] rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ العقد'}</span>
                </button>

                <button
                  onClick={handleDownloadTxt}
                  className="px-3 py-1.5 bg-[#1E1E1E] hover:bg-[#282828] text-gray-300 hover:text-white border border-[#333333] rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="تنزيل كملف نصي منسق"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>تنزيل (TXT)</span>
                </button>

                <button
                  onClick={handlePrintPdf}
                  className="px-3 py-1.5 bg-[#1E1E1E] hover:bg-[#282828] text-gray-300 hover:text-white border border-[#333333] rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="طباعة رسمية أو حفظ كـ PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>طباعة / PDF</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-1.5 bg-[#1E1E1E] hover:bg-[#282828] text-gray-300 hover:text-white border border-[#333333] rounded-lg transition cursor-pointer"
                  title="مشاركة المسودة"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSave}
                  className="px-3.5 py-1.5 bg-[#C5A059] hover:bg-[#D4B26F] text-black text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{saved ? 'تم الحفظ' : 'حفظ في السجل'}</span>
                </button>
              </div>
            </div>

            {/* Document Body: View vs Edit */}
            {isEditingDraft ? (
              <div className="space-y-2">
                <div className="text-[11px] text-[#C5A059] font-medium flex items-center gap-1">
                  <Edit3 className="w-3 h-3" />
                  <span>وضع التحرير المباشر: يمكنك تعديل الأسماء والأرقام القومية والبنود هنا.</span>
                </div>
                <textarea
                  rows={20}
                  value={editableDraft}
                  onChange={(e) => setEditableDraft(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl p-4 text-xs sm:text-sm text-gray-200 font-mono leading-relaxed focus:outline-none focus:border-[#C5A059] transition"
                />
              </div>
            ) : (
              <div className="bg-[#0C0C0C] border border-[#262626] rounded-xl p-5 sm:p-6 text-xs sm:text-sm text-gray-200 leading-loose whitespace-pre-wrap font-normal select-text">
                {editableDraft || contractDraft}
              </div>
            )}

            {/* Egyptian Legal Guidance Box */}
            <div className="bg-[#17140F] border border-[#C5A059]/30 rounded-xl p-4 text-xs text-gray-300 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#C5A059] block mb-1">
                  نصائح وتوجيهات المحامي الذكي لتأمين العقود في مصر:
                </span>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>
                    يُفضل دائماً التوجه لمكتب الشهر العقاري التابع للعين لإثبات تاريخ العقد، أو تذييله
                    بالصيغة التنفيذية طبقاً للقانون 137 لسنة 2006 ليصبح سنداً تنفيذياً مباشراً دون
                    الحاجة لرفع دعوى قضائية.
                  </li>
                  <li>
                    تأكد من إرفاق صورة واضحة من بطاقة الرقم القومي سارية المفعول لكافة أطراف التعاقد
                    والشهود.
                  </li>
                  <li>
                    في عقود البيع، تحقق من أصل سند ملكية البائع وكشف الضرائب العقارية قبل سداد كامل
                    الثمن.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
