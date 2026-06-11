import type { Listing, RankedListing, SearchIntent } from "@/lib/types";

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function inversePercentScore(value: number, good: number, poor: number) {
  const score = ((poor - value) / (poor - good)) * 100;
  return clamp(score);
}

function percentScore(value: number, good: number, poor: number) {
  const score = ((value - poor) / (good - poor)) * 100;
  return clamp(score);
}

export function calculateCommunityScore(listing: Listing, intent: SearchIntent) {
  const area = listing.area;
  const diabetesScore = inversePercentScore(area.diabetesPrevalence, 6.8, 10.8);
  const preventiveScore = percentScore(area.preventiveCareUse, 76, 55);
  const uninsuredScore = inversePercentScore(area.uninsuredRate, 4.5, 12);
  const airScore = inversePercentScore(area.airQualityIndex, 35, 65);
  const healthCore = diabetesScore * 0.34 + preventiveScore * 0.32 + uninsuredScore * 0.18 + airScore * 0.16;

  const careAccess = area.primaryCareAccessScore;
  const affordability = inversePercentScore(area.housingAffordability, 22, 42);
  const rentBudget = listing.rent <= intent.maxRent ? 100 : clamp(100 - ((listing.rent - intent.maxRent) / 500) * 100);
  const affordabilityBlend = affordability * 0.58 + rentBudget * 0.42;
  const transit = area.transitScore;

  const score =
    healthCore * intent.weights.health +
    affordabilityBlend * intent.weights.affordability +
    transit * intent.weights.transit +
    careAccess * intent.weights.careAccess;

  return Math.round(clamp(score + 11));
}

function scoreLabel(score: number): RankedListing["scoreLabel"] {
  if (score >= 90) return "Excellent";
  if (score >= 84) return "Very Good";
  return "Good";
}

function matchReasons(listing: Listing, intent: SearchIntent): string[] {
  const reasons = [];
  if (listing.rent <= intent.maxRent) reasons.push(`Under $${intent.maxRent.toLocaleString()}/month`);
  if (listing.area.diabetesPrevalence <= 7.8) reasons.push("Low diabetes prevalence");
  if (listing.area.preventiveCareUse >= 70) reasons.push("High preventive-care use");
  if (listing.area.primaryCareAccessScore >= 80) reasons.push("Strong primary-care access");
  if (listing.area.transitScore >= 62) reasons.push(`${listing.area.transitAccess} transit access`);
  if (listing.area.housingAffordability <= 28) reasons.push("Lower housing burden");

  return reasons.slice(0, 4);
}

export function rankListings(listingData: Listing[], intent: SearchIntent): RankedListing[] {
  return listingData
    .map((listing) => {
      const score = calculateCommunityScore(listing, intent);
      return {
        ...listing,
        score,
        scoreLabel: scoreLabel(score),
        matchReasons: matchReasons(listing, intent)
      };
    })
    .filter((listing) => {
      const budgetLimit = intent.maxRent + 150;
      const bedMatch = intent.beds ? listing.beds >= intent.beds : true;
      const transitMatch = intent.transitPreference === "required" ? listing.area.transitScore >= 60 : true;
      return listing.rent <= budgetLimit && bedMatch && transitMatch;
    })
    .sort((a, b) => b.score - a.score || a.rent - b.rent);
}
