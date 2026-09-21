import { prisma } from "@/lib/prisma";
import DashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 1. Fetch live relational metrics from Prisma ORM
  const [
    orgsCount,
    usersCount,
    transactions,
    auditLogs,
    emailLogs,
    webhookEvents,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.transaction.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
      include: { user: true, organization: true },
    }),
    prisma.auditLog.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.emailDeliveryLog.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
    prisma.webhookEvent.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalVolume = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const deliveredEmails = emailLogs.filter((e) => e.status === "DELIVERED" || e.status === "OPENED").length;
  const deliveryRate = emailLogs.length > 0 ? Math.round((deliveredEmails / emailLogs.length) * 100) : 100;

  const initialStats = {
    orgsCount,
    usersCount,
    txCount: transactions.length,
    auditCount: auditLogs.length,
    emailCount: emailLogs.length,
    webhookCount: webhookEvents.length,
    totalVolume,
    deliveryRate,
  };

  const entityStats = {
    organizations: orgsCount,
    users: usersCount,
    transactions: transactions.length,
    auditLogs: auditLogs.length,
    emailLogs: emailLogs.length,
    webhooks: webhookEvents.length,
  };

  return (
    <DashboardClient
      initialStats={initialStats}
      entityStats={entityStats}
      initialTransactions={transactions as any}
      initialAudits={auditLogs as any}
      initialEmailLogs={emailLogs as any}
      initialWebhooks={webhookEvents as any}
    />
  );
}
