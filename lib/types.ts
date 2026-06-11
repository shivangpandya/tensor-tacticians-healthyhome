export type PropertyType = "rental" | "home";

export type HealthPriority =
  | "low_diabetes"
  | "high_preventive_care"
  | "primary_care_access"
  | "low_uninsured"
  | "air_quality"
  | "affordability"
  | "transit";

export type SearchIntent = {
  propertyType: PropertyType;
  maxRent: number;
  rentConstraint: "hard" | "soft";
  locationLabel: string;
  radiusMiles: number;
  beds?: number;
  transitPreference: "required" | "preferred" | "any";
  healthPriorities: HealthPriority[];
  weights: {
    health: number;
    affordability: number;
    transit: number;
    careAccess: number;
  };
  confidence: number;
  explanation: string;
};

export type TrendPoint = {
  year: number;
  diabetes: number;
  preventiveCare: number;
  medianRent: number;
};

export type AreaMetrics = {
  areaName: string;
  population: number;
  medianHouseholdIncome: number;
  diabetesPrevalence: number;
  preventiveCareUse: number;
  uninsuredRate: number;
  primaryCareProviders: number;
  primaryCareAccessScore: number;
  housingAffordability: number;
  transitScore: number;
  transitAccess: "Excellent" | "Good" | "Limited";
  walkScore: number;
  airQualityIndex: number;
  crimeRateLabel: string;
  trends: TrendPoint[];
};

export type HealthcareResource = {
  id: string;
  name: string;
  type: "hospital" | "clinic" | "transit";
  distanceMiles: number;
  detail: string;
};

export type Listing = {
  id: string;
  label: string;
  address: string;
  town: string;
  state: string;
  zip: string;
  rent: number;
  beds: number;
  baths: number;
  sqft: number;
  image: string;
  lat: number;
  lng: number;
  area: AreaMetrics;
  resources: HealthcareResource[];
  highlights: string[];
};

export type RankedListing = Listing & {
  score: number;
  scoreLabel: "Excellent" | "Very Good" | "Good";
  matchReasons: string[];
};

export type SearchResponse = {
  intent: SearchIntent;
  listings: RankedListing[];
  selectedListingId: string;
  aiMeta: {
    provider: "oci" | "vercel-ai-gateway" | "local-fallback";
    attempted: string[];
    confidence: number;
    note: string;
  };
};
