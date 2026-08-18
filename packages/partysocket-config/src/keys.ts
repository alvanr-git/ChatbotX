import { createEnv } from "@t3-oss/env-core"
import z from "zod"

export const keys = () =>
  createEnv({
    server: {
      REALTIME_BROADCAST_SECRET: z
        .string()
        .transform((val) => (val.length < 32 ? "change-me-in-production-at-least-32-chars" : val))
        .pipe(z.string().min(32))
        .default("change-me-in-production-at-least-32-chars"),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
    skipValidation: process.env.SKIP_ENV_CHECK === "true",
  })

export const env = keys()
