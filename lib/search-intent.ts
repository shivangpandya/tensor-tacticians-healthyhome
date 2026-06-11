import { z } from "zod";
import type { SearchIntent } from "@/lib/types";

export const searchIntentSchema = z.object({
  propertyType: z.enum(["rental", "home"]).default("rental"),
  maxRent: z.coerce.number().int().positive().max(10000).default(2000),
  locationLabel: z.string().min(1).default("04043 + 10 miles"),
  radiusMiles: z.coerce.number().positive().max(100).default(10),
  beds: z.coerce.number().int().positive().max(8).optional(),
  transitPreference: z.enum(["required", "preferred", "any"]).default("preferred"),
  healthPriorities: z
    .array(
      z.enum([
        "low_diabetes",
        "high_preventive_care",
        "primary_care_access",
        "low_uninsured",
        "air_quality",
        "affordability",
        "transit"
      ])
    )
    .default(["low_diabetes", "high_preventive_care", "primary_care_access"]),
  weights: z
    .object({
      health: z.coerce.number().min(0).max(10).default(0.58),
      affordability: z.coerce.number().min(0).max(10).default(0.16),
      transit: z.coerce.number().min(0).max(10).default(0.12),
      careAccess: z.coerce.number().min(0).max(10).default(0.14)
    })
    .default({
      health: 0.58,
      affordability: 0.16,
      transit: 0.12,
      careAccess: 0.14
    }),
  confidence: z.coerce.number().min(0).max(1).default(0.75),
  explanation: z.string().min(1).default("Health-heavy renter search with affordability and transit constraints.")
});

export function normalizeIntent(input: unknown, fallback: SearchIntent): SearchIntent {
  const parsed = searchIntentSchema.safeParse(input);

  if (!parsed.success) {
    return fallback;
  }

  const weights = parsed.data.weights;
  const total = weights.health + weights.affordability + weights.transit + weights.careAccess;
  const normalizedWeights =
    total > 0
      ? {
          health: Number((weights.health / total).toFixed(2)),
          affordability: Number((weights.affordability / total).toFixed(2)),
          transit: Number((weights.transit / total).toFixed(2)),
          careAccess: Number((weights.careAccess / total).toFixed(2))
        }
      : fallback.weights;

  return {
    ...fallback,
    ...parsed.data,
    weights: normalizedWeights,
    healthPriorities:
      parsed.data.healthPriorities.length > 0 ? parsed.data.healthPriorities : fallback.healthPriorities
  };
}

export function extractJsonObject(text: string): unknown | null {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

export function buildSearchPrompt(query: string): string {
  return `You are the search-intent parser for HealthyHome Finder, a prototype housing and community-health dashboard.

Return ONLY strict JSON matching this TypeScript type:
{
  "propertyType": "rental" | "home",
  "maxRent": number,
  "locationLabel": string,
  "radiusMiles": number,
  "beds"?: number,
  "transitPreference": "required" | "preferred" | "any",
  "healthPriorities": Array<"low_diabetes" | "high_preventive_care" | "primary_care_access" | "low_uninsured" | "air_quality" | "affordability" | "transit">,
  "weights": { "health": number, "affordability": number, "transit": number, "careAccess": number },
  "confidence": number,
  "explanation": string
}

Use a health-heavy model. If the user mentions low diabetes, preventive care, healthcare resources, providers, uninsured rate, or primary care, increase health/care weights. If the user mentions transit, set transitPreference to preferred or required. If the user gives a rent cap, extract it. If location is unclear, use "04043 + 10 miles".

User query: ${query}`;
}
