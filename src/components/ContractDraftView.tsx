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
  Search,
  X,
  Car,
  Layers,
  Trash2,
  Handshake,
  FileCheck2,
  Store,
  ShieldCheck,
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

export interface ContractTemplatePreset {
  id: string;
  name: string;
  category: 'rent' | 'sale' | 'employment' | 'business' | 'contracting' | 'settlement';
  categoryLabel: string;
  iconType: 'home' | 'building' | 'briefcase' | 'users' | 'hammer' | 'car' | 'store' | 'handshake' | 'shield';
  defaultType: string;
  description: string;
  keyClauses: string[];
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

  // Active loaded template tracker
  const [loadedTemplateName, setLoadedTemplateName] = useState<string | null>(null);

  // Template Modal State & Filters
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [previewingTemplate, setPreviewingTemplate] = useState<ContractTemplatePreset | null>(null);

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
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Comprehensive Egyptian Legal Contract Templates Library (12 Templates)
  const presets: ContractTemplatePreset[] = [
    {
      id: 'rent-residential',
      name: 'عقد إيجار شقة سكنية',
      category: 'rent',
      categoryLabel: 'عقود الإيجار (قانون 4 لسنة 1996)',
      iconType: 'home',
      defaultType: 'عقد إيجار شقة سكنية خاضع لأحكام القانون رقم 4 لسنة 1996 والمعدل بالقانون 137 لسنة 2006',
      description: 'النموذج القياسي لإيجار الوحدات السكنية في مصر، متضمناً شرط الصيغة التنفيذية أمام الشهر العقاري والتأمين والشرط الفاسخ الصريح.',
      keyClauses: ['شرط الصيغة التنفيذية بالشهر العقاري', 'الشرط الفاسخ الصريح (مادة 158 مدني)', 'حظر التأجير من الباطن', 'تأمين تلفيات مسترد'],
      sampleData: {
        contractType: 'عقد إيجار شقة سكنية وفقاً لأحكام القانون رقم 4 لسنة 1996 المعدل بالقانون 137 لسنة 2006',
        firstParty: 'السيد / أحمد محمود إبراهيم - مصري الجنسية - بالرقم القومي (28501011234567) - المقيم في 14 شارع الطيران، مدينة نصر، القاهرة (طرف أول - مؤجر)',
        secondParty: 'السيد / محمد علي حسن - مصري الجنسية - بالرقم القومي (29205021234567) - المقيم في 5 شارع مصدق، الدقي، الجيزة (طرف ثانٍ - مستأجر)',
        subject: 'تأجير الشقة السكنية رقم (4) بالدور الثالث بالعقار رقم (15) شارع الطيران، مدينة نصر، القاهرة، المكونة من 3 غرف وصالة وحمام ومطبخ والمزودة بعداد كهرباء كودي وعداد مياه، بغرض السكن العائلي فقط.',
        financials: 'القيمة الإيجارية الشهرية مبلغ وقدره 4,500 جنيه مصري تُدفع مقدماً في اليوم الأول من كل شهر ميلادي، بالإضافة إلى سداد مبلغ 9,000 جنيه مصري كتأمين نقدي يُرد عند انتهاء العقد وتسليم العين بالحالة التي استُلمت بها.',
        duration: 'مدة الإيجار ثلاث سنوات تبدأ من 2026/10/01 وتنتهي حتماً في 2029/09/30، وتعتبر منتهية بانتهاء مدتها دون حاجة لتنبيه أو إنذار بالإخلاء ولا تجدد إلا بعقد جديد.',
        specialConditions: 'يحظر على المستأجر التنازل عن الإيجار أو التأجير من الباطن، ويخضع العقد للشرط الفاسخ الصريح إذا تأخر المستأجر عن سداد الأجرة لمدة 10 أيام، مع اتفاق الطرفين على إيداع العقد والتصديق عليه بالصيغة التنفيذية بالشهر العقاري.',
      },
    },
    {
      id: 'rent-commercial',
      name: 'عقد إيجار محل تجاري / إداري',
      category: 'rent',
      categoryLabel: 'عقود الإيجار (قانون 4 لسنة 1996)',
      iconType: 'store',
      defaultType: 'عقد إيجار عين ومحل تجاري خاضع لأحكام القانون 4 لسنة 1996',
      description: 'مخصص للمحلات والوحدات الإدارية، يشمل شروط النشاط التجاري، تركيب العدادات واللافتات، والتأمين الإيجاري التجاري.',
      keyClauses: ['تحديد النشاط التجاري المصرح به', 'الصيانة والأجهزة والكهرباء التجارية', 'الصيغة التنفيذية بالشهر العقاري', 'شروط إنهاء النشاط والإخلاء'],
      sampleData: {
        contractType: 'عقد إيجار محل تجاري ومساحة إدارية خاضع للقانون رقم 4 لسنة 1996',
        firstParty: 'السيد / فاروق عبد الحميد شلبي - مصري الجنسية - بطاقة رقم قومي (27608041503456) - مقيم في حي النزهة، مصر الجديدة (طرف أول - مؤجر)',
        secondParty: 'السيد / حسام الدين توفيق - مصري الجنسية - بطاقة رقم قومي (28804021204567) - مقيم في مدينة العبور، القليوبية (طرف ثانٍ - مستأجر)',
        subject: 'تأجير المحل التجاري الكائن بالعقار رقم (28) شارع الحجاز، مصر الجديدة، القاهرة، بالدور الأرضي بمساحة 65 متراً مربعاً وله واجهة زجاجية، لاستخدامه في نشاط "معرض وبيع أجهزة ومستلزمات إلكترونية" فقط دون سواه.',
        financials: 'القيمة الإيجارية الشهرية مبلغ 12,000 جنيه مصري بزيادة سنوية مركبة قدرها 10% اعتباراً من السنة الثانية، ومبلغ 24,000 جنيه مصري كتأمين استردادي.',
        duration: 'مدة الإيجار 5 سنوات تبدأ من 2026/10/01 وتنتهي في 2031/09/30 ولا تجدد تلقائياً.',
        specialConditions: 'يلتزم المستأجر باستخراج التراخيص التجارية وسداد فواتير الكهرباء والمياه التجارية، ولا يجوز له تغيير النشاط التجاري أو وضع لافتات تخالف اشتراطات الحي.',
      },
    },
    {
      id: 'sale-apartment',
      name: 'عقد بيع شقة سكنية ابتدائي',
      category: 'sale',
      categoryLabel: 'عقود البيع والملكية (القانون المدني)',
      iconType: 'building',
      defaultType: 'عقد بيع ابتدائي لوحدة سكنية مع حصة شائعة في أرض العقار والأجزاء المشتركة',
      description: 'عقد بيع عقاري متكامل البنود، يشمل أيلولة الملكية، المعاينة النافية للجهالة، خلو العين من الديون والرهون، والتعهد بالحضور للشهر العقاري.',
      keyClauses: ['أيلولة ملكية وسند البائع', 'المعاينة النافية للجهالة', 'حصة الأرض والأجزاء المشتركة', 'التزام الحضور للشهر العقاري ودعوى صحة التوقيع'],
      sampleData: {
        contractType: 'عقد بيع ابتدائي لشقة سكنية مع حصة شائعة في الأرض والأجزاء المشتركة',
        firstParty: 'السيد / حسن السيد عبد الرحمن - مصري الجنسية - بطاقة رقم قومي (27803051401234) - مقيم في المعادي، القاهرة (طرف أول - بائع)',
        secondParty: 'السيد / طارق إبراهيم كمال - مصري الجنسية - بطاقة رقم قومي (28911041604321) - مقيم في التجمع الخامس، القاهرة (طرف ثانٍ - مشترٍ)',
        subject: 'بيع الشقة رقم (12) بالدور الرابع بالعمارة رقم (8) مشروع المستثمرين، التجمع الخامس، القاهرة، بمساحة 160 متراً مربعاً، كاملة التشطيب ومزودة بعداد كهرباء ومياه، ولها حصة شائعة تعادل 1/12 في أرض العقار والأجزاء المشتركة.',
        financials: 'إجمالي الثمن المتفق عليه مبلغ 2,800,000 جنيه مصري، سُدد منها مبلغ 1,800,000 جنيه نقداً بمجلس العقد ويعد توقيع البائع إيصال استلام، والمتبقي ومقداره 1,000,000 جنيه يُسدد عند تسليم الشقة.',
        duration: 'سريان العقد بات ونهائي من تاريخ توقيعه، والتسليم الفعلي للمشتري في موعد غايته 2026/12/31.',
        specialConditions: 'يضمن البائع خلو المبيع من كافة الديون والرهون العقارية وحقوق الامتياز، ويلتزم بالحضور أمام مأمورية الشهر العقاري المختصة للتوقيع على العقد النهائي أو الحضور أمام المحكمة في دعوى صحة ونفاذ أو صحة التوقيع.',
      },
    },
    {
      id: 'sale-car',
      name: 'عقد بيع سيارة ملاكي ابتدائي',
      category: 'sale',
      categoryLabel: 'عقود البيع والملكية (القانون المدني)',
      iconType: 'car',
      defaultType: 'عقد بيع سيارة ملاكي ابتدائي مع التزام التنازل ونقل القيد بوحدة المرور',
      description: 'مخصص لبيع ونقل ملكية المركبات، يثبت أرقام الشاسيه والموتور والموديل والمخالفات المرورية حتى تاريخ الاستلام.',
      keyClauses: ['بيانات الشاسيه والموتور والموديل', 'براءة ذمة المرور والمخالفات السابقة', 'المعاينة وتجربة السيارة الفنية', 'التوكيل ونقل القيد بالمرور'],
      sampleData: {
        contractType: 'عقد بيع سيارة ملاكي ابتدائي مع التزام نقل القيد والترخيص',
        firstParty: 'السيد / شادي كمال الدين الألفي - مصري الجنسية - بطاقة رقم قومي (28307061402345) - مقيم في مدينة نصر، القاهرة (طرف أول - بائع)',
        secondParty: 'السيد / وائل محمود عبد العال - مصري الجنسية - بطاقة رقم قومي (29103091203456) - مقيم في حي الهرم، الجيزة (طرف ثانٍ - مشترٍ)',
        subject: 'بيع السيارة الملاكي ماركة كيا سبورتاج، موديل 2022، لون أسود، شاسيه رقم (KNAJC812345678)، موتور رقم (G4FD987654)، لوحات معدنية رقم (ق أ ب 1234) مرور مدينة نصر.',
        financials: 'الثمن الإجمالي المتفق عليه مبلغ 950,000 جنيه مصري سُدد بالكامل نقداً وعداً بمجلس العقد وأبرأ البائع ذمة المشتري إبراءً تاماً وشاملاً.',
        duration: 'انتقال الحيازة والمسؤولية المدنية والجنائية للمشتري فور استلام السيارة بمجلس العقد بتاريخه.',
        specialConditions: 'يتحمل البائع كافة المخالفات المرورية والرسوم والضرائب حتى تاريخ اليوم، ويلتزم بالحضور غداً أمام الشهر العقاري لعمل توكيل بيع لنفسه وللغير ونقل قيد بالمرور.',
      },
    },
    {
      id: 'sale-land',
      name: 'عقد بيع قطعة أرض فضاء / زراعية',
      category: 'sale',
      categoryLabel: 'عقود البيع والملكية (القانون المدني)',
      iconType: 'building',
      defaultType: 'عقد بيع ابتدائي لقطعة أرض فضاء محددة بالحدود الأربعة والمساحة',
      description: 'يثبت مساحة الأرض بالأمتار، الحدود الأربعة (البحرية، القبلية، الشرقية، الغربية)، سند الملكية، وبند التسليم المساحي.',
      keyClauses: ['الحدود الأربعة للأرض والمعالم', 'سند الملكية السابق والتكليف', 'شهادة قياس ومطابقة المساحة', 'خلو الأرض من نزاعات الأوقاف والآثار'],
      sampleData: {
        contractType: 'عقد بيع ابتدائي لقطعة أرض فضاء مخصصة للبناء',
        firstParty: 'السيد / رفعت صابر الدسوقي - مصري الجنسية - بطاقة رقم قومي (27005081601234) - مقيم في الزقازيق، الشرقية (طرف أول - بائع)',
        secondParty: 'السيد / ممدوح زكريا النجار - مصري الجنسية - بطاقة رقم قومي (28204011802345) - مقيم في مدينة الشروق، القاهرة (طرف ثانٍ - مشترٍ)',
        subject: 'بيع قطعة الأرض الفضاء رقم (45) حوض داير الناحية، بمساحة 400 متراً مربعاً، بحدودها الأربعة: الحد البحري شارع بعرض 12م، الحد القبلي قطعة رقم 46، الحد الشرقي جار ملك فلان، والحد الغربي ممر مشاة.',
        financials: 'الثمن الإجمالي مبلغ 1,600,000 جنيه مصري، سُدد منها مبلغ 1,000,000 جنيه عند توقيع العقد، والباقي 600,000 جنيه بشيك مصرفي يُستحق عند التسليم المساحي الفعلي.',
        duration: 'يسري العقد فور التوقيع، وتتم المطابقة المساحية والتسليم على الطبيعة خلال 15 يوماً.',
        specialConditions: 'يقر البائع أن الأرض ليست ضمن أراضي أملاك الدولة أو الأوقاف أو حرم الآثار، ويتحمل أي منازعات تظهر قبل تاريخ هذا العقد.',
      },
    },
    {
      id: 'employment-contract',
      name: 'عقد عمل فردي محدد المدة',
      category: 'employment',
      categoryLabel: 'عقود العمل (قانون العمل 12 لسنة 2003)',
      iconType: 'briefcase',
      defaultType: 'عقد عمل فردي محدد المدة خاضع لأحكام قانون العمل المصري رقم 12 لسنة 2003',
      description: 'العقد المعتمد للعاملين بالقطاع الخاص في مصر، يشمل فترة الاختبار القانونية (3 أشهر)، الراتب الشامل، التأمينات، وساعات العمل.',
      keyClauses: ['فترة الاختبار القانونية (3 أشهر حد أقصى)', 'التأمينات الاجتماعية والضرائب', 'سرية المعلومات وعدم المنافسة', 'رصيد الإجازات السنوية ومكافأة نهاية الخدمة'],
      sampleData: {
        contractType: 'عقد عمل فردي محدد المدة خاضع لقانون العمل المصري رقم 12 لسنة 2003',
        firstParty: 'شركة النيل للحلول التقنية والبرمجيات (ش.م.م) - يمثلها قانوناً المدير العام - مقرها 22 شارع مصدق، الدقي، الجيزة (طرف أول - صاحب العمل)',
        secondParty: 'السيد / محمود خالد مصطفى - مصري الجنسية - بطاقة رقم قومي (29508012104567) - مقيم في فيصل، الجيزة (طرف ثانٍ - موظف)',
        subject: 'التعيين والعمل بوظيفة "محاسب مالي أول" للقيام بكافة المهام المحاسبية وإعداد القوائم المالية والتقارير الضريبية وتطبيق معايير المحاسبة المصرية.',
        financials: 'راتب شهري إجمالي قدره 14,000 جنيه مصري، يُستقطع منه حصة العامل في التأمينات الاجتماعية وضريبة كسب العمل طبقاً للقوانين المصرية.',
        duration: 'مدة العقد سنة ميلادية تبدأ من 2026/10/01 حتى 2027/09/30، وتخضع للثلاثة أشهر الأولى كفترة اختبار قانونية طبقاً للمادة 32 من قانون العمل.',
        specialConditions: 'ساعات العمل 8 ساعات يومياً مع يومين راحة أسبوعية، مع التزام العامل بالسرية التامة لبيانات عملاء الشركة وعدم العمل لدى أي منافس خلال مدة العقد ولمدة سنة تالية.',
      },
    },
    {
      id: 'employment-nda',
      name: 'اتفاقية سرية معلومات وعدم إفصاح (NDA)',
      category: 'employment',
      categoryLabel: 'عقود العمل والشركات',
      iconType: 'shield',
      defaultType: 'اتفاقية التزام بسرية المعلومات وعدم المنافسة وعدم الإفصاح',
      description: 'لحماية الأسرار التجارية، الشفرات المصدرية، قوائم العملاء، والتصاميم، مع شرط جزائي محكم بالتعويض المادي.',
      keyClauses: ['تعريف المعلومات السرية المحمية', 'التزام الحظر الشامل للإفصاح', 'شرط جزائي وتعويض مدني فوري', 'استمرار سريان الالتزام بعد إنهاء التعاقد'],
      sampleData: {
        contractType: 'اتفاقية سرية معلومات وعدم إفصاح وعدم منافسة (Non-Disclosure Agreement)',
        firstParty: 'شركة تكنولوجي سمارت مصر للحلول الرقمية - مقرها القرية الذكية، الجيزة (طرف أول - المفصح)',
        secondParty: 'السيد / حسام مدحت سليمان - مهندس برمجيات - بطاقة رقم قومي (29302041501234) - مقيم في مدينة نصر، القاهرة (طرف ثانٍ - المتعهد بالسرية)',
        subject: 'الالتزام التام والبات بالمحافظة على سرية الشفرات المصدرية، قواعد البيانات، استراتيجيات التسعير، وبيانات العملاء التي يطلع عليها الطرف الثاني بمناسبة عمله أو تعاونه.',
        financials: 'شرط جزائي اتفاقي غير خاضع لرقابة القضاء بمبلغ 250,000 جنيه مصري في حال ثبوت أي تسريب أو إفصاح، مع حق المفصح في المطالبة بالتعويض الكامل عن أي أضرار فعلية.',
        duration: 'تسري الاتفاقية طوال فترة التعامل وتستمر ملزمة لمدة 3 سنوات ميلادية كاملة تبدأ من تاريخ إنهاء أو انقضاء العلاقة بين الطرفين.',
        specialConditions: 'تعتبر جميع المخرجات والمصنفات الرقمية ملكاً حصرياً للطرف الأول دون أدنى حق ملكية فكرية للطرف الثاني، وتختص محكمة جنوب القاهرة الابتدائية بنظر أي نزاع.',
      },
    },
    {
      id: 'commercial-partnership',
      name: 'عقد اتفاق وشراكة تجارية',
      category: 'business',
      categoryLabel: 'عقود الشركات والتجارة (قانون التجارة 17 لسنة 1999)',
      iconType: 'users',
      defaultType: 'عقد اتفاق وشراكة استثمارية وتوزيع الحصص والأرباح',
      description: 'ينظم الشراكة في مشروع تجاري أو خدمي، تحديد رأس المال المدفوع، نسب الأرباح والخسائر، صلاحيات الإدارة والتوقيع البنكي، والتخارج.',
      keyClauses: ['تحديد رأس مال المشروع وحصص كل شريك', 'نسب توزيع الأرباح الصافية وتحمل الخسائر', 'صلاحيات الإدارة وحق التوقيع البنكي', 'آلية تخارج الشريك وتصفية الحسابات'],
      sampleData: {
        contractType: 'عقد شراكة تجارية واستثمار مشترك في مشروع سلسلة مطاعم وكافيهات',
        firstParty: 'السيد / شريف عصام الدين - بطاقة رقم قومي (28402011502468) - مقيم في الشيخ زايد، الجيزة (الشريك الأول)',
        secondParty: 'السيد / كريم وليد حمدي - بطاقة رقم قومي (28706031801357) - مقيم في المهندسين، الجيزة (الشريك الثاني)',
        subject: 'الشراكة بنسب متساوية في تمويل وتجهيز وإدارة فرع لمطعم ومقهى كائن في مول ميركاتو، التجمع الخامس، القاهرة الجديدة، وتملّك كافة أصوله وسجله التجاري مناصفة.',
        financials: 'رأس مال المشروع المبدئي 1,200,000 جنيه مصري سدده الطرفان مناصفة (600,000 جنيه لكل شريك)، وتوزع الأرباح الصافية بنسبة 50% لكل شريك ربع سنوياً بعد استقطاع الاحتياطي.',
        duration: 'مدة الشراكة 5 سنوات تبدأ من تاريخ توقيع العقد، وتجدد تلقائياً ما لم يخطر أحد الطرفين الآخر برغبته في التخارج قبل انقضاء السنة المالية بـ 3 أشهر.',
        specialConditions: 'الإدارة الفنية والتشغيلية للشريك الأول، والإشراف المالي والحسابات للشريك الثاني، ولا يجوز الاقتراض أو رهن أصول الشركة إلا بتوقيع الشريكين معاً أمام البنوك.',
      },
    },
    {
      id: 'services-contract',
      name: 'عقد تقديم خدمات استشارية / مهنية',
      category: 'business',
      categoryLabel: 'عقود الشركات والتجارة',
      iconType: 'briefcase',
      defaultType: 'عقد اتفاق وتقديم خدمات استشارية ودعم فني ومهني',
      description: 'مناسب لشركات الدعاية، مكاتب المحاسبة والاستشارات، والحلول البرمجية، متضمناً جدول تسليم المخرجات والأتعاب.',
      keyClauses: ['نطاق الأعمال ومخرجات التسليم (Deliverables)', 'جدول دفعات الأتعاب المالية والفواتير', 'شروط التعديلات ونطاق الخدمة الإضافي', 'حقوق الملكية الفكرية للمخرجات'],
      sampleData: {
        contractType: 'عقد تقديم خدمات تسويق رقمي وإدارة حملات إعلانية وتطوير هوية',
        firstParty: 'شركة سمارت ريتش للحلول الإعلانية - ويمثلها المدير التنفيذي - مقرها المعادي، القاهرة (طرف أول - مقدم الخدمة)',
        secondParty: 'شركة الأندلس للاستثمار العقاري - ويمثلها رئيس مجلس الإدارة - مقرها التجمع الخامس، القاهرة (طرف ثانٍ - العميل)',
        subject: 'تقديم خدمات التسويق الإلكتروني الشامل وإدارة منصات التواصل الاجتماعي، وإنتاج 20 مادة مرئية شهرياً، وإدارة ميزانية الإعلانات الممولة للعميل.',
        financials: 'أتعاب شهرية ثابتة قدرها 25,000 جنيه مصري تُدفع بموجب فاتورة ضريبية في بداية كل شهر، مع تحمل العميل لميزانية الإعلانات المباشرة للمنصات.',
        duration: 'مدة العقد ستة أشهر ميلادية تبدأ من 2026/10/01 حتى 2027/03/31 وتجدد بموافقة الطرفين.',
        specialConditions: 'يلتزم مقدم الخدمة بتقديم تقرير تحليلي شهري بنتائج الحملات، وتؤول كافة التصاميم والمواد المنفذة لصالح العميل فور سداد أتعابها.',
      },
    },
    {
      id: 'supply-contract',
      name: 'عقد توريد بضائع ومنتجات تجارية',
      category: 'business',
      categoryLabel: 'عقود الشركات والتجارة (قانون التجارة 17 لسنة 1999)',
      iconType: 'store',
      defaultType: 'عقد توريد وتوزيع بضائع ومنتجات تجارية دورية',
      description: 'ينظم شروط توريد البضائع والمنتجات، جداول الشحن، الفحص والاستلام، شروط المرتجعات، وغرامات التأخير في التوريد.',
      keyClauses: ['مواصفات الفحص والاستلام والمطابقة', 'أوامر التوريد ومواعيد الشحن', 'شروط المرتجعات والعيوب الخفية', 'شروط السداد والفواتير والتأخير'],
      sampleData: {
        contractType: 'عقد توريد مواد غذائية ومشروبات ومستلزمات مطاعم دورية',
        firstParty: 'مؤسسة الدلتا للتجارة والتوريدات العمومية - مقرها طنطا، الغربية (طرف أول - المورد)',
        secondParty: 'شركة كوين فود للمطاعم السياحية - مقرها مدينة نصر، القاهرة (طرف ثانٍ - المشتري / طالب التوريد)',
        subject: 'توريد مستلزمات غذائية ومواد خام شهرياً طبقاً لأوامر الشراء (Purchase Orders) وبالمواصفات القياسية المصرية المعتمدة وخالية من أي عيوب صلاحية.',
        financials: 'تُسدد قيمة كل توريدة بآجل 30 يوماً من تاريخ الفحص والاستلام ومطابقة الفاتورة بمخازن الطرف الثاني، بحد ائتماني أقصى 150,000 جنيه.',
        duration: 'مدة العقد سنة ميلادية تبدأ من تاريخ توقيعه وتجدد تلقائياً ما لم يُخطر أحد الطرفين الآخر بغير ذلك.',
        specialConditions: 'غرامة تأخير 1% عن كل يوم تأخير في التوريد بعد الموعد المحدد بأمر الشراء، مع حق المشتري في الشراء من السوق المحلي على حساب المورد في حال التخلف.',
      },
    },
    {
      id: 'renovation-contract',
      name: 'عقد مقاولة وتشطيبات داخلية',
      category: 'contracting',
      categoryLabel: 'عقود المقاولات والمدنيات (القانون المدني)',
      iconType: 'hammer',
      defaultType: 'عقد مقاولة وتوريد وتركيب أعمال تشطيبات ديكورية ومعمارية',
      description: 'ينظم أعمال البناء والتشطيبات المعمارية والديكور، جدول الدفعات حسب الإنجاز، محبوس الضمان، وغرامات التأخير اليومية والضمان العشري.',
      keyClauses: ['جدول المقايسة والمواصفات الفنية المعتمدة', 'ربط الدفعات بنسب الإنجاز الفعلي', 'محبوس الضمان وحسن التنفيذ (10%)', 'غرامة التأخير اليومية والضمان العشري (م 651 مدني)'],
      sampleData: {
        contractType: 'عقد مقاولة أعمال تشطيبات متكاملة وتوريد وتركيب لوحدة سكنية',
        firstParty: 'السيد / سامح فؤاد إبراهيم - بطاقة رقم قومي (28004051203456) - مقيم في النزهة، القاهرة (طرف أول - رب العمل)',
        secondParty: 'مؤسسة الأهرام للديكور والمقاولات - يمثلها المهندس / عادل فاروق - مقرها الشروق، القاهرة (طرف ثانٍ - المقاول)',
        subject: 'تنفيذ أعمال التشطيبات المعمارية والكهربائية والصحية والدهانات والنجارة للشقة السكنية الكائنة بمدينة الشروق طبقاً لجدول المقايسة والمواصفات المعتمدة من الطرفين.',
        financials: 'إجمالي قيمة المقاولة مبلغ 450,000 جنيه مصري تُدفع على 4 دفعات مرحلية مرتبطة بنسب الإنجاز الفعلي، مع استقطاع 10% كدفعة محبوس ضمان تُصرف بعد 6 أشهر من الاستلام النهائي.',
        duration: 'مدة التنفيذ 90 يوماً تبدأ من تاريخ استلام الموقع وسداد الدفعة المقدمة في موعد غايته 2026/10/05.',
        specialConditions: 'غرامة تأخير قدرها 500 جنيه مصري عن كل يوم تأخير غير مبرر، مع التزام المقاول بالضمان العشري لسلامة الأعمال طبقاً للمادة 651 من القانون المدني المصري وإصلاح أي عيوب تطرأ على نفقته الخاصة.',
      },
    },
    {
      id: 'settlement-contract',
      name: 'عقد صلح وتنازل عن نزاع قضائي',
      category: 'settlement',
      categoryLabel: 'عقود الصلح والمدنيات (القانون المدني)',
      iconType: 'handshake',
      defaultType: 'عقد اتفاق وصلح نهائي وبات وتنازل عن دعاوى قضائية وإبراء ذمة',
      description: 'عقد صلح رضائي قاطع للنزاع طبقاً للمادة 549 من القانون المدني المصري، مع إبراء الذمة والتنازل عن الشكاوى والبلاغات والدعاوى المتبادلة.',
      keyClauses: ['أثر الصلح الحاسم للنزاع (مادة 549 مدني)', 'التنازل أمام المحكمة وجهات التحقيق', 'إبراء الذمة المالية والجنائية المتبادلة', 'الشرط الجزائي الرادع في حال الرجوع بالنزاع'],
      sampleData: {
        contractType: 'عقد صلح نهائي وبات وتنازل عن دعاوى قضائية طبقاً لأحكام القانون المدني المصري',
        firstParty: 'السيد / نبيل توفيق إسماعيل - بطاقة رقم قومي (27901031405678) - مقيم في العجوزة، الجيزة (طرف أول)',
        secondParty: 'السيد / صبري عبد المنعم مرسي - بطاقة رقم قومي (28108021603456) - مقيم في مدينة 6 أكتوبر، الجيزة (طرف ثانٍ)',
        subject: 'إنهاء النزاع المدني القائم بين الطرفين بشأن الشيكات البنكية والمطالبات المالية المتداولة بالجنحة رقم (1420 لسنة 2025 جنح العجوزة) صلحاً نهائياً وباتاً لا رجعة فيه.',
        financials: 'سداد الطرف الثاني للطرف الأول مبلغ وقدره 180,000 جنيه مصري نقداً بمجلس الصلح، ويعتبر توقيع الطرف الأول إبراءً تاماً وشاملاً لذمة الطرف الثاني من أي ديون أو فوائد.',
        duration: 'يسري الصلح فور توقيعه ويلتزم الطرف الأول بالحضور أمام المحكمة المختصة للتصالح والتنازل رسمياً بالجلسة القادمة.',
        specialConditions: 'يُعد هذا الصلح حاسماً للنزاع ومبرئاً للذمة طبقاً للمادة 549 من القانون المدني، وإذا أخل أي طرف بالالتزام بالحضور للتنازل يلتزم بسداد شرط جزائي قدره 100,000 جنيه مصري.',
      },
    },
  ];

  // Icon Helper
  const renderTemplateIcon = (iconType: ContractTemplatePreset['iconType']) => {
    switch (iconType) {
      case 'home':
        return <Home className="w-5 h-5 text-[#C5A059]" />;
      case 'building':
        return <Building className="w-5 h-5 text-emerald-400" />;
      case 'briefcase':
        return <Briefcase className="w-5 h-5 text-blue-400" />;
      case 'users':
        return <Users className="w-5 h-5 text-purple-400" />;
      case 'hammer':
        return <Hammer className="w-5 h-5 text-amber-500" />;
      case 'car':
        return <Car className="w-5 h-5 text-cyan-400" />;
      case 'store':
        return <Store className="w-5 h-5 text-orange-400" />;
      case 'shield':
        return <ShieldCheck className="w-5 h-5 text-indigo-400" />;
      case 'handshake':
        return <Handshake className="w-5 h-5 text-teal-400" />;
      default:
        return <FileSignature className="w-5 h-5 text-[#C5A059]" />;
    }
  };

  // Filtered presets for search & category
  const filteredPresets = presets.filter((p) => {
    const matchesCategory =
      selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
    const q = templateSearchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q) ||
      p.sampleData.contractType.toLowerCase().includes(q) ||
      p.keyClauses.some((c) => c.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  // Apply template data directly to form fields
  const handleApplyTemplate = (
    preset: ContractTemplatePreset,
    autoGenerate: boolean = false
  ) => {
    setContractType(preset.sampleData.contractType);
    setFirstParty(preset.sampleData.firstParty);
    setSecondParty(preset.sampleData.secondParty);
    setSubject(preset.sampleData.subject);
    setFinancials(preset.sampleData.financials);
    setDuration(preset.sampleData.duration);
    setSpecialConditions(preset.sampleData.specialConditions);
    setLoadedTemplateName(preset.name);
    setIsTemplatesModalOpen(false);
    setPreviewingTemplate(null);

    if (autoGenerate) {
      showToast(`تم ملء بيانات قالب «${preset.name}» وجاري صياغة المسودة فوراً...`);
      setTimeout(() => {
        handleTriggerGeneration({
          contractType: preset.sampleData.contractType,
          firstParty: preset.sampleData.firstParty,
          secondParty: preset.sampleData.secondParty,
          subject: preset.sampleData.subject,
          financials: preset.sampleData.financials,
          duration: preset.sampleData.duration,
          specialConditions: preset.sampleData.specialConditions,
        });
      }, 200);
    } else {
      setActiveTab('guided');
      showToast(`تم ملء بيانات قالب «${preset.name}» تلقائياً في الاستمارة، يمكنك الآن مراجعتها أو تعديلها.`);
    }
  };

  // Clear Form Fields
  const handleClearForm = () => {
    setContractType('');
    setFirstParty('');
    setSecondParty('');
    setSubject('');
    setFinancials('');
    setDuration('');
    setSpecialConditions('');
    setLoadedTemplateName(null);
    showToast('تم تفريغ حقول الاستمارة بنجاح');
  };

  const handleTriggerGeneration = async (overrideData?: any) => {
    if (loading) return;
    setLoading(true);
    setContractDraft(null);
    setIsEditingDraft(false);

    try {
      let bodyData: any = {};

      if (overrideData) {
        bodyData = overrideData;
      } else if (activeTab === 'freeform') {
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
          showToast('يرجى توضيح نوع العقد وموضوعه الأساسي أو اختيار قالب جاهز');
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
        // Fallback
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

        {/* Action Controls & Tab Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Browse Templates Button */}
          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-[#202020] hover:bg-[#282828] text-[#C5A059] hover:text-[#D4B26F] border border-[#C5A059]/40 hover:border-[#C5A059] rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>مكتبة القوالب ({presets.length})</span>
          </button>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-[#181818] p-1 rounded-xl border border-[#2A2A2A]">
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-[#C5A059] text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              القوالب الجاهزة
            </button>
            <button
              onClick={() => setActiveTab('guided')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'guided'
                  ? 'bg-[#C5A059] text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              استمارة التخصيص
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
        {/* TAB 1: READY-MADE TEMPLATES CATALOG */}
        {activeTab === 'presets' && (
          <div className="space-y-5">
            {/* Intro & Search Bar */}
            <div className="bg-[#161616] p-5 sm:p-6 rounded-2xl border border-[#2B2B2B] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[#C5A059] font-bold text-sm mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>مكتبة القوالب القانونية المصرية الجاهزة</span>
                </div>
                <p className="text-xs text-gray-400">
                  اختر نموذج عقد معتمد لملء كافة بياناته الأساسية تلقائياً في الاستمارة أو صياغته فوراً:
                </p>
              </div>

              {/* Quick Search */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={templateSearchQuery}
                  onChange={(e) => setTemplateSearchQuery(e.target.value)}
                  placeholder="ابحث باسم العقد (إيجار، بيع، سيارة، عمل...)"
                  className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A059] transition"
                />
                {templateSearchQuery && (
                  <button
                    onClick={() => setTemplateSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'كافة القوالب' },
                { id: 'rent', label: 'عقود الإيجار (قانون 4)' },
                { id: 'sale', label: 'عقود البيع والملكية' },
                { id: 'employment', label: 'عقود العمل والموظفين' },
                { id: 'business', label: 'الشراكات والتجارة' },
                { id: 'contracting', label: 'المقاولات والتشطيبات' },
                { id: 'settlement', label: 'الصلح والتسويات' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategoryFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition cursor-pointer font-medium ${
                    selectedCategoryFilter === tab.id
                      ? 'bg-[#C5A059] text-black font-bold shadow-md'
                      : 'bg-[#181818] hover:bg-[#222222] text-gray-300 border border-[#2B2B2B]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPresets.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#141414] hover:bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#C5A059]/50 rounded-2xl p-5 transition-all flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    {/* Top Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#222222] border border-[#333333] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                          {renderTemplateIcon(p.iconType)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-[#C5A059] transition">
                            {p.name}
                          </h3>
                          <span className="text-[11px] text-gray-400 block">{p.categoryLabel}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed mb-3">{p.description}</p>

                    {/* Key Legal Clauses Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {p.keyClauses.map((clause, idx) => (
                        <span
                          key={idx}
                          className="bg-[#1C1C1C] border border-[#303030] text-[10px] text-gray-300 px-2 py-0.5 rounded-md flex items-center gap-1"
                        >
                          <FileCheck2 className="w-2.5 h-2.5 text-[#C5A059]" />
                          <span>{clause}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[#222222]">
                    <button
                      onClick={() => handleApplyTemplate(p, false)}
                      className="flex-1 py-2 px-3 bg-[#202020] hover:bg-[#282828] text-gray-200 hover:text-white text-xs font-semibold rounded-xl border border-[#333333] hover:border-[#C5A059]/50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      title="ملء جميع البيانات في الاستمارة للمراجعة والتعديل"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>ملء الاستمارة تلقائياً</span>
                    </button>
                    <button
                      onClick={() => handleApplyTemplate(p, true)}
                      className="py-2 px-3.5 bg-[#C5A059] hover:bg-[#D4B26F] text-black text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-md"
                      title="ملء وتوليد المسودة القانونية فوراً"
                    >
                      <span>صياغة فورية</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredPresets.length === 0 && (
              <div className="text-center py-12 bg-[#141414] rounded-2xl border border-[#262626]">
                <FileSignature className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-300 font-bold">لم يتم العثور على قوالب تطابق بحثك</p>
                <p className="text-xs text-gray-500 mt-1">جرب البحث بكلمات أخرى مثل «إيجار» أو «بيع» أو «عمل»</p>
                <button
                  onClick={() => {
                    setTemplateSearchQuery('');
                    setSelectedCategoryFilter('all');
                  }}
                  className="mt-3 px-4 py-1.5 bg-[#222222] hover:bg-[#2B2B2B] text-xs text-[#C5A059] rounded-lg border border-[#333333]"
                >
                  إعادة ضبط الفلاتر
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GUIDED FORM WITH INSTANT AUTO-FILL CONTROLS */}
        {activeTab === 'guided' && (
          <div className="bg-[#141414] rounded-2xl p-6 border border-[#2B2B2B] shadow-xl space-y-5">
            {/* Quick Auto-Fill Template Picker Banner */}
            <div className="bg-gradient-to-r from-[#1E1B15] to-[#151515] p-4 rounded-xl border border-[#C5A059]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#C5A059] text-black flex items-center justify-center font-bold shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>ميزة الملء التلقائي من القوالب الجاهزة</span>
                    <span className="text-[10px] bg-[#C5A059]/20 text-[#C5A059] px-2 py-0.5 rounded-full font-medium">
                      شائع وموصى به
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    اختر نموذجاً مصرياً جاهزاً لملء الأسماء، الأرقام القومية، والبنود الأساسية بنقرة واحدة
                  </p>
                </div>
              </div>

              {/* Template Select Dropdown & Browse Button */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  onChange={(e) => {
                    const found = presets.find((p) => p.id === e.target.value);
                    if (found) handleApplyTemplate(found, false);
                  }}
                  defaultValue=""
                  className="bg-[#0A0A0A] border border-[#3A3A3A] hover:border-[#C5A059] text-xs text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C5A059] transition flex-1 sm:w-56 cursor-pointer"
                >
                  <option value="" disabled>
                    ⚡ اختر قالباً للملء التلقائي...
                  </option>
                  <optgroup label="🏠 عقود الإيجار">
                    {presets.filter((p) => p.category === 'rent').map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🏢 عقود البيع والملكية">
                    {presets.filter((p) => p.category === 'sale').map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="💼 عقود العمل والموظفين">
                    {presets.filter((p) => p.category === 'employment').map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🤝 الشراكات والتجارة">
                    {presets.filter((p) => p.category === 'business').map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🔨 المقاولات والتسويات">
                    {presets.filter((p) => p.category === 'contracting' || p.category === 'settlement').map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </optgroup>
                </select>

                <button
                  type="button"
                  onClick={() => setIsTemplatesModalOpen(true)}
                  className="px-3 py-2 bg-[#252525] hover:bg-[#303030] text-[#C5A059] border border-[#3A3A3A] rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5"
                  title="استعراض كافة القوالب مع المعاينة"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>تصفح</span>
                </button>
              </div>
            </div>

            {/* Template Loaded Feedback Indicator */}
            {loadedTemplateName && (
              <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    تم ملء الحقول تلقائياً من <strong>«{loadedTemplateName}»</strong>. يمكنك تعديل أي خانة بحرية قبل التوليد.
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="text-xs text-gray-400 hover:text-red-400 underline transition cursor-pointer flex items-center gap-1"
                  title="مسح الحقول وتفريغها"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>تفريغ الحقول</span>
                </button>
              </div>
            )}

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
            <div className="pt-3 border-t border-[#242424] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-400 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#C5A059]" />
                <span>يقوم المحامي الذكي بتنسيق الديباجة وأرقام البنود وصيغ المحاكم المصرية تلقائياً.</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {loadedTemplateName && (
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="px-4 py-3 bg-[#202020] hover:bg-[#282828] text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition border border-[#333333] cursor-pointer"
                  >
                    تفريغ الحقول
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleTriggerGeneration()}
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
                type="button"
                onClick={() => handleTriggerGeneration()}
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
                  type="button"
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
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-[#1E1E1E] hover:bg-[#282828] text-gray-300 hover:text-white border border-[#333333] rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ العقد'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="px-3 py-1.5 bg-[#1E1E1E] hover:bg-[#282828] text-gray-300 hover:text-white border border-[#333333] rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="تنزيل كملف نصي منسق"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>تنزيل (TXT)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="px-3 py-1.5 bg-[#1E1E1E] hover:bg-[#282828] text-gray-300 hover:text-white border border-[#333333] rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="طباعة رسمية أو حفظ كـ PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>طباعة / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-1.5 bg-[#1E1E1E] hover:bg-[#282828] text-gray-300 hover:text-white border border-[#333333] rounded-lg transition cursor-pointer"
                  title="مشاركة المسودة"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
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

      {/* ========================================================================= */}
      {/* READY-MADE TEMPLATES BROWSER MODAL (POPUP DIALOG WITH PREVIEW & AUTO-FILL) */}
      {/* ========================================================================= */}
      {isTemplatesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#0F0F0F] rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-[#2B2B2B]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#181818] border-b border-[#282828] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C5A059] text-black flex items-center justify-center font-bold">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>مكتبة القوالب القانونية المصرية الجاهزة</span>
                    <span className="bg-[#C5A059]/20 text-[#C5A059] text-xs px-2.5 py-0.5 rounded-full border border-[#C5A059]/40 font-semibold">
                      {presets.length} قوالب معتمدة
                    </span>
                  </h2>
                  <p className="text-xs text-gray-400">
                    اختر نموذجاً للمعاينة وملء بياناته الأساسية تلقائياً في استمارة الصياغة
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsTemplatesModalOpen(false);
                  setPreviewingTemplate(null);
                }}
                className="w-9 h-9 rounded-xl bg-[#222222] hover:bg-[#2B2B2B] text-gray-300 hover:text-white flex items-center justify-center transition border border-[#333333] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search & Categories Toolbar */}
            <div className="px-6 py-3 bg-[#131313] border-b border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'rent', label: 'الإيجارات' },
                  { id: 'sale', label: 'البيوع والملكية' },
                  { id: 'employment', label: 'العمل والموظفين' },
                  { id: 'business', label: 'الشركات والتجارة' },
                  { id: 'contracting', label: 'المقاولات والصلح' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryFilter(cat.id === 'contracting' ? 'contracting' : cat.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      selectedCategoryFilter === cat.id
                        ? 'bg-[#C5A059] text-black shadow-md'
                        : 'bg-[#1C1C1C] hover:bg-[#242424] text-gray-300 border border-[#2B2B2B]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={templateSearchQuery}
                  onChange={(e) => setTemplateSearchQuery(e.target.value)}
                  placeholder="بحث سريع في القوالب..."
                  className="w-full bg-[#0A0A0A] border border-[#2B2B2B] rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A059] transition"
                />
              </div>
            </div>

            {/* Modal Body: Split view if previewing, or Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {previewingTemplate ? (
                /* PREVIEW SCREEN FOR A SINGLE TEMPLATE */
                <div className="space-y-5">
                  <div className="flex items-center justify-between bg-[#181818] p-4 rounded-2xl border border-[#2B2B2B]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#222222] border border-[#333333] flex items-center justify-center">
                        {renderTemplateIcon(previewingTemplate.iconType)}
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          معاينة بيانات قالب: {previewingTemplate.name}
                        </h3>
                        <span className="text-xs text-[#C5A059]">{previewingTemplate.categoryLabel}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setPreviewingTemplate(null)}
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1 px-3 py-1.5 bg-[#202020] rounded-lg border border-[#333333]"
                    >
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                      <span>العودة لكافة القوالب</span>
                    </button>
                  </div>

                  {/* Key Clauses */}
                  <div className="bg-[#141414] p-4 rounded-xl border border-[#262626]">
                    <span className="text-xs font-bold text-gray-300 block mb-2">أهم البنود والشروط القانونية المدمجة في هذا القالب:</span>
                    <div className="flex flex-wrap gap-2">
                      {previewingTemplate.keyClauses.map((c, i) => (
                        <span key={i} className="bg-[#1E1E1E] text-xs text-[#C5A059] px-2.5 py-1 rounded-md border border-[#333333]">
                          ✓ {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Auto-filled Form Preview Grid */}
                  <div className="space-y-3 bg-[#111111] p-5 rounded-2xl border border-[#242424] text-xs">
                    <span className="text-xs font-bold text-[#C5A059] block mb-1">
                      البيانات الأساسية التي سيتم إدراجها تلقائياً في الاستمارة:
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-[#171717] p-3 rounded-xl border border-[#262626]">
                        <span className="font-bold text-gray-400 block mb-1">الطرف الأول:</span>
                        <p className="text-gray-200 leading-relaxed">{previewingTemplate.sampleData.firstParty}</p>
                      </div>

                      <div className="bg-[#171717] p-3 rounded-xl border border-[#262626]">
                        <span className="font-bold text-gray-400 block mb-1">الطرف الثاني:</span>
                        <p className="text-gray-200 leading-relaxed">{previewingTemplate.sampleData.secondParty}</p>
                      </div>
                    </div>

                    <div className="bg-[#171717] p-3 rounded-xl border border-[#262626]">
                      <span className="font-bold text-gray-400 block mb-1">موضوع ومحل العقد:</span>
                      <p className="text-gray-200 leading-relaxed">{previewingTemplate.sampleData.subject}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-[#171717] p-3 rounded-xl border border-[#262626]">
                        <span className="font-bold text-gray-400 block mb-1">المقابل المالي / الأجرة:</span>
                        <p className="text-gray-200 leading-relaxed">{previewingTemplate.sampleData.financials}</p>
                      </div>

                      <div className="bg-[#171717] p-3 rounded-xl border border-[#262626]">
                        <span className="font-bold text-gray-400 block mb-1">مدة وسريان العقد:</span>
                        <p className="text-gray-200 leading-relaxed">{previewingTemplate.sampleData.duration}</p>
                      </div>
                    </div>

                    <div className="bg-[#171717] p-3 rounded-xl border border-[#262626]">
                      <span className="font-bold text-gray-400 block mb-1">الشروط الخاصة والجزائية:</span>
                      <p className="text-gray-200 leading-relaxed">{previewingTemplate.sampleData.specialConditions}</p>
                    </div>
                  </div>

                  {/* Actions for Previewed Template */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleApplyTemplate(previewingTemplate, false)}
                      className="px-5 py-2.5 bg-[#252525] hover:bg-[#303030] text-gray-200 hover:text-white rounded-xl text-xs font-bold transition border border-[#3A3A3A] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-[#C5A059]" />
                      <span>ملء الاستمارة تلقائياً للتعديل</span>
                    </button>
                    <button
                      onClick={() => handleApplyTemplate(previewingTemplate, true)}
                      className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#D4B26F] text-black rounded-xl text-xs font-bold transition shadow-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>صياغة مسودة هذا القالب فوراً</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* ALL TEMPLATES GRID IN MODAL */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPresets.map((p) => (
                    <div
                      key={p.id}
                      className="bg-[#141414] hover:bg-[#1A1A1A] border border-[#262626] hover:border-[#C5A059]/60 rounded-2xl p-4.5 transition-all flex flex-col justify-between group shadow-md"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#202020] border border-[#303030] flex items-center justify-center shrink-0">
                            {renderTemplateIcon(p.iconType)}
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#C5A059] transition">
                              {p.name}
                            </h3>
                            <span className="text-[10px] text-gray-400 block">{p.categoryLabel}</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed mb-3 line-clamp-2">
                          {p.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {p.keyClauses.slice(0, 2).map((c, i) => (
                            <span key={i} className="text-[9px] bg-[#1C1C1C] text-gray-400 px-2 py-0.5 rounded border border-[#2B2B2B]">
                              ✓ {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-3 border-t border-[#222222]">
                        <button
                          onClick={() => handleApplyTemplate(p, false)}
                          className="w-full py-2 px-3 bg-[#C5A059] hover:bg-[#D4B26F] text-black text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>اختيار وملء البيانات تلقائياً</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewingTemplate(p)}
                            className="flex-1 py-1.5 bg-[#202020] hover:bg-[#282828] text-gray-300 hover:text-white text-[11px] rounded-lg border border-[#303030] transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-[#C5A059]" />
                            <span>معاينة البيانات</span>
                          </button>
                          <button
                            onClick={() => handleApplyTemplate(p, true)}
                            className="flex-1 py-1.5 bg-[#202020] hover:bg-[#282828] text-gray-300 hover:text-white text-[11px] rounded-lg border border-[#303030] transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>صياغة فورية</span>
                            <ArrowRight className="w-3 h-3 text-[#C5A059]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-[#131313] border-t border-[#222222] flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#C5A059]" />
                <span>كافة النماذج مصاغة وفقاً للقانون المدني وقانون الإيجار 4 وقانون العمل 12 وقانون التجارة المصري.</span>
              </span>
              <button
                onClick={() => {
                  setIsTemplatesModalOpen(false);
                  setPreviewingTemplate(null);
                }}
                className="text-xs text-gray-400 hover:text-white underline cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
