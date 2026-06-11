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
  const mentionsDiabetes = lower.includes("diabetes");
  const mentionsPreventive = lower.includes("preventive");
  const mentionsCareAccess = lower.includes("primary") || lower.includes("provider") || lower.includes("healthcare") || lower.includes("care");
  const mentionsUninsured = lower.includes("uninsured");
  const mentionsAir = lower.includes("air");
  const hasHardRentCap = /\b(?:under|below|less than|no more than|max|maximum|up to|at most)\b/.test(lower);
  const hasSoftRentPreference = /\b(?:around|about|near|roughly|approximately|approx|budget-friendly|budget friendly)\b/.test(lower);
  const budgetFocused = lower.includes("affordable") || lower.includes("budget") || hasHardRentCap || hasSoftRentPreference;
  const transitFocused = lower.includes("transit") || lower.includes("bus") || lower.includes("rail");
  const explicitHealthFocus =
    mentionsDiabetes || mentionsPreventive || mentionsCareAccess || mentionsUninsured || mentionsAir || lower.includes("healthy");

  if (mentionsDiabetes) healthPriorities.push("low_diabetes");
  if (mentionsPreventive) healthPriorities.push("high_preventive_care");
  if (mentionsCareAccess) {
    healthPriorities.push("primary_care_access");
  }
  if (mentionsUninsured) healthPriorities.push("low_uninsured");
  if (mentionsAir) healthPriorities.push("air_quality");
  if (budgetFocused) {
    healthPriorities.push("affordability");
  }
  if (transitFocused) {
    healthPriorities.push("transit");
  }

  const wantsTransit = transitFocused;
  const requiresTransit = lower.includes("must have transit") || lower.includes("transit required");
  const weights =
    budgetFocused && transitFocused && !explicitHealthFocus
      ? { health: 0.05, affordability: 0.3, transit: 0.58, careAccess: 0.07 }
      : transitFocused && mentionsCareAccess
        ? { health: 0.08, affordability: 0.08, transit: 0.68, careAccess: 0.16 }
        : budgetFocused && !explicitHealthFocus
          ? { health: 0.12, affordability: 0.62, transit: 0.16, careAccess: 0.1 }
          : healthPriorities.includes("affordability") && !healthPriorities.includes("low_diabetes")
            ? { health: 0.42, affordability: 0.28, transit: 0.16, careAccess: 0.14 }
            : { health: 0.58, affordability: 0.16, transit: wantsTransit ? 0.16 : 0.12, careAccess: wantsTransit ? 0.1 : 0.14 };

  return {
    ...defaultIntent,
    maxRent,
    rentConstraint: rentMatch && hasHardRentCap ? "hard" : "soft",
    radiusMiles: radiusMatch ? Number(radiusMatch[1]) : defaultIntent.radiusMiles,
    locationLabel: zipMatch ? `${zipMatch[0]} + ${radiusMatch ? Number(radiusMatch[1]) : 10} miles` : defaultIntent.locationLabel,
    beds: bedsMatch ? Number(bedsMatch[1]) : undefined,
    transitPreference: requiresTransit ? "required" : wantsTransit ? "preferred" : "any",
    healthPriorities:
      healthPriorities.length > 0
        ? Array.from(new Set(healthPriorities))
        : defaultIntent.healthPriorities,
    weights,
    confidence: 0.7,
    explanation:
      "Parsed locally using known health, rent, location, care-access, and transit terms so the prototype remains demo-ready."
  };
}
