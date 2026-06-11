import type { Listing, SearchIntent } from "@/lib/types";

export const guidedPrompts = [
  {
    id: "low-diabetes-preventive",
    label: "Low diabetes + preventive care under $2K",
    query:
      "Show me rentals under $2,000/month in neighborhoods with low diabetes prevalence, high preventive-care utilization, and good transit access in or near zip code 04043."
  },
  {
    id: "transit-near-care",
    label: "Best transit near care",
    query:
      "Find rentals near 04043 with good transit access, nearby healthcare resources, and monthly rent below $2,100."
  },
  {
    id: "primary-care-access",
    label: "Strong primary-care access",
    query:
      "Show affordable rentals with strong primary-care access, low uninsured rates, and healthy community indicators near Kennebunk."
  }
];

export const defaultIntent: SearchIntent = {
  propertyType: "rental",
  maxRent: 2000,
  locationLabel: "04043 + 10 miles",
  radiusMiles: 10,
  transitPreference: "preferred",
  healthPriorities: ["low_diabetes", "high_preventive_care", "primary_care_access"],
  weights: {
    health: 0.58,
    affordability: 0.16,
    transit: 0.12,
    careAccess: 0.14
  },
  confidence: 0.78,
  explanation:
    "Prioritize community health indicators first, then keep rent below budget while favoring transit and care access."
};

export const dataSources = [
  {
    metric: "Diabetes prevalence",
    source: "CDC PLACES-style community health indicators",
    year: "Seeded 2024 sample",
    definition: "Estimated share of adults with diagnosed diabetes in the selected community."
  },
  {
    metric: "Preventive care use",
    source: "CDC/claims-style preventive utilization indicators",
    year: "Seeded 2024 sample",
    definition: "Estimated share of residents receiving recommended preventive care."
  },
  {
    metric: "Housing affordability",
    source: "ACS/HUD-style housing burden indicators",
    year: "Seeded 2024 sample",
    definition: "Estimated share of household income used for monthly housing costs."
  },
  {
    metric: "Primary-care access",
    source: "HRSA/provider-access-style indicators",
    year: "Seeded 2024 sample",
    definition: "Provider availability and proximity summarized for the selected area."
  },
  {
    metric: "Transit access",
    source: "Local transit/GTFS-style access indicators",
    year: "Seeded 2024 sample",
    definition: "Transit availability near the property and surrounding community."
  },
  {
    metric: "Air quality",
    source: "EPA/AirNow-style air quality indicators",
    year: "Seeded 2024 sample",
    definition: "Lower score indicates cleaner air conditions in this prototype model."
  }
];

export const listings: Listing[] = [
  {
    id: "tidewater-lofts",
    label: "Best Match",
    address: "12 Tidewater Ln, Unit 204",
    town: "Kennebunk",
    state: "ME",
    zip: "04043",
    rent: 1850,
    beds: 2,
    baths: 2,
    sqft: 1050,
    image: "/properties/blue-apartments.svg",
    lat: 43.384,
    lng: -70.537,
    area: {
      areaName: "Kennebunk Center",
      population: 18732,
      medianHouseholdIncome: 82415,
      diabetesPrevalence: 7.2,
      preventiveCareUse: 72,
      uninsuredRate: 6,
      primaryCareProviders: 1480,
      primaryCareAccessScore: 86,
      housingAffordability: 28,
      transitScore: 62,
      transitAccess: "Good",
      walkScore: 78,
      airQualityIndex: 41,
      crimeRateLabel: "Lower than avg.",
      trends: [
        { year: 2020, diabetes: 8.6, preventiveCare: 65, medianRent: 1420 },
        { year: 2021, diabetes: 8.2, preventiveCare: 67, medianRent: 1520 },
        { year: 2022, diabetes: 7.9, preventiveCare: 69, medianRent: 1650 },
        { year: 2023, diabetes: 7.5, preventiveCare: 71, medianRent: 1780 },
        { year: 2024, diabetes: 7.2, preventiveCare: 72, medianRent: 1850 }
      ]
    },
    resources: [
      { id: "southern-maine", name: "Southern Maine Medical", type: "hospital", distanceMiles: 0.9, detail: "Acute care hospital" },
      { id: "harbor-primary", name: "Harbor Primary Care", type: "clinic", distanceMiles: 1.1, detail: "Family medicine" },
      { id: "kennebunk-link", name: "Kennebunk Transit Link", type: "transit", distanceMiles: 0.4, detail: "Bus connection" }
    ],
    highlights: ["Low diabetes prevalence", "High preventive-care use", "Good transit access", "Strong healthcare access"]
  },
  {
    id: "mill-house",
    label: "Strong Care Access",
    address: "45 Mill House Rd, Unit 3",
    town: "Wells",
    state: "ME",
    zip: "04090",
    rent: 1650,
    beds: 1,
    baths: 1,
    sqft: 750,
    image: "/properties/cottage.svg",
    lat: 43.322,
    lng: -70.582,
    area: {
      areaName: "Wells Village",
      population: 11348,
      medianHouseholdIncome: 79320,
      diabetesPrevalence: 7.5,
      preventiveCareUse: 70,
      uninsuredRate: 6.4,
      primaryCareProviders: 1320,
      primaryCareAccessScore: 82,
      housingAffordability: 25,
      transitScore: 54,
      transitAccess: "Good",
      walkScore: 66,
      airQualityIndex: 39,
      crimeRateLabel: "Lower than avg.",
      trends: [
        { year: 2020, diabetes: 8.4, preventiveCare: 64, medianRent: 1300 },
        { year: 2021, diabetes: 8.1, preventiveCare: 66, medianRent: 1395 },
        { year: 2022, diabetes: 7.9, preventiveCare: 68, medianRent: 1490 },
        { year: 2023, diabetes: 7.7, preventiveCare: 69, medianRent: 1585 },
        { year: 2024, diabetes: 7.5, preventiveCare: 70, medianRent: 1650 }
      ]
    },
    resources: [
      { id: "wells-care", name: "Wells Community Care", type: "clinic", distanceMiles: 0.7, detail: "Primary care clinic" },
      { id: "coastal-health", name: "Coastal Health Center", type: "clinic", distanceMiles: 1.5, detail: "Preventive services" },
      { id: "shoreline-bus", name: "Shoreline Bus Stop", type: "transit", distanceMiles: 0.6, detail: "Regional bus" }
    ],
    highlights: ["Below budget", "Strong primary-care access", "Clean air indicator"]
  },
  {
    id: "harborline",
    label: "Transit Pick",
    address: "100 Harborline Ave, Unit 102",
    town: "Biddeford",
    state: "ME",
    zip: "04005",
    rent: 1975,
    beds: 2,
    baths: 1,
    sqft: 900,
    image: "/properties/brick-courtyard.svg",
    lat: 43.492,
    lng: -70.454,
    area: {
      areaName: "Biddeford South",
      population: 21980,
      medianHouseholdIncome: 71180,
      diabetesPrevalence: 7.8,
      preventiveCareUse: 69,
      uninsuredRate: 7,
      primaryCareProviders: 1250,
      primaryCareAccessScore: 78,
      housingAffordability: 31,
      transitScore: 74,
      transitAccess: "Excellent",
      walkScore: 82,
      airQualityIndex: 44,
      crimeRateLabel: "Near avg.",
      trends: [
        { year: 2020, diabetes: 8.8, preventiveCare: 63, medianRent: 1460 },
        { year: 2021, diabetes: 8.5, preventiveCare: 65, medianRent: 1540 },
        { year: 2022, diabetes: 8.1, preventiveCare: 67, medianRent: 1685 },
        { year: 2023, diabetes: 8.0, preventiveCare: 68, medianRent: 1840 },
        { year: 2024, diabetes: 7.8, preventiveCare: 69, medianRent: 1975 }
      ]
    },
    resources: [
      { id: "biddeford-med", name: "Biddeford Medical Center", type: "hospital", distanceMiles: 1.3, detail: "Hospital campus" },
      { id: "harbor-clinic", name: "Harborline Clinic", type: "clinic", distanceMiles: 0.8, detail: "Primary care" },
      { id: "saco-station", name: "Saco Transit Station", type: "transit", distanceMiles: 0.5, detail: "Bus and rail" }
    ],
    highlights: ["Excellent transit access", "Near major care resources", "Under $2,000"]
  },
  {
    id: "birch-commons",
    label: "Budget Friendly",
    address: "8 Birch Commons, Apt B",
    town: "Arundel",
    state: "ME",
    zip: "04046",
    rent: 1700,
    beds: 2,
    baths: 1,
    sqft: 800,
    image: "/properties/kitchen.svg",
    lat: 43.443,
    lng: -70.526,
    area: {
      areaName: "Arundel Commons",
      population: 7230,
      medianHouseholdIncome: 78640,
      diabetesPrevalence: 8.0,
      preventiveCareUse: 67,
      uninsuredRate: 6.8,
      primaryCareProviders: 970,
      primaryCareAccessScore: 72,
      housingAffordability: 24,
      transitScore: 49,
      transitAccess: "Limited",
      walkScore: 58,
      airQualityIndex: 40,
      crimeRateLabel: "Lower than avg.",
      trends: [
        { year: 2020, diabetes: 8.9, preventiveCare: 61, medianRent: 1280 },
        { year: 2021, diabetes: 8.7, preventiveCare: 63, medianRent: 1360 },
        { year: 2022, diabetes: 8.3, preventiveCare: 65, medianRent: 1480 },
        { year: 2023, diabetes: 8.2, preventiveCare: 66, medianRent: 1600 },
        { year: 2024, diabetes: 8.0, preventiveCare: 67, medianRent: 1700 }
      ]
    },
    resources: [
      { id: "arundel-care", name: "Arundel Family Care", type: "clinic", distanceMiles: 1.4, detail: "Primary care clinic" },
      { id: "wellness-route", name: "Wellness Route Stop", type: "transit", distanceMiles: 1.0, detail: "Weekday bus" },
      { id: "coastal-lab", name: "Coastal Lab Services", type: "clinic", distanceMiles: 1.8, detail: "Screenings" }
    ],
    highlights: ["Most affordable", "Lower housing burden", "Clean air indicator"]
  },
  {
    id: "pine-marsh",
    label: "Preventive Care",
    address: "22 Pine Marsh Way",
    town: "Saco",
    state: "ME",
    zip: "04072",
    rent: 1895,
    beds: 2,
    baths: 2,
    sqft: 980,
    image: "/properties/green-townhomes.svg",
    lat: 43.500,
    lng: -70.442,
    area: {
      areaName: "Saco East",
      population: 20510,
      medianHouseholdIncome: 75930,
      diabetesPrevalence: 7.6,
      preventiveCareUse: 73,
      uninsuredRate: 6.2,
      primaryCareProviders: 1175,
      primaryCareAccessScore: 80,
      housingAffordability: 30,
      transitScore: 68,
      transitAccess: "Good",
      walkScore: 76,
      airQualityIndex: 43,
      crimeRateLabel: "Near avg.",
      trends: [
        { year: 2020, diabetes: 8.5, preventiveCare: 66, medianRent: 1440 },
        { year: 2021, diabetes: 8.1, preventiveCare: 68, medianRent: 1515 },
        { year: 2022, diabetes: 7.9, preventiveCare: 70, medianRent: 1625 },
        { year: 2023, diabetes: 7.7, preventiveCare: 72, medianRent: 1760 },
        { year: 2024, diabetes: 7.6, preventiveCare: 73, medianRent: 1895 }
      ]
    },
    resources: [
      { id: "saco-clinic", name: "Saco Preventive Care", type: "clinic", distanceMiles: 0.9, detail: "Preventive care" },
      { id: "maine-med", name: "Maine Coast Hospital", type: "hospital", distanceMiles: 2.1, detail: "Acute care" },
      { id: "saco-link", name: "Saco Link Station", type: "transit", distanceMiles: 0.6, detail: "Bus service" }
    ],
    highlights: ["Highest preventive-care use", "Good transit", "Under budget"]
  },
  {
    id: "atlantic-court",
    label: "Near Transit",
    address: "6 Atlantic Court",
    town: "Old Orchard Beach",
    state: "ME",
    zip: "04064",
    rent: 2050,
    beds: 2,
    baths: 1,
    sqft: 910,
    image: "/properties/coastal-apartments.svg",
    lat: 43.517,
    lng: -70.378,
    area: {
      areaName: "Old Orchard Station",
      population: 10120,
      medianHouseholdIncome: 68450,
      diabetesPrevalence: 8.4,
      preventiveCareUse: 66,
      uninsuredRate: 7.5,
      primaryCareProviders: 920,
      primaryCareAccessScore: 70,
      housingAffordability: 34,
      transitScore: 78,
      transitAccess: "Excellent",
      walkScore: 84,
      airQualityIndex: 45,
      crimeRateLabel: "Near avg.",
      trends: [
        { year: 2020, diabetes: 9.1, preventiveCare: 60, medianRent: 1390 },
        { year: 2021, diabetes: 8.9, preventiveCare: 62, medianRent: 1495 },
        { year: 2022, diabetes: 8.7, preventiveCare: 64, medianRent: 1660 },
        { year: 2023, diabetes: 8.5, preventiveCare: 65, medianRent: 1900 },
        { year: 2024, diabetes: 8.4, preventiveCare: 66, medianRent: 2050 }
      ]
    },
    resources: [
      { id: "oob-station", name: "Old Orchard Station", type: "transit", distanceMiles: 0.3, detail: "Rail and bus" },
      { id: "beachside-care", name: "Beachside Health", type: "clinic", distanceMiles: 1.2, detail: "Urgent and primary care" },
      { id: "saco-hospital", name: "Saco Hospital Access", type: "hospital", distanceMiles: 2.6, detail: "Hospital access" }
    ],
    highlights: ["Excellent transit", "Walkable", "Higher rent tradeoff"]
  }
];
