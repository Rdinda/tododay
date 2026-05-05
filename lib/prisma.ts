import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

if (typeof window === "undefined") {
  if (process.env.NODE_ENV === "production") {
    const adapter = new PrismaBetterSqlite3({
      url: path.join(process.cwd(), "prisma", "dev.db")
    });
    prisma = new PrismaClient({
      adapter,
      log: ["error"],
    });
  } else {
    if (!globalForPrisma.prisma) {
      const adapter = new PrismaBetterSqlite3({
        url: path.join(process.cwd(), "prisma", "dev.db")
      });
      globalForPrisma.prisma = new PrismaClient({
        adapter,
        log: ["error", "warn"],
      });
    }
    prisma = globalForPrisma.prisma;
  }
} else {
  // Fallback for edge or client if inadvertently imported
  prisma = new PrismaClient();
}

export { prisma };
