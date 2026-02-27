import "dotenv/config";

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma-bot/schema.prisma",
  datasource: {
    url: env("BOT_DATABASE_URL"),
  },
});
