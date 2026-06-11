import { describe, expect, it } from "vitest";
import { defaultIntent, listings } from "@/lib/data";
import { parseIntentLocally } from "@/lib/local-parser";
import { rankListings } from "@/lib/ranking";
import { extractJsonObject, normalizeIntent } from "@/lib/search-intent";

describe("search intent parsing", () => {
  it("extracts rent, zip, radius, and health priorities from a natural-language query", () => {
    const intent = parseIntentLocally(
      "Show me rentals under $2,000/month with low diabetes, high preventive-care utilization, and good transit near zip code 04043 within 10 miles."
    );

    expect(intent.maxRent).toBe(2000);
    expect(intent.locationLabel).toBe("04043 + 10 miles");
    expect(intent.radiusMiles).toBe(10);
    expect(intent.healthPriorities).toContain("low_diabetes");
    expect(intent.healthPriorities).toContain("high_preventive_care");
    expect(intent.healthPriorities).toContain("transit");
  });

  it("normalizes model JSON into a safe intent", () => {
    const intent = normalizeIntent(
      {
        propertyType: "rental",
        maxRent: "1800",
        locationLabel: "04043 + 8 miles",
        radiusMiles: "8",
        transitPreference: "preferred",
        healthPriorities: ["primary_care_access"],
        weights: { health: 4, affordability: 1, transit: 1, careAccess: 2 },
        confidence: 0.9,
        explanation: "Prioritize primary care."
      },
      defaultIntent
    );

    expect(intent.maxRent).toBe(1800);
    expect(intent.weights.health).toBeCloseTo(0.5);
    expect(intent.healthPriorities).toEqual(["primary_care_access"]);
  });

  it("extracts a JSON object from wrapped model text", () => {
    const parsed = extractJsonObject('Sure: {"maxRent":2000,"propertyType":"rental"}');

    expect(parsed).toEqual({ maxRent: 2000, propertyType: "rental" });
  });
});

describe("ranking", () => {
  it("ranks the strongest health-heavy listing first for the default search", () => {
    const ranked = rankListings(listings, defaultIntent);

    expect(ranked[0].id).toBe("tidewater-lofts");
    expect(ranked[0].score).toBeGreaterThanOrEqual(85);
    expect(ranked[0].matchReasons.length).toBeGreaterThan(1);
  });

  it("filters out listings too far above budget", () => {
    const ranked = rankListings(listings, { ...defaultIntent, maxRent: 1650 });

    expect(ranked.some((listing) => listing.id === "atlantic-court")).toBe(false);
    expect(ranked.every((listing) => listing.rent <= 1800)).toBe(true);
  });

  it("treats below rent searches as a hard affordability-led cap", () => {
    const intent = parseIntentLocally("Find rentals with monthly rent below $1800");
    const ranked = rankListings(listings, intent);

    expect(intent.maxRent).toBe(1800);
    expect(intent.rentConstraint).toBe("hard");
    expect(intent.weights.affordability).toBeGreaterThan(intent.weights.health);
    expect(ranked.every((listing) => listing.rent <= 1800)).toBe(true);
  });

  it("prioritizes transit and affordability when the query asks for budget friendly transit options", () => {
    const intent = parseIntentLocally("Show me budget friendly options with good transit options");
    const ranked = rankListings(listings, intent);

    expect(intent.weights.affordability).toBeGreaterThan(intent.weights.health);
    expect(intent.weights.transit).toBeGreaterThanOrEqual(intent.weights.health);
    expect(ranked[0].id).not.toBe("tidewater-lofts");
    expect(["harborline", "birch-commons", "atlantic-court"]).toContain(ranked[0].id);
  });

  it("prioritizes higher-transit listings for the best transit near care guided prompt", () => {
    const intent = parseIntentLocally(
      "Find rentals near 04043 with good transit access, nearby healthcare resources, and monthly rent below $2,100."
    );
    const ranked = rankListings(listings, intent);

    expect(intent.weights.transit).toBeGreaterThan(intent.weights.health);
    expect(ranked[0].id).not.toBe("tidewater-lofts");
    expect(ranked[0].area.transitScore).toBeGreaterThan(62);
  });
});
