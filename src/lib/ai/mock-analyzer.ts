/**
 * Mock AI Analyzer for Demo/MVP
 *
 * Simulates AI analysis for demo purposes when no API key is configured.
 * Uses pattern matching to extract basic information from text.
 */

interface AnalysisResult {
  events: Array<{
    date: string;
    description: string;
    amount: string;
    persons: string;
    tags: string[];
    confidence: string;
  }>;
  deadlines: Array<{
    title: string;
    date: string;
    type: string;
    confidence: string;
  }>;
  evidences: Array<{
    name: string;
    type: string;
    purpose: string;
    confidence: string;
  }>;
  tasks: Array<{
    title: string;
    description: string;
    priority: string;
    confidence: string;
  }>;
  parties: Array<{
    name: string;
    role: string;
    confidence: string;
  }>;
  caseType: string;
  summary: string;
  risks: string[];
  missingInfo: string[];
  warnings: string[];
}

// Simple date pattern matching
const DATE_PATTERNS = [
  /(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})/g,
  /(\d{1,2})月(\d{1,2})[日号]/g,
  /(\d{4})\.(\d{1,2})\.(\d{1,2})/g,
];

// Amount pattern matching
const AMOUNT_PATTERNS = [
  /(\d+\.?\d*)\s*万/g,
  /(\d+\.?\d*)\s*元/g,
  /(\d+\.?\d*)\s*块/g,
  /¥\s*([\d,]+\.?\d*)/g,
  /转账\s*(\d+\.?\d*)/g,
];

// Keyword-based case type detection
const CASE_TYPE_KEYWORDS: Record<string, string[]> = {
  lending: [
    "借款", "欠款", "借钱", "还钱", "借条", "欠条", "转账", "还款",
    "利息", "催款", "民间借贷", "贷款", "借给", "借了",
  ],
  labor: [
    "入职", "离职", "辞退", "解雇", "开除", "工资", "社保", "劳动合同",
    "加班", "仲裁", "劳动争议", "口头辞退", "书面通知", "劳动",
  ],
  family: [
    "离婚", "结婚", "抚养权", "探视权", "财产分割", "夫妻", "家暴",
    "出轨", "继承", "遗嘱", "赡养", "抚养费", "孩子",
  ],
};

function extractDates(text: string): string[] {
  const dates: string[] = [];
  for (const pattern of DATE_PATTERNS) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[0].includes("年")) {
        dates.push(match[0].replace(/[年\-\/]/g, "-").replace(/[月日号]/g, "-"));
      } else if (match[0].includes("月")) {
        const now = new Date();
        dates.push(`${now.getFullYear()}-${match[1].padStart(2, "0")}-${match[2].padStart(2, "0")}`);
      } else {
        dates.push(match[0].replace(/\./g, "-"));
      }
    }
  }
  return [...new Set(dates)];
}

function extractAmounts(text: string): string[] {
  const amounts: string[] = [];
  for (const pattern of AMOUNT_PATTERNS) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      amounts.push(match[0]);
    }
  }
  return [...new Set(amounts)];
}

function detectCaseType(text: string): string {
  let bestType = "other";
  let bestScore = 0;

  for (const [type, keywords] of Object.entries(CASE_TYPE_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestType = type;
    }
  }

  return bestType;
}

function extractNames(text: string): string[] {
  // Simple Chinese name pattern: 2-3 character common surnames + given names
  const namePattern = /([李王张刘陈杨赵黄周吴徐孙马胡朱郭何罗高林郑梁谢唐许冯宋韩邓彭曹曾田萧潘袁蔡蒋余于杜叶程魏苏吕丁任卢姚沈崔钟谭陆汪范金石廖贾夏付方邹熊白孟秦邱侯江尹薛闫段雷龙黎史陶贺顾毛郝龚邵万钱严赖覃武莫孔汤向温常康施文牛樊]{1}[^，。、\s：:的了我是不一有在人来他]{1,2})/g;
  const names: string[] = [];
  let match;
  while ((match = namePattern.exec(text)) !== null) {
    if (match[1] && match[1].length >= 2 && match[1].length <= 3) {
      names.push(match[1]);
    }
  }
  return [...new Set(names)].slice(0, 5);
}

function extractPersonRoles(text: string, names: string[]): Array<{ name: string; role: string }> {
  const parties: Array<{ name: string; role: string }> = [];

  for (const name of names) {
    const beforeName = text.substring(
      Math.max(0, text.indexOf(name) - 30),
      text.indexOf(name)
    );

    if (beforeName.includes("原告") || beforeName.includes("起诉") || beforeName.includes("借给") || beforeName.includes("借出")) {
      parties.push({ name, role: "plaintiff" });
    } else if (beforeName.includes("被告") || beforeName.includes("被借") || beforeName.includes("欠") || beforeName.includes("还款")) {
      parties.push({ name, role: "defendant" });
    } else {
      parties.push({ name, role: "other" });
    }
  }

  return parties;
}

function generateTasks(caseType: string): Array<{ title: string; description: string; priority: string }> {
  const taskSets: Record<string, Array<{ title: string; description: string; priority: string }>> = {
    lending: [
      { title: "补齐被告身份信息", description: "获取身份证号、住址、联系方式", priority: "high" },
      { title: "整理转账凭证", description: "收集所有银行转账记录和截图", priority: "high" },
      { title: "核实借款合意", description: "确认借条、聊天记录中的借款意思表示", priority: "high" },
      { title: "计算利息", description: "根据约定利率和逾期时间计算利息", priority: "medium" },
      { title: "确认诉讼时效", description: "核实最后一次催款时间，确认时效是否中断", priority: "high" },
    ],
    labor: [
      { title: "确认劳动关系", description: "收集劳动合同、工资记录、工作证等", priority: "high" },
      { title: "整理工资流水", description: "获取完整工资发放记录", priority: "high" },
      { title: "计算补偿金", description: "根据工作年限和工资标准计算", priority: "high" },
      { title: "整理加班证据", description: "收集打卡记录、加班审批", priority: "medium" },
      { title: "准备仲裁申请书", description: "起草劳动仲裁申请书", priority: "medium" },
    ],
    family: [
      { title: "收集财产清单", description: "整理夫妻共同财产明细", priority: "high" },
      { title: "准备抚养方案", description: "拟定抚养权、抚养费、探视方案", priority: "high" },
      { title: "收集感情破裂证据", description: "整理分居、家暴、出轨等证据", priority: "medium" },
    ],
    other: [
      { title: "整理案件材料", description: "收集所有相关文件和证据", priority: "high" },
      { title: "明确法律依据", description: "查找适用的法律法规", priority: "medium" },
      { title: "起草法律文书", description: "根据案件类型起草相应文书", priority: "medium" },
    ],
  };

  return taskSets[caseType] ?? taskSets["other"];
}

function generateRiskWarnings(caseType: string, text: string): string[] {
  const risks: string[] = [];

  if (caseType === "lending") {
    if (!text.includes("借条") && !text.includes("欠条")) risks.push("缺少书面借款凭证");
    if (!text.includes("利息")) risks.push("利息约定不明确");
    if (!text.includes("身份证")) risks.push("被告身份信息缺失");
  } else if (caseType === "labor") {
    if (!text.includes("劳动合同")) risks.push("未签劳动合同");
    if (!text.includes("社保")) risks.push("未缴社保");
  } else if (caseType === "family") {
    risks.push("财产分割范围需明确");
    risks.push("抚养权争议需准备充分证据");
  }

  return risks;
}

export function mockAnalyze(text: string): AnalysisResult {
  const dates = extractDates(text);
  const amounts = extractAmounts(text);
  const caseType = detectCaseType(text);
  const names = extractNames(text);
  const personRoles = extractPersonRoles(text, names);

  // Build events from extracted dates
  const events = dates.slice(0, 5).map((date, i) => ({
    date,
    description: text.substring(
      Math.max(0, text.indexOf(date) - 10),
      Math.min(text.length, text.indexOf(date) + date.length + 60)
    ).trim() || `时间节点 ${i + 1}`,
    amount: i < amounts.length ? amounts[i] : "",
    persons: names.slice(0, 3).join(", "),
    tags: i === 0 ? ["关键节点"] : [],
    confidence: "medium",
  }));

  // Generate tasks based on case type
  const tasks = generateTasks(caseType).map((t) => ({
    ...t,
    confidence: "medium",
  }));

  // Generate risks
  const risks = generateRiskWarnings(caseType, text);

  // Generate missing info
  const missingInfo: string[] = [];
  if (!text.includes("身份证")) missingInfo.push("当事人身份信息不完整");
  if (!text.includes("证据") && !text.includes("截图")) missingInfo.push("缺少证据材料");
  if (dates.length === 0) missingInfo.push("缺少关键时间节点");

  // Build deadlines
  const deadlines = dates.slice(0, 2).map((date, i) => ({
    title: i === 0 ? "关键日期提醒" : "相关日期",
    date,
    type: "other" as const,
    confidence: "low",
  }));

  // Detect evidences
  const evidences: AnalysisResult["evidences"] = [];
  if (text.includes("转账") || text.includes("汇款")) {
    evidences.push({
      name: "转账记录",
      type: "document",
      purpose: "证明资金往来",
      confidence: "medium",
    });
  }
  if (text.includes("借条") || text.includes("欠条")) {
    evidences.push({
      name: "借条/欠条",
      type: "document",
      purpose: "证明借款合意及金额",
      confidence: "high",
    });
  }
  if (text.includes("聊天") || text.includes("微信")) {
    evidences.push({
      name: "聊天记录",
      type: "photo",
      purpose: "证明双方沟通内容",
      confidence: "medium",
    });
  }

  const typeLabels: Record<string, string> = {
    lending: "民间借贷纠纷",
    labor: "劳动争议",
    family: "婚姻家事",
    other: "其他",
  };

  return {
    events,
    deadlines,
    evidences,
    tasks,
    parties: personRoles.map((p) => ({ ...p, confidence: "medium" })),
    caseType,
    summary: `AI 判断本案为${typeLabels[caseType]}。建议收集更多材料后确认。`,
    risks,
    missingInfo,
    warnings: dates.length < 3 ? ["时间节点较少，建议补充更多材料"] : [],
  };
}
