"use server";

import { revalidatePath } from "next/cache";
import { faker } from "@faker-js/faker";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/session";

export async function triggerDynamicSeedAction(count = 15) {
  try {
    const session = await getServerSession();
    if (session.role === "GUEST") {
      return {
        success: false,
        error: "GUEST accounts cannot initiate database batch seeding.",
      };
    }

    const organizations = await prisma.organization.findMany();
    if (organizations.length === 0) {
      return { success: false, error: "Please run initial CLI seed first." };
    }

    const roles = ["MEMBER", "MEMBER", "ADMIN", "GUEST"];
    const statuses = ["ACTIVE", "ACTIVE", "ACTIVE", "SUSPENDED"];
    const types = ["INFRA_ALLOCATION", "WALLET_FUND", "API_CREDIT", "TRANSFER"];
    const currencies = ["USD", "EUR", "GBP", "JPY"];

    let usersCreated = 0;
    let txCreated = 0;

    for (let i = 0; i < count; i++) {
      const org = organizations[Math.floor(Math.random() * organizations.length)];
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName, provider: "nexus-mesh.net" }).toLowerCase();

      const user = await prisma.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          role: roles[Math.floor(Math.random() * roles.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          avatar: `https://images.unsplash.com/photo-${1500000000000 + (Math.floor(Math.random() * 50000000))}?w=150&auto=format&fit=crop&q=80`,
          organizationId: org.id,
        },
      });
      usersCreated++;

      const amount = parseFloat(faker.number.float({ min: 100, max: 25000, fractionDigits: 2 }).toFixed(2));
      const refCode = `TXN-${faker.string.alphanumeric({ length: 4, casing: "upper" })}-${faker.string.alphanumeric({ length: 4, casing: "upper" })}`;

      await prisma.transaction.create({
        data: {
          referenceCode: refCode,
          amount,
          currency: currencies[Math.floor(Math.random() * currencies.length)],
          status: "COMPLETED",
          type: types[Math.floor(Math.random() * types.length)],
          description: `Automated Faker batch provision: ${faker.commerce.productName()}`,
          userId: user.id,
          organizationId: org.id,
        },
      });
      txCreated++;
    }

    // Log seed event in audit log
    await prisma.auditLog.create({
      data: {
        action: "DYNAMIC_SEED_EXECUTED",
        entityType: "SYSTEM",
        entityId: `SEED-${Date.now()}`,
        ipAddress: "127.0.0.1",
        userAgent: "NextJSServerAction/FakerJS",
        severity: "INFO",
        details: JSON.stringify({
          batchCount: count,
          usersCreated,
          transactionsCreated: txCreated,
          actor: session.email,
        }),
      },
    });

    revalidatePath("/");

    return {
      success: true,
      message: `Generated ${usersCreated} relational Users and ${txCreated} Transactions with Faker.js!`,
      usersCreated,
      txCreated,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Dynamic seeding failed",
    };
  }
}

export async function resetDatabaseAction() {
  try {
    const session = await getServerSession();
    if (session.role !== "ADMIN") {
      return {
        success: false,
        error: "FORBIDDEN: Only ADMIN role can trigger full relational database purge.",
      };
    }

    // Delete in reverse relational order
    await prisma.systemMetric.deleteMany({});
    await prisma.webhookEvent.deleteMany({});
    await prisma.emailDeliveryLog.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.organization.deleteMany({});

    // Log the purge
    await prisma.auditLog.create({
      data: {
        action: "DATABASE_PURGED",
        entityType: "SYSTEM",
        entityId: "SYSTEM_PURGE",
        severity: "CRITICAL",
        details: JSON.stringify({ actor: session.email, timestamp: new Date().toISOString() }),
      },
    });

    revalidatePath("/");
    return {
      success: true,
      message: "Database successfully cleared. Ready for re-seeding.",
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
