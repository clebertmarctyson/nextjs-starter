import { PrismaClient } from "@/lib/generated/prisma-bot/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.BOT_DATABASE_URL,
});

const prismaBot = new PrismaClient({ adapter });

export default prismaBot;
