const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const {
  connectDatabase,
  disconnectDatabase,
} = require("../config/db");
const User = require("../models/User");
const AIApplication = require("../models/AIApplication");
const Decision = require("../models/Decision");
const DecisionEvent = require("../models/DecisionEvent");
const Evidence = require("../models/Evidence");
const HumanReview = require("../models/HumanReview");

const seededUsers = [
  {
    name: "Avery Morgan",
    email: "admin@decisiontrace.example",
    password: "AdminPass!2025",
    role: "admin",
  },
  {
    name: "Jordan Lee",
    email: "developer@decisiontrace.example",
    password: "DeveloperPass!2025",
    role: "developer",
  },
  {
    name: "Taylor Singh",
    email: "reviewer@decisiontrace.example",
    password: "ReviewerPass!2025",
    role: "reviewer",
  },
];

const applicationDefinitions = [
  {
    name: "AI Recruitment Evaluator",
    description: "Evaluates fictional candidate profiles against role requirements.",
    ownerEmail: seededUsers[1].email,
    environment: "production",
    apiKey: "dt_seed_lighthouse_2025",
  },
  {
    name: "Customer Support Classifier",
    description: "Classifies fictional customer support requests and recommends routing.",
    ownerEmail: seededUsers[1].email,
    environment: "staging",
    apiKey: "dt_seed_northstar_2025",
  },
  {
    name: "Document Risk Analyzer",
    description: "Analyzes fictional documents for operational and compliance risk.",
    ownerEmail: seededUsers[1].email,
    environment: "production",
    apiKey: "dt_seed_atlas_2025",
  },
];

const decisionDefinitions = [
  {
    externalDecisionId: "seed-lighthouse-0001",
    app: 0,
    input: { ticketId: "SUP-1842", text: "The checkout page charges me twice for one order.", language: "en" },
    output: { category: "billing", priority: "high", queue: "payments" },
    status: "completed",
    confidence: 0.97,
    riskLevel: "low",
    riskFlags: [],
    model: ["OpenAI", "gpt-4o-mini", "2025-02"],
    startedAt: "2025-02-03T09:14:00.000Z",
    completedAt: "2025-02-03T09:14:02.418Z",
    evidence: [
      ["Duplicate-charge examples", "payments/runbook.md", "Historical duplicate-charge tickets are routed to the payments queue.", 0.96],
      ["Ticket language signal", "classifier/features/v3", "The phrase 'charged me twice' is a strong billing-intent feature.", 0.91],
    ],
  },
  {
    externalDecisionId: "seed-lighthouse-0002",
    app: 0,
    input: { ticketId: "SUP-1849", text: "Can I change the delivery address after placing my order?", language: "en" },
    output: { category: "order-change", priority: "normal", queue: "orders" },
    status: "reviewed",
    confidence: 0.89,
    riskLevel: "medium",
    riskFlags: ["address-change-policy"],
    model: ["OpenAI", "gpt-4o-mini", "2025-02"],
    startedAt: "2025-02-03T10:22:00.000Z",
    completedAt: "2025-02-03T10:22:01.902Z",
    evidence: [
      ["Address change policy", "help-center/order-addresses", "Address changes are permitted only before carrier handoff.", 0.88],
    ],
  },
  {
    externalDecisionId: "seed-lighthouse-0003",
    app: 0,
    input: { ticketId: "SUP-1910", text: "My account was locked after I reported an unfamiliar login.", language: "en" },
    output: { category: "account-security", priority: "urgent", queue: "trust-and-safety" },
    status: "flagged",
    confidence: 0.82,
    riskLevel: "high",
    riskFlags: ["possible-account-takeover", "requires-human-contact"],
    model: ["Anthropic", "claude-3-5-sonnet", "2025-01"],
    startedAt: "2025-02-04T15:08:00.000Z",
    completedAt: "2025-02-04T15:08:03.771Z",
    evidence: [
      ["Security escalation policy", "trust/suspicious-login-v2", "Unfamiliar login reports must be handled by the trust team.", 0.99],
      ["Account lock signal", "risk/features/account-lock", "A lock immediately following a suspicious-login report indicates elevated risk.", 0.94],
    ],
  },
  {
    externalDecisionId: "seed-lighthouse-0004",
    app: 0,
    input: { ticketId: "SUP-1955", text: "The replacement item arrived damaged too.", language: "en" },
    output: { category: "returns", priority: "high", queue: "fulfillment" },
    status: "completed",
    confidence: 0.93,
    riskLevel: "medium",
    riskFlags: ["repeat-failure"],
    model: ["OpenAI", "gpt-4o-mini", "2025-02"],
    startedAt: "2025-02-05T11:40:00.000Z",
    completedAt: "2025-02-05T11:40:02.113Z",
    evidence: [
      ["Replacement exception policy", "fulfillment/replacement-exceptions", "A second damaged shipment qualifies for specialist handling.", 0.9],
    ],
  },
  {
    externalDecisionId: "seed-northstar-0001",
    app: 1,
    input: { applicantId: "APP-7001", annualIncome: 92000, requestedLimit: 12000, debtToIncome: 0.21, region: "US-CA" },
    output: { recommendation: "approve", suggestedLimit: 10000, reasonCodes: ["stable-income", "low-dti"] },
    status: "reviewed",
    confidence: 0.91,
    riskLevel: "medium",
    riskFlags: ["regulated-credit-decision"],
    model: ["Northstar ML", "underwriting-score", "3.8.1"],
    startedAt: "2025-02-06T13:02:00.000Z",
    completedAt: "2025-02-06T13:02:04.505Z",
    evidence: [
      ["Income verification", "bureau/income/APP-7001", "Verified annual income is $92,000 with 24 months of continuity.", 0.98],
      ["Affordability policy", "credit/policy-v6", "Applicants below 30% debt-to-income may receive standard limits.", 0.92],
    ],
  },
  {
    externalDecisionId: "seed-northstar-0002",
    app: 1,
    input: { applicantId: "APP-7002", annualIncome: 51000, requestedLimit: 25000, debtToIncome: 0.48, region: "US-TX" },
    output: { recommendation: "refer", suggestedLimit: null, reasonCodes: ["high-dti", "limit-mismatch"] },
    status: "reviewed",
    confidence: 0.86,
    riskLevel: "high",
    riskFlags: ["regulated-credit-decision", "manual-income-review"],
    model: ["Northstar ML", "underwriting-score", "3.8.1"],
    startedAt: "2025-02-06T13:16:00.000Z",
    completedAt: "2025-02-06T13:16:05.204Z",
    evidence: [
      ["Debt-to-income threshold", "credit/policy-v6", "DTI above 45% requires manual underwriting review.", 0.97],
    ],
  },
  {
    externalDecisionId: "seed-northstar-0003",
    app: 1,
    input: { applicantId: "APP-7003", annualIncome: 68000, requestedLimit: 8000, debtToIncome: 0.29, region: "US-NY" },
    output: { recommendation: "approve", suggestedLimit: 8000, reasonCodes: ["within-policy"] },
    status: "completed",
    confidence: 0.95,
    riskLevel: "low",
    riskFlags: ["regulated-credit-decision"],
    model: ["Northstar ML", "underwriting-score", "3.8.1"],
    startedAt: "2025-02-07T08:31:00.000Z",
    completedAt: "2025-02-07T08:31:03.990Z",
    evidence: [
      ["Affordability policy", "credit/policy-v6", "Income, requested limit, and DTI fall within the standard approval band.", 0.95],
    ],
  },
  {
    externalDecisionId: "seed-atlas-0001",
    app: 2,
    input: { contentId: "POST-4401", text: "Here is how to bypass the game's payment checks.", locale: "en-US" },
    output: { action: "remove", labels: ["fraud-enablement", "evasion"] },
    status: "reviewed",
    confidence: 0.98,
    riskLevel: "critical",
    riskFlags: ["financial-abuse", "instructional-content"],
    model: ["Guardrail Labs", "content-guard", "2.4.0"],
    startedAt: "2025-02-07T16:04:00.000Z",
    completedAt: "2025-02-07T16:04:01.309Z",
    evidence: [
      ["Safety policy match", "policy/financial-abuse-2025", "Instructions to evade payment controls are disallowed.", 0.99],
      ["Phrase similarity", "moderation/embeddings-v12", "The content matches known payment-evasion examples.", 0.97],
    ],
  },
  {
    externalDecisionId: "seed-atlas-0002",
    app: 2,
    input: { contentId: "POST-4408", text: "I disagree with the new update; the old layout was much easier to use.", locale: "en-US" },
    output: { action: "allow", labels: ["product-feedback"] },
    status: "completed",
    confidence: 0.94,
    riskLevel: "low",
    riskFlags: [],
    model: ["Guardrail Labs", "content-guard", "2.4.0"],
    startedAt: "2025-02-08T09:12:00.000Z",
    completedAt: "2025-02-08T09:12:00.841Z",
    evidence: [
      ["Civility policy", "policy/community-civility-2025", "The post expresses dissatisfaction without a personal attack or threat.", 0.94],
    ],
  },
  {
    externalDecisionId: "seed-atlas-0003",
    app: 2,
    input: { contentId: "POST-4412", text: "I know where you live. Watch your back.", locale: "en-US" },
    output: { action: "escalate", labels: ["threat", "targeted-harassment"] },
    status: "flagged",
    confidence: 0.9,
    riskLevel: "critical",
    riskFlags: ["credible-threat", "urgent-human-review"],
    model: ["Guardrail Labs", "content-guard", "2.4.0"],
    startedAt: "2025-02-08T09:25:00.000Z",
    completedAt: "2025-02-08T09:25:01.541Z",
    evidence: [
      ["Threat policy", "policy/threats-2025", "Direct statements about locating a person and retaliation require escalation.", 0.98],
    ],
  },
];

function eventTimestamp(startedAt, offsetSeconds) {
  return new Date(new Date(startedAt).getTime() + offsetSeconds * 1000);
}

async function seed() {
  await connectDatabase();

  const seededEmails = seededUsers.map((user) => user.email);
  const seededDecisionIds = decisionDefinitions.map((decision) => decision.externalDecisionId);
  const applicationNames = applicationDefinitions.map((application) => application.name);

  const existingUsers = await User.find({ email: { $in: seededEmails } }).select("_id email");
  const existingUserIds = existingUsers.map((user) => user._id);
  const existingApplications = await AIApplication.find({
    $or: [
      { name: { $in: applicationNames } },
      ...(existingUserIds.length ? [{ owner: { $in: existingUserIds } }] : []),
    ],
  }).select("_id");
  const existingApplicationIds = existingApplications.map((application) => application._id);
  const existingDecisions = await Decision.find({
    $or: [
      { externalDecisionId: { $in: seededDecisionIds } },
      ...(existingApplicationIds.length ? [{ application: { $in: existingApplicationIds } }] : []),
    ],
  }).select("_id");
  const existingDecisionIds = existingDecisions.map((decision) => decision._id);

  if (existingDecisionIds.length) {
    await Promise.all([
      DecisionEvent.deleteMany({ decision: { $in: existingDecisionIds } }),
      Evidence.deleteMany({ decision: { $in: existingDecisionIds } }),
      HumanReview.deleteMany({ decision: { $in: existingDecisionIds } }),
    ]);
    await Decision.deleteMany({ _id: { $in: existingDecisionIds } });
  }
  await AIApplication.deleteMany({
    $or: [
      { name: { $in: applicationNames } },
      ...(existingUserIds.length ? [{ owner: { $in: existingUserIds } }] : []),
    ],
  });
  await User.deleteMany({ email: { $in: seededEmails } });

  const passwordHashes = await Promise.all(
    seededUsers.map((user) => bcrypt.hash(user.password, 12))
  );
  const users = await User.insertMany(
    seededUsers.map((user, index) => ({
      name: user.name,
      email: user.email,
      passwordHash: passwordHashes[index],
      role: user.role,
      isActive: true,
    }))
  );
  const usersByEmail = new Map(users.map((user) => [user.email, user]));

  const applications = await AIApplication.insertMany(
    applicationDefinitions.map((application) => ({
      name: application.name,
      description: application.description,
      owner: usersByEmail.get(application.ownerEmail)._id,
      apiKeyHash: crypto.createHash("sha256").update(application.apiKey).digest("hex"),
      status: "active",
      environment: application.environment,
    }))
  );

  const decisions = await Decision.insertMany(
    decisionDefinitions.map((definition) => ({
      application: applications[definition.app]._id,
      createdBy: usersByEmail.get(seededUsers[1].email)._id,
      externalDecisionId: definition.externalDecisionId,
      title: `Seeded decision ${definition.externalDecisionId}`,
      category: definition.app === 0 ? "support" : definition.app === 1 ? "credit" : "content-risk",
      inputSummary: JSON.stringify(definition.input),
      input: definition.input,
      output: definition.output,
      status: definition.status,
      confidence: definition.confidence,
      riskLevel: definition.riskLevel,
      riskFlags: definition.riskFlags,
      model: {
        provider: definition.model[0],
        name: definition.model[1],
        version: definition.model[2],
      },
      startedAt: new Date(definition.startedAt),
      completedAt: new Date(definition.completedAt),
      createdAt: new Date(definition.startedAt),
      updatedAt: new Date(definition.completedAt),
    }))
  );

  const eventTypes = ["input", "processing", "evidence", "decision"];
  const events = [];
  const evidence = [];
  decisionDefinitions.forEach((definition, index) => {
    const decision = decisions[index];
    const start = new Date(definition.startedAt);
    const steps = [
      ["Input received", "input", "The application accepted and normalized the request.", { fields: Object.keys(definition.input) }],
      ["Model evaluated request", "processing", "The configured model generated a candidate outcome.", { model: definition.model[1] }],
      ["Evidence attached", "evidence", "Relevant policy and operational evidence was collected.", { count: definition.evidence.length }],
      ["Decision recorded", "decision", "The outcome and risk assessment were persisted for audit.", { status: definition.status, riskLevel: definition.riskLevel }],
    ];
    steps.forEach((step, sequence) => {
      events.push({
        decision: decision._id,
        sequence,
        type: eventTypes[sequence],
        name: step[0],
        description: step[2],
        data: step[3],
        timestamp: eventTimestamp(start, sequence * 0.7),
        durationMs: sequence === 0 ? 12 : sequence === 1 ? 1480 : 40,
      });
    });
    definition.evidence.forEach((item) => {
      evidence.push({
        decision: decision._id,
        title: item[0],
        source: item[1],
        content: item[2],
        relevanceScore: item[3],
        evidenceType: "policy",
        metadata: { seeded: true },
      });
    });
  });
  await Promise.all([DecisionEvent.insertMany(events), Evidence.insertMany(evidence)]);

  const reviewer = usersByEmail.get("reviewer@decisiontrace.example");
  const completedReviews = [
    [1, "approved", "Classification matches the ticket and the address-change caveat is correctly flagged.", null, "2025-02-03T12:10:00.000Z"],
    [4, "modified", "Approve only after confirming the applicant's income source.", { recommendation: "refer", suggestedLimit: null, reasonCodes: ["manual-income-review"] }, "2025-02-06T15:20:00.000Z"],
    [5, "rejected", "The recommendation is appropriately conservative, but the application must not be auto-declined.", { recommendation: "refer", suggestedLimit: null, reasonCodes: ["high-dti", "limit-mismatch"] }, "2025-02-06T16:05:00.000Z"],
    [7, "approved", "Removal is supported by the financial-abuse policy and matching evidence.", null, "2025-02-07T17:12:00.000Z"],
  ];
  await HumanReview.insertMany(
    completedReviews.map(([decisionIndex, status, comment, modifiedOutput, reviewedAt]) => ({
      decision: decisions[decisionIndex]._id,
      reviewer: reviewer._id,
      action: status === "approved" ? "approve" : status === "rejected" ? "reject" : "modify",
      status,
      comment,
      modifiedOutput,
      reviewedAt: new Date(reviewedAt),
      createdAt: new Date(reviewedAt),
      updatedAt: new Date(reviewedAt),
    }))
  );

  console.log(`Seeded ${users.length} users, ${applications.length} applications, ${decisions.length} decisions, ${events.length} events, ${evidence.length} evidence records, and ${completedReviews.length} reviews.`);
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
