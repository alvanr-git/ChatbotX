import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const keys = () =>
  createEnv({
    server: {
      REDIS_URL: z.url().default("redis://localhost:6379"),
      NEXT_PHASE: z.string().default(""),
    },
    runtimeEnv: {
      REDIS_URL: process.env.REDIS_URL,
      NEXT_PHASE: process.env.NEXT_PHASE,
    },
    emptyStringAsUndefined: true,
    skipValidation:
      process.env.SKIP_ENV_CHECK === "true" ||
      process.env.SKIP_ENV_CHECK === "1" ||
      process.env.NEXT_PHASE === "phase-production-build",
  })
