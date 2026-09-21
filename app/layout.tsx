import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import CommandPalette from "@/components/command-palette";

export const metadata: Metadata = {
  title: "NEXUS QUANTUM // Relational Seeding & Resend Lifecycle Engine",
  description:
    "Autonomous Cloud Infrastructure, Relational Faker.js Seeder, Edge Middleware RBAC, and Resend Webhook Ingestion Engine.",
  openGraph: {
    title: "NEXUS QUANTUM // Relational Seeding & Resend Lifecycle Engine",
    description: "Multi-tenant Next.js App Router, Prisma ORM, Edge RBAC, and React Email Studio",
    images: ["/api/og?title=NEXUS+QUANTUM+CLOUD&role=ADMIN"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#05070e] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        <Navbar />
        <CommandPalette />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
