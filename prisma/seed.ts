import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.aIResult.deleteMany();
  await prisma.documentDraft.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.deadline.deleteMany();
  await prisma.task.deleteMany();
  await prisma.event.deleteMany();
  await prisma.source.deleteMany();
  await prisma.party.deleteMany();
  await prisma.case.deleteMany();

  // Case 1: 张三民间借贷纠纷
  const case1 = await prisma.case.create({
    data: {
      name: "张三民间借贷纠纷",
      clientName: "张三",
      caseType: "lending",
      summary: "张三于2024年3月借给李四10万元，有借条和微信转账记录，约定年底还款，对方至今未还。",
      status: "active",
      riskLevel: "medium",
      stage: "准备起诉",
    },
  });

  await prisma.party.createMany({
    data: [
      { caseId: case1.id, name: "张三", role: "plaintiff", phone: "138****1234" },
      { caseId: case1.id, name: "李四", role: "defendant", address: "北京市朝阳区XX路XX号" },
    ],
  });

  await prisma.event.createMany({
    data: [
      { caseId: case1.id, date: "2024-03-01", description: "李四向张三借款100,000元，约定年利率10%", amount: "100000", persons: "张三, 李四", sourceIds: "src-001", confidence: "high", isConfirmed: true, tags: "转账,借款" },
      { caseId: case1.id, date: "2024-03-02", description: "双方微信确认借款用途及还款方式", persons: "张三, 李四", sourceIds: "src-003", confidence: "high", isConfirmed: true, tags: "确认" },
      { caseId: case1.id, date: "2024-12-31", description: "约定还款日到期，李四未还款", persons: "李四", sourceIds: "src-001", confidence: "high", isConfirmed: true, tags: "还款日,逾期" },
      { caseId: case1.id, date: "2025-01-15", description: "张三第一次催款，李四承诺月底还", persons: "张三, 李四", sourceIds: "src-003", confidence: "medium", isConfirmed: true, tags: "催款" },
      { caseId: case1.id, date: "2025-03-10", description: "张三咨询律师，决定通过法律途径解决", persons: "张三", confidence: "high", isConfirmed: true, tags: "咨询" },
      { caseId: case1.id, date: "2025-03-12", description: "整理证据材料，准备起诉", confidence: "high", isConfirmed: false, tags: "准备" },
    ],
  });

  await prisma.task.createMany({
    data: [
      { caseId: case1.id, title: "补齐被告身份信息", description: "获取李四身份证号及住址证明", dueDate: "2026-06-15", priority: "high", status: "in_progress", isAIGenerated: true },
      { caseId: case1.id, title: "整理转账凭证", description: "从银行获取完整转账流水并整理成证据", dueDate: "2026-06-18", priority: "high", status: "pending", isAIGenerated: true },
      { caseId: case1.id, title: "起草诉状", description: "根据案件事实起草民事起诉状", dueDate: "2026-06-25", priority: "medium", status: "pending", isAIGenerated: true },
    ],
  });

  await prisma.deadline.createMany({
    data: [
      { caseId: case1.id, title: "起诉期限提醒", date: "2026-12-31", type: "filing", isAIGenerated: true, isConfirmed: false },
      { caseId: case1.id, title: "被告身份信息补充截止", date: "2026-06-15", type: "other", isAIGenerated: true, isConfirmed: false },
    ],
  });

  await prisma.evidence.createMany({
    data: [
      { caseId: case1.id, name: "借条原件照片", type: "photo", purpose: "证明双方借款合意及金额", source: "客户2026-06-08上传截图", isAIGenerated: true, isConfirmed: true },
      { caseId: case1.id, name: "微信转账记录截图", type: "photo", purpose: "证明原告向被告交付借款100,000元", source: "客户2026-06-08上传截图", isAIGenerated: true, isConfirmed: true },
      { caseId: case1.id, name: "催款聊天记录", type: "photo", purpose: "证明逾期及催款事实", source: "客户2026-06-10上传", isAIGenerated: true, isConfirmed: false },
    ],
  });

  // Source for case 1
  const src1 = await prisma.source.create({
    data: { caseId: case1.id, type: "text", title: "聊天记录粘贴", content: "张三 2024-03-01: 李四，钱转过去了，10万\n李四 2024-03-01: 收到了，年底还你\n张三 2025-01-15: 李四，钱该还了\n李四 2025-01-15: 再给我一个月，一定还", status: "completed" },
  });

  // AI Results
  await prisma.aIResult.createMany({
    data: [
      { caseId: case1.id, sourceId: src1.id, type: "event", title: "新时间节点：2026-06-08 被告承诺还款", content: "从聊天截图中识别到被告在2026年6月8日承诺'给我一个月时间，一定还'，这个时间点属于诉讼时效中断事由，需要确认。", confidence: "high", status: "pending" },
      { caseId: case1.id, sourceId: src1.id, type: "evidence", title: "识别到新证据：2026-06对话截图", content: "新增6条聊天截图，已整理为3个时间节点，包括：被告承诺还款、原告催款、双方协商。待确认。", confidence: "high", status: "pending" },
      { caseId: case1.id, sourceId: src1.id, type: "risk", title: "证据链完整性提醒", content: "缺少完整银行流水和利息计算依据，建议补充。", confidence: "medium", status: "pending" },
    ],
  });

  // Case 2: 王女士劳动争议
  const case2 = await prisma.case.create({
    data: {
      name: "王女士劳动争议",
      clientName: "王女士",
      caseType: "labor",
      summary: "王女士2024年8月入职，2026年5月30日被公司口头辞退，未签书面劳动合同，未缴社保。",
      status: "active",
      riskLevel: "high",
      stage: "仲裁中",
    },
  });

  await prisma.party.createMany({
    data: [
      { caseId: case2.id, name: "王女士", role: "plaintiff" },
      { caseId: case2.id, name: "XX科技有限公司", role: "defendant" },
    ],
  });

  await prisma.task.createMany({
    data: [
      { caseId: case2.id, title: "确认仲裁时效", description: "核实解除劳动关系的具体日期，确认是否在仲裁时效内", dueDate: "2026-06-14", priority: "high", status: "in_progress", isAIGenerated: true },
      { caseId: case2.id, title: "整理工资流水", description: "获取2024年8月至2026年5月的完整工资记录", dueDate: "2026-06-16", priority: "high", status: "pending", isAIGenerated: true },
      { caseId: case2.id, title: "补充考勤证据", description: "收集打卡记录、工作群聊天、工作邮件等", dueDate: "2026-06-20", priority: "medium", status: "pending", isAIGenerated: true },
      { caseId: case2.id, title: "计算赔偿金额", description: "根据工作年限和工资标准计算经济补偿金", dueDate: "2026-06-22", priority: "medium", status: "pending", isAIGenerated: true },
      { caseId: case2.id, title: "整理证据目录", description: "整理仲裁申请书所需证据目录", dueDate: "2026-06-12", priority: "high", status: "pending", isAIGenerated: true },
    ],
  });

  await prisma.deadline.createMany({
    data: [
      { caseId: case2.id, title: "证据目录定稿", date: "2026-06-12", type: "filing", isAIGenerated: true, isConfirmed: true },
      { caseId: case2.id, title: "仲裁申请期限提醒", date: "2026-12-30", type: "filing", isAIGenerated: true, isConfirmed: false },
    ],
  });

  const src2 = await prisma.source.create({
    data: { caseId: case2.id, type: "text", title: "客户电话记录", content: "刚和王女士电话，她说2024年8月入职，2026年5月30日被公司口头辞退，没有书面通知，工资12000，每月微信转账，社保没交。", status: "completed" },
  });

  await prisma.aIResult.createMany({
    data: [
      { caseId: case2.id, sourceId: src2.id, type: "deadline", title: "解除通知日期为2026-06-08", content: "从截图识别到解除通知日期，可能影响仲裁期限。劳动争议仲裁时效为一年，需确认是否在时效内。", confidence: "medium", status: "pending" },
      { caseId: case2.id, sourceId: src2.id, type: "summary", title: "劳动争议案更新摘要", content: "案件类型：劳动争议。核心事实：2024年8月入职，月薪12,000元，2026年5月30日被口头辞退。待补充：劳动合同、社保记录、考勤记录。", confidence: "high", status: "pending" },
      { caseId: case2.id, sourceId: src2.id, type: "missing", title: "待补材料：未签劳动合同相关证据", content: "未签订书面劳动合同，需收集工资支付记录、工作证、考勤记录等证明劳动关系存在的材料。", confidence: "high", status: "pending" },
    ],
  });

  // Case 3: 李某离婚纠纷
  const case3 = await prisma.case.create({
    data: {
      name: "李某离婚纠纷",
      clientName: "李某",
      caseType: "family",
      summary: "李某与王某结婚8年，育有一子7岁，涉及房产分割和抚养权争议。",
      status: "active",
      riskLevel: "low",
      stage: "调解中",
    },
  });

  await prisma.party.createMany({
    data: [
      { caseId: case3.id, name: "李某", role: "plaintiff" },
      { caseId: case3.id, name: "王某", role: "defendant" },
    ],
  });

  await prisma.task.createMany({
    data: [
      { caseId: case3.id, title: "收集财产清单", description: "整理夫妻共同财产：房产、车辆、存款等", dueDate: "2026-06-20", priority: "medium", status: "pending", isAIGenerated: true },
      { caseId: case3.id, title: "准备子女抚养方案", description: "拟定抚养权归属、抚养费标准、探视权安排", dueDate: "2026-06-25", priority: "medium", status: "pending", isAIGenerated: true },
    ],
  });

  // Case 4: 赵某合同纠纷（已结案）
  await prisma.case.create({
    data: {
      name: "赵某合同纠纷",
      clientName: "赵某",
      caseType: "other",
      summary: "赵某与某装修公司合同纠纷，已调解结案。",
      status: "closed",
      riskLevel: "low",
      stage: "已结案",
    },
  });

  // Audit logs
  await prisma.auditLog.createMany({
    data: [
      { caseId: case1.id, action: "create", target: "case", targetId: case1.id, detail: "创建案件" },
      { caseId: case1.id, action: "import", target: "source", targetId: src1.id, detail: "导入聊天记录素材" },
      { caseId: case2.id, action: "create", target: "case", targetId: case2.id, detail: "创建案件" },
      { caseId: case3.id, action: "create", target: "case", targetId: case3.id, detail: "创建案件" },
    ],
  });

  console.log("Seed completed successfully!");
  console.log(`Created ${await prisma.case.count()} cases`);
  console.log(`Created ${await prisma.event.count()} events`);
  console.log(`Created ${await prisma.task.count()} tasks`);
  console.log(`Created ${await prisma.deadline.count()} deadlines`);
  console.log(`Created ${await prisma.aIResult.count()} AI results`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
