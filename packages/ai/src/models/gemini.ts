import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"

export const geminiEmbeddingModels = z.enum(["text-embedding-004"])
export type GeminiEmbeddingModel = z.infer<typeof geminiEmbeddingModels>

export const geminiModels = z.enum([
  "gemini-3.6-flash",
  "gemini-3.6",
  "gemini-3-pro-image-preview",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash-thinking-exp",
  "gemini-3-flash",
  "gemini-3.1-pro-preview",
])
export type GeminiModel = z.infer<typeof geminiModels>

export const DEFAULT_GEMINI_MODEL: GeminiModel = "gemini-3.6-flash"
export const GEMINI_FALLBACK_MODELS: string[] = [
  "gemini-3.6-flash",
  "gemini-3.6",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-flash",
]

export const geminiAnalyzeImageModelOptions: {
  label: string
  value: GeminiModel
}[] = [
  {
    label: "Gemini 3.6 Flash",
    value: geminiModels.enum["gemini-3.6-flash"],
  },
  {
    label: "Gemini 3.5 Flash",
    value: geminiModels.enum["gemini-3.5-flash"],
  },
  {
    label: "Gemini 3.1 Flash Lite",
    value: geminiModels.enum["gemini-3.1-flash-lite"],
  },
  {
    label: "Gemini 3 Flash",
    value: geminiModels.enum["gemini-3-flash"],
  },
  {
    label: "Gemini 3.1 Pro Preview",
    value: geminiModels.enum["gemini-3.1-pro-preview"],
  },
  {
    label: "Gemini 2.5 Flash-Lite",
    value: geminiModels.enum["gemini-2.5-flash-lite"],
  },
  {
    label: "Gemini 2.5 Flash",
    value: geminiModels.enum["gemini-2.5-flash"],
  },
  {
    label: "Gemini 2.5 Pro",
    value: geminiModels.enum["gemini-2.5-pro"],
  },
]

export const geminiModelOptions: { label: string; value: GeminiModel }[] = [
  {
    label: "Gemini 3.6 Flash",
    value: geminiModels.enum["gemini-3.6-flash"],
  },
  {
    label: "Gemini 3.5 Flash",
    value: geminiModels.enum["gemini-3.5-flash"],
  },
  {
    label: "Gemini 3.1 Pro Preview",
    value: geminiModels.enum["gemini-3.1-pro-preview"],
  },
  {
    label: "Gemini 3.1 Flash Lite",
    value: geminiModels.enum["gemini-3.1-flash-lite"],
  },
  {
    label: "Gemini 3 Flash",
    value: geminiModels.enum["gemini-3-flash"],
  },
  {
    label: "Gemini 2.5 Flash Lite",
    value: geminiModels.enum["gemini-2.5-flash-lite"],
  },
  {
    label: "Gemini 2.5 Flash",
    value: geminiModels.enum["gemini-2.5-flash"],
  },
  {
    label: "Gemini 2.5 Pro",
    value: geminiModels.enum["gemini-2.5-pro"],
  },
  {
    label: "Gemini 2.0 Flash Thinking",
    value: geminiModels.enum["gemini-2.0-flash-thinking-exp"],
  },
]

export const geminiImageModels = z.enum(["gemini-3.1-flash-image-preview"])
export type GeminiImageModel = z.infer<typeof geminiImageModels>

export const geminiImageModelOptions: {
  label: string
  value: GeminiImageModel
}[] = [
  {
    label: "Imagen 3",
    value: geminiImageModels.enum["gemini-3.1-flash-image-preview"],
  },
]

/**
 * Helper to invoke generateObject using Gemini 3.6 (or user requested Gemini version)
 * with automatic fallback to older/newer working versions if the primary model is deprecated or unsupported.
 */
export async function generateObjectWithGeminiFallback(
  options: Record<string, unknown> & {
    preferredModel?: string
  },
) {
  const { preferredModel: _p, ...rawOptions } = options
  const primaryModel = options.preferredModel || DEFAULT_GEMINI_MODEL
  const modelsToTry = [
    primaryModel,
    ...GEMINI_FALLBACK_MODELS.filter((m) => m !== primaryModel),
  ]

  let lastError: unknown = null
  for (const modelName of modelsToTry) {
    try {
      return await generateObject({
        ...(rawOptions as unknown as Parameters<typeof generateObject>[0]),
        model: google(modelName) as unknown as Parameters<
          typeof generateObject
        >[0]["model"],
      })
    } catch (err: unknown) {
      lastError = err
      const errorMessage = err instanceof Error ? err.message : String(err)
      const isDeprecateOrNotFoundError =
        errorMessage.includes("not found") ||
        errorMessage.includes("deprecated") ||
        errorMessage.includes("404") ||
        errorMessage.includes("invalid") ||
        errorMessage.includes("unsupported")
      if (!isDeprecateOrNotFoundError) {
        throw err
      }
    }
  }
  throw lastError
}
