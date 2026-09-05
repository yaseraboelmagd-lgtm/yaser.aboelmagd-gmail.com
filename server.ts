import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize GoogleGenAI client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// System instructions tailored for Egyptian Law
const EGYPTIAN_LAW_BASE_INSTRUCTION = `
أنت "المحامي الذكي" (Smart Lawyer)، مساعد قانوني ذكي واحترافي متخصص حصرياً في تحليل وشرح المسائل والدعاوى القانونية وفقاً للقانون المصري النافذ (القانون المدني، قانون العقوبات، قانون الإجراءات الجنائية، قانون العمل، قانون التجارة، قوانين الأحوال الشخصية المصرية، قوانين الإيجارات، وقوانين الاستثمار والشركات).
تعليمات صارمة:
1. يجب أن تكون كافة الإجابات باللغة العربية الفصحى القانونية الواضحة والمنظمة، مع تبسيط المصطلحات المعقدة للمستخدم العادي دون الإخلال بالدقة القانونية.
2. استند دائماً إلى مواد التشريع المصري ذات الصلة (مثل المواد القانونية في القانون المدني أو قانون العقوبات أو قانون العمل أو أحكام محكمة النقض المصرية عند الاقتضاء).
3. قدم المشورة والنصائح بشكل مهني، وتجنب الجزم بالأحكام النهائية مع التنويه دائماً بأن هذا التحليل هو استشارة تمهيدية وللاستئناس، ويجب مراجعة محامٍ مرخص لتولي القضايا أمام المحاكم المصرية.
4. نظم الإجابة في نقاط واضحة وعناوين بارزة.
`;

// Helper with model fallback for high demand (503)
async function generateWithFallback(callFn: (model: string) => Promise<any>): Promise<any> {
  const models = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of models) {
    try {
      return await callFn(model);
    } catch (error: any) {
      console.warn(`Model ${model} failed, trying fallback. Error:`, error?.message || error);
      lastError = error;
      // If error is not 503/unavailable, we can still try next model just in case
    }
  }
  throw lastError || new Error("جميع النماذج متاحة حالياً بشكل محدود، يرجى المحاولة بعد قليل.");
}

// 1. Legal Advisor Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const chatHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1]?.content || "";

    const replyText = await generateWithFallback(async (model) => {
      const chat = ai.chats.create({
        model,
        config: {
          systemInstruction: `${EGYPTIAN_LAW_BASE_INSTRUCTION}\nأنت تعمل كمستشار قانوني (Legal Advisor). أجب على استفسار المستخدم بخصوص المسألة القانونية المطروحة مع ذكر المواد القانونية المصرية ذات الصلة إن وجد.`,
        },
        history: chatHistory,
      });
      const response = await chat.sendMessage({ message: lastMessage });
      return response.text;
    });

    res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: error.message || "حدث ضغط مؤقت على الخدمة، يرجى إعادة المحاولة." });
  }
});

// 2. Defendant Analysis Endpoint
app.post("/api/defense", async (req, res) => {
  try {
    const { caseDetails } = req.body;
    if (!caseDetails) {
      return res.status(400).json({ error: "caseDetails is required" });
    }

    const prompt = `قم بتحليل القضية التالية من منظور الدفاع (Defendant Perspective) وفقاً للقانون المصري:
تفاصيل القضية أو الاتهام:
${caseDetails}

قم بتقديم التحليل باللغة العربية في شكل هيكل منظم يحتوي على:
1. التكييف القانوني للتهمة أو النزاع وفقاً للقانون المصري.
2. حقوق المتهم / المدعى عليه القانونية والدستورية.
3. الدفوع القانونية والدفاعية الممكنة (دفوع بطلان، انتفاء ركن، دفاع موضوعي).
4. الأدلة والإثباتات المطلوبة لتعزيز موقف الدفاع.
5. الخطوات الإجرائية الموصى بها والخيارات المتاحة أمام جهات التحقيق أو المحاكم المصرية.
`;

    const analysisText = await generateWithFallback(async (model) => {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: EGYPTIAN_LAW_BASE_INSTRUCTION,
        },
      });
      return response.text;
    });

    res.json({ analysis: analysisText });
  } catch (error: any) {
    console.error("Defense API error:", error);
    res.status(500).json({ error: error.message || "حدث ضغط مؤقت على الخدمة، يرجى إعادة المحاولة." });
  }
});

// 3. Case Analyst Endpoint
app.post("/api/analyze", async (req, res) => {
  try {
    const { problemDescription } = req.body;
    if (!problemDescription) {
      return res.status(400).json({ error: "problemDescription is required" });
    }

    const prompt = `قم بتحليل المشكلة القانونية التالية كمحلل قضايا محترف (Case Analyst) طبقاً للتشريعات والقوانين المعمول بها في جمهورية مصر العربية:
وصف المشكلة / النزاع:
${problemDescription}

قدم تقريراً تحليلياً شاملاً ومبسطاً يتضمن:
1. ملخص النزاع وطبيعته القانونية (مدني، تجاري، جنائي، عمالي، أحوال شخصية، إلخ).
2. تحديد الأطراف والمراكز القانونية.
3. المخاطر القانونية المحتملة ونقاط الضعف والقوة.
4. المستندات والوثائق الواجب جمعها وترتيبها.
5. خارطة طريق للخطوات العملية والخيارات القانونية (حل ودي، إنذار رسمى على يد محضر، رفع دعوى أمام المحكمة المختصة).
`;

    const resultText = await generateWithFallback(async (model) => {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: EGYPTIAN_LAW_BASE_INSTRUCTION,
        },
      });
      return response.text;
    });

    res.json({ result: resultText });
  } catch (error: any) {
    console.error("Analyze API error:", error);
    res.status(500).json({ error: error.message || "حدث ضغط مؤقت على الخدمة، يرجى إعادة المحاولة." });
  }
});

// 4. Contract Drafting Assistant Endpoint (Egyptian Model)
app.post("/api/contract", async (req, res) => {
  try {
    const {
      contractType,
      firstParty,
      secondParty,
      subject,
      financials,
      duration,
      specialConditions,
      customNotes,
    } = req.body;

    if (!contractType && !subject && !customNotes) {
      return res.status(400).json({ error: "الرجاء تحديد نوع العقد أو موضوعه" });
    }

    const prompt = `أنت محامٍ ومستشار قانوني مصري خبير في صياغة العقود والاتفاقيات المدنية والتجارية طبقاً للنموذج والتشريع المصري النافذ (القانون المدني المصري رقم 131 لسنة 1948، قانون الإيجار رقم 4 لسنة 1996 المعدل، قانون العمل 12 لسنة 2003، وقانون التجارة المصري 17 لسنة 1999).

المطلوب: قم بكتابة وصياغة مسودة عقد قانوني كامل ورسمي ومحكم الصياغة وفق المعايير القضائية المصرية بالبيانات التالية:
- نوع العقد: ${contractType || "عقد اتفاق وتراضي"}
- الطرف الأول (الصفة والبيانات): ${firstParty || "فلان الفلاني - مصري الجنسية - بالرقم القومي [...] - المقيم [...] (طرف أول)"}
- الطرف الثاني (الصفة والبيانات): ${secondParty || "فلان الفلاني - مصري الجنسية - بالرقم القومي [...] - المقيم [...] (طرف ثانٍ)"}
- موضوع العقد ومحل الالتزام: ${subject || "غير محدد بدقة، يرجى الصياغة بنموذج منضبط مع علامات تعبئة واضحة [...]"}
- المقابل المالي / القيمة / الأجرة: ${financials || "حسب الاتفاق المالي بين الطرفين"}
- مدة العقد وسريانه: ${duration || "محددة حسب الاتفاق وتبدأ من تاريخ التوقيع"}
- شروط وبنود خاصة مطلوبة: ${specialConditions || "لا توجد شروط خاصة إضافية"}
- ملاحظات أو تفاصيل إضافية: ${customNotes || "لا توجد"}

تعليمات الصياغة الإلزامية:
1. صياغة ديباجة العقد القانونية المصرية الرصينة: (إنه في يوم [...] الموافق ../../202..م، تم الاتفاق والتراضي بين كل من: ...) مع إثبات أهليتهم القانونية المعتبرة شرعاً وقانوناً للتصرف والتعاقد وخلو إرادتهم من أي عيب من عيوب الرضا.
2. وضع بند تمهيدي يعتبر جزءاً لا يتجزأ من العقد ومفسراً لجميع بنوده.
3. تفصيل بنود العقد مرقمة بوضوح (البند الأول، البند الثاني، ...):
   - البند الأول: موضوع ومحل العقد بدقة نافية للجهالة.
   - البند الثاني: المقابل المالي / الثمن / الأجرة ومواعيد وطريقة السداد.
   - البند الثالث: المعاينة والتسليم والإقرار بالمعاينة النافية لأي جهالة شرعية أو قانونية.
   - البند الرابع: مدة العقد وبدء سريانه وحالات التجديد أو الإنهاء.
   - البند الخامس: التزامات وحقوق الطرفين بدقة.
   - البند السادس: الشرط الفاسخ الصريح والشرط الجزائي المتفق عليه (مع النص على انفساخ العقد من تلقاء نفسه دون حاجة لتنبيه أو إنذار أو حكم قضائي طبقاً للمادة 158 من القانون المدني المصري في حالات الإخلال الجسيم).
   - البند السابع: الموطن المختار لكل طرف للإعلانات القضائية والمكاتبات الرسمية.
   - البند الثامن: الاختصاص القضائي والمحاكم الابتدائية والجزئية المصرية المختصة بنظر أي نزاع.
   - البند التاسع: عدد النسخ الموقعة ومصير كل نسخة.
4. موضع التوقيعات الرسمية في نهاية العقد (الطرف الأول، الطرف الثاني، الشاهد الأول، الشاهد الثاني).
5. في نهاية المستند، أضف قسماً بعنوان: "💡 إرشادات ونصائح قانونية مصرية لتأمين هذا العقد" (مثل: ضرورة إثبات التاريخ، أو تذييل العقد بالصيغة التنفيذية أمام مكتب الشهر العقاري المختص طبقاً للقانون 137 لسنة 2006، فحص التوكيلات، ورسوم الدمغة).
`;

    const contractDraft = await generateWithFallback(async (model) => {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: EGYPTIAN_LAW_BASE_INSTRUCTION,
        },
      });
      return response.text;
    });

    res.json({ contractDraft });
  } catch (error: any) {
    console.error("Contract API error:", error);
    res.status(500).json({ error: error.message || "حدث ضغط مؤقت على الخدمة أثناء صياغة العقد، يرجى المحاولة بعد قليل." });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Lawyer server running on http://localhost:${PORT}`);
  });
}

startServer();
