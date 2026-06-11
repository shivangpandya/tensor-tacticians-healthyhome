import { defaultIntent } from "@/lib/data";
import type { SearchIntent } from "@/lib/types";

export function parseIntentLocally(query: string): SearchIntent {
  const lower = query.toLowerCase();
  const rentMatch = lower.match(/\$?\s?(\d{1,2}(?:,\d{3})|\d{3,5})\s*(?:\/?\s*(?:mo|month|monthly))?/);
  const maxRent = rentMatch ? Number(rentMatch[1].replace(",", "")) : defaultIntent.maxRent;
  const radiusMatch = lower.match(/(\d{1,2})\s*(?:mile|mi)/);
  const zipMatch = lower.match(/\b\d{5}\b/);
  const bedsMatch = lower.match(/(\d)\s*(?:bed|bd)/);

  const healthPriorities: SearchIntent["healthPriorities"] = [];
  if (lower.includes("diabetes")) healthPriorities.push("low_diabetes");
  if (lower.includes("preventive")) healthPriorities.push("high_preventive_care");
  if (lower.includes("primary") || lower.includes("provider") || lower.includes("healthcare")) {
    healthPriorities.push("primary_care_access");
  }
  if (lower.includes("uninsured")) healthPriorities.push("low_uninsured");
  if (lower.includes("air")) healthPriorities.push("air_quality");
  if (lower.includes("affordable") || lower.includes("budget") || lower.includes("under")) {
    healthPriorities.push("affordability");
  }
  if (lower.includes("transit") || lower.includes("bus") || lower.includes("rail")) {
    healthPriorities.push("transit");
  }

  const wantsTransit = lower.includes("good transit") || lower.includes("best transit") || lower.includes("rail");
  const requiresTransit = lower.includes("must have transit") || lower.includes("transit required");

  return {
    ...defaultIntent,
    maxRent,
    radiusMiles: radiusMatch ? Number(radiusMatch[1]) : defaultIntent.radiusMiles,
    locationLabel: zipMatch ? `${zipMatch[0]} + ${radiusMatch ? Number(radiusMatch[1]) : 10} miles` : defaultIntent.locationLabel,
    beds: bedsMatch ? Number(bedsMatch[1]) : undefined,
    transitPreference: requiresTransit ? "required" : wantsTransit ? "preferred" : "any",
    healthPriorities:
      healthPriorities.length > 0
        ? Array.from(new Set(healthPriorities))
        : defaultIntent.healthPriorities,
    weights:
      healthPriorities.includes("affordability") && !healthPriorities.includes("low_diabetes")
        ? { health: 0.42, affordability: 0.28, transit: 0.16, careAccess: 0.14 }
        : { health: 0.58, affordability: 0.16, transit: wantsTransit ? 0.16 : 0.12, careAccess: wantsTransit ? 0.1 : 0.14 },
    confidence: 0.7,
    explanation:
      "Parsed locally using known health, rent, location, care-access, and transit terms so the prototype remains demo-ready."
  };
}
