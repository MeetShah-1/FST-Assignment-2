import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("\x1b[36m%s\x1b[0m", "========================================================");
  console.log("\x1b[36m%s\x1b[0m", "  NEXUS CORE :: Automated Relational Seeding Pipeline   ");
  console.log("\x1b[36m%s\x1b[0m", "  CO4: Faker.js Relational Generation & Integrity Checks ");
  console.log("\x1b[36m%s\x1b[0m", "========================================================");

  console.log("\x1b[33m%s\x1b[0m", "-> Resetting existing relational tables...");
  // Clear tables in reverse dependency order
  await prisma.systemMetric.deleteMany({});
  await prisma.webhookEvent.deleteMany({});
  await prisma.emailDeliveryLog.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  console.log("\x1b[32m%s\x1b[0m", "-> Populating Multi-Tenant Organizations...");
  const orgDefinitions = [
    { name: "Nexus Cybernetics", slug: "nexus-cybernetics", tier: "ENTERPRISE", creditBalance: 250000.0, region: "us-east-va" },
    { name: "Aether Distributed Systems", slug: "aether-distributed", tier: "ENTERPRISE", creditBalance: 120000.0, region: "eu-central-fra" },
    { name: "Hypergate AI Labs", slug: "hypergate-ai", tier: "PRO", creditBalance: 45000.0, region: "ap-southeast-sg" },
    { name: "Vanguard Quant Research", slug: "vanguard-quant", tier: "PRO", creditBalance: 88000.0, region: "us-west-or" },
    { name: "Nova Micro-Compute", slug: "nova-micro", tier: "STARTER", creditBalance: 5000.0, region: "sa-east-sp" },
  ];

  const organizations = [];
  for (const org of orgDefinitions) {
    const created = await prisma.organization.create({ data: org });
    organizations.push(created);
  }

  console.log("\x1b[32m%s\x1b[0m", `-> Created ${organizations.length} Organizations.`);

  console.log("\x1b[32m%s\x1b[0m", "-> Seeding Deterministic RBAC Roles (Admin, Member, Guest)...");
  const primaryUsers = [
    {
      email: "admin@nexus.io",
      name: "Dr. Elena Vance (Lead Architect)",
      role: "ADMIN",
      status: "ACTIVE",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      organizationId: organizations[0].id,
    },
    {
      email: "member@nexus.io",
      name: "Marcus Aurelius Chen (Cluster Operator)",
      role: "MEMBER",
      status: "ACTIVE",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      organizationId: organizations[1].id,
    },
    {
      email: "guest@nexus.io",
      name: "Sora Takahashi (Read-Only Observer)",
      role: "GUEST",
      status: "ACTIVE",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      organizationId: organizations[2].id,
    },
  ];

  const seededUsers = [];
  for (const u of primaryUsers) {
    const user = await prisma.user.create({ data: u });
    seededUsers.push(user);
  }

  console.log("\x1b[32m%s\x1b[0m", "-> Generating Localized Relational Dummy Users with @faker-js/faker...");
  const roles = ["ADMIN", "MEMBER", "MEMBER", "MEMBER", "GUEST"];
  const statuses = ["ACTIVE", "ACTIVE", "ACTIVE", "SUSPENDED", "PENDING"];

  for (let i = 0; i < 22; i++) {
    const randomOrg = organizations[Math.floor(Math.random() * organizations.length)];
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName, provider: "nexus-mesh.net" }).toLowerCase();
    
    const user = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        role: roles[Math.floor(Math.random() * roles.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        avatar: `https://images.unsplash.com/photo-${1500000000000 + (i * 1234567) % 50000000}?w=150&auto=format&fit=crop&q=80`,
        organizationId: randomOrg.id,
      },
    });
    seededUsers.push(user);
  }

  console.log("\x1b[32m%s\x1b[0m", `-> Seeded ${seededUsers.length} total Users with strict foreign keys.`);

  console.log("\x1b[32m%s\x1b[0m", "-> Populating Relational Transactions with Foreign-Key Integrity...");
  const transactionTypes = ["INFRA_ALLOCATION", "WALLET_FUND", "API_CREDIT", "TRANSFER"];
  const transactionStatuses = ["COMPLETED", "COMPLETED", "COMPLETED", "PENDING", "FAILED"];
  const currencies = ["USD", "EUR", "GBP", "JPY"];

  const createdTransactions = [];
  for (let i = 0; i < 65; i++) {
    const randomUser = seededUsers[Math.floor(Math.random() * seededUsers.length)];
    const txType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const txStatus = transactionStatuses[Math.floor(Math.random() * transactionStatuses.length)];
    const amount = parseFloat((faker.number.float({ min: 45, max: 48500, fractionDigits: 2 })).toFixed(2));
    const refCode = `TXN-${faker.string.alphanumeric({ length: 4, casing: "upper" })}-${faker.string.alphanumeric({ length: 4, casing: "upper" })}`;

    const tx = await prisma.transaction.create({
      data: {
        referenceCode: refCode,
        amount,
        currency: currencies[Math.floor(Math.random() * currencies.length)],
        status: txStatus,
        type: txType,
        description: `${txType.replace("_", " ")}: ${faker.commerce.productName()} batch provision`,
        metadata: JSON.stringify({
          ip: faker.internet.ipv4(),
          clusterNode: `node-${faker.string.alphanumeric(3)}`,
          fakerBatchId: `batch_${i + 1}`,
        }),
        userId: randomUser.id,
        organizationId: randomUser.organizationId,
        createdAt: faker.date.recent({ days: 30 }),
      },
    });
    createdTransactions.push(tx);
  }

  console.log("\x1b[32m%s\x1b[0m", `-> Seeded ${createdTransactions.length} relational Transactions.`);

  console.log("\x1b[32m%s\x1b[0m", "-> Creating Immutable Compliance Audit Logs...");
  const auditActions = [
    "TRANSACTION_CREATED",
    "ROLE_ELEVATED",
    "SESSION_AUTHENTICATED",
    "FIREWALL_RULE_UPDATED",
    "CLUSTER_REBALANCED",
    "API_KEY_REVOKED",
    "WEBHOOK_DISPATCHED",
  ];
  const severities = ["INFO", "INFO", "WARNING", "CRITICAL"];

  for (let i = 0; i < 45; i++) {
    const randomUser = seededUsers[Math.floor(Math.random() * seededUsers.length)];
    const action = auditActions[Math.floor(Math.random() * auditActions.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];

    await prisma.auditLog.create({
      data: {
        action,
        entityType: action.startsWith("TRANSACTION") ? "TRANSACTION" : "SECURITY",
        entityId: `ENT-${faker.string.alphanumeric({ length: 8, casing: "upper" })}`,
        ipAddress: faker.internet.ipv4(),
        userAgent: faker.internet.userAgent(),
        severity,
        details: JSON.stringify({
          traceId: faker.string.uuid(),
          reason: faker.hacker.phrase(),
          latencyMs: faker.number.int({ min: 4, max: 210 }),
        }),
        userId: randomUser.id,
        createdAt: faker.date.recent({ days: 14 }),
      },
    });
  }

  console.log("\x1b[32m%s\x1b[0m", "-> Seeding Transactional Resend Email Lifecycle & Webhook Events...");
  const emailTemplates = ["TRANSACTION_RECEIPT", "SECURITY_ALERT", "ROLE_ELEVATION", "ORG_INVITE"];
  const emailStatuses = ["DELIVERED", "DELIVERED", "OPENED", "SENT", "BOUNCED"];

  for (let i = 0; i < 30; i++) {
    const recipient = faker.internet.email().toLowerCase();
    const template = emailTemplates[Math.floor(Math.random() * emailTemplates.length)];
    const status = emailStatuses[Math.floor(Math.random() * emailStatuses.length)];
    const resendId = `re_${faker.string.alphanumeric(18)}`;

    const emailLog = await prisma.emailDeliveryLog.create({
      data: {
        resendId,
        recipient,
        subject: template === "TRANSACTION_RECEIPT" 
          ? `[Receipt] Infrastructure Quota TXN-${faker.string.alphanumeric(4).toUpperCase()}` 
          : template === "SECURITY_ALERT"
          ? `[URGENT] Security Alert: Multi-Tenant Access Anomaly`
          : `[Nexus Cloud] Notification for ${recipient}`,
        templateType: template,
        status,
        bounceReason: status === "BOUNCED" ? "550 5.1.1 User unknown: address rejected" : null,
        eventsCount: status === "DELIVERED" ? 2 : status === "OPENED" ? 3 : 1,
        metadata: JSON.stringify({
          provider: "Resend",
          spf: "pass",
          dkim: "pass",
        }),
        createdAt: faker.date.recent({ days: 10 }),
      },
    });

    // Also seed corresponding Resend Webhook Event
    await prisma.webhookEvent.create({
      data: {
        provider: "RESEND",
        eventType: `email.${status.toLowerCase()}`,
        payload: JSON.stringify({
          type: `email.${status.toLowerCase()}`,
          created_at: new Date().toISOString(),
          data: {
            email_id: resendId,
            to: [recipient],
            from: "onboarding@resend.dev",
            subject: emailLog.subject,
          },
        }),
        signature: `t=${Date.now()},v1=${faker.string.hexadecimal({ length: 32, prefix: "" })}`,
        status: "PROCESSED",
        processedAt: new Date(),
        createdAt: emailLog.createdAt,
      },
    });
  }

  console.log("\x1b[35m%s\x1b[0m", "-> Populating High-Throughput Edge Telemetry Metrics...");
  const metricTypes = ["edge_proxy_latency_ms", "prisma_mutation_duration_ms", "cache_hit_ratio"];
  for (let i = 0; i < 20; i++) {
    const metricKey = metricTypes[i % metricTypes.length];
    await prisma.systemMetric.create({
      data: {
        metricKey,
        value: metricKey.includes("ratio") ? 0.94 + (Math.random() * 0.05) : Math.floor(Math.random() * 65) + 12,
        unit: metricKey.includes("ratio") ? "ratio" : "ms",
      },
    });
  }

  console.log("\x1b[36m%s\x1b[0m", "========================================================");
  console.log("\x1b[32m%s\x1b[0m", "  AUTOMATED SEEDING COMPLETED SUCCESSFULLY!              ");
  console.log("\x1b[36m%s\x1b[0m", "  - Organizations:  " + organizations.length);
  console.log("\x1b[36m%s\x1b[0m", "  - Users:          " + seededUsers.length);
  console.log("\x1b[36m%s\x1b[0m", "  - Transactions:   " + createdTransactions.length);
  console.log("\x1b[36m%s\x1b[0m", "  - Audit Logs:     45");
  console.log("\x1b[36m%s\x1b[0m", "  - Email Logs:     30");
  console.log("\x1b[36m%s\x1b[0m", "  - Webhook Events: 30");
  console.log("\x1b[36m%s\x1b[0m", "========================================================");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
