"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Activity,
  Bell,
  Bus,
  Check,
  ChevronDown,
  Heart,
  Home,
  Hospital,
  Info,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Stethoscope,
  Train,
  UserCircle,
  X
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { dataSources, defaultIntent, guidedPrompts, listings as seededListings } from "@/lib/data";
import { rankListings } from "@/lib/ranking";
import type { RankedListing, SearchResponse } from "@/lib/types";

const MapPanel = dynamic(() => import("@/components/MapPanel"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full min-h-[360px] place-items-center rounded-lg border border-line-soft bg-panel-soft text-sm font-semibold text-primary">
      Loading map...
    </div>
  )
});

const initialListings = rankListings(seededListings, defaultIntent);

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-line-soft bg-white px-3 py-2 text-xs font-semibold text-ink shadow-sm">
      {children}
    </span>
  );
}

function MetricCard({
  icon,
  value,
  label,
  detail,
  tone = "blue"
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  detail: string;
  tone?: "blue" | "green" | "purple" | "orange";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-primary",
    green: "bg-green-50 text-health",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-600"
  }[tone];

  return (
    <div className="rounded-lg border border-line-soft bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-full ${toneClass}`}>{icon}</span>
        <div>
          <div className="text-xl font-extrabold leading-none text-ink">{value}</div>
          <div className="text-sm font-bold text-ink">{label}</div>
        </div>
      </div>
      <p className="text-xs leading-5 text-slate-600">{detail}</p>
    </div>
  );
}

function ListingCard({
  listing,
  selected,
  saved,
  onSelect,
  onToggleSave
}: {
  listing: RankedListing;
  selected: boolean;
  saved: boolean;
  onSelect: () => void;
  onToggleSave: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group grid w-full grid-cols-[138px_1fr] gap-4 rounded-lg border bg-white p-3 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-panel ${
        selected ? "border-primary ring-2 ring-blue-100" : "border-line-soft"
      }`}
    >
      <div className="relative h-full min-h-[118px] overflow-hidden rounded-md">
        <Image src={listing.image} alt="" fill sizes="138px" className="object-cover" />
        {listing.label && (
          <span className="absolute left-2 top-2 rounded bg-health px-2 py-1 text-[11px] font-extrabold text-white">
            {selected ? "Selected" : listing.label}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xl font-extrabold text-ink">
              {formatMoney(listing.rent)}
              <span className="text-sm font-bold">/mo</span>
            </div>
            <div className="mt-1 text-sm font-semibold leading-5 text-slate-700">
              {listing.address}
              <br />
              {listing.town}, {listing.state} {listing.zip}
            </div>
          </div>
          <span
            onClick={(event) => {
              event.stopPropagation();
              onToggleSave();
            }}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border ${
              saved ? "border-blue-200 bg-blue-50 text-primary" : "border-line-soft bg-white text-navy"
            }`}
            role="button"
            tabIndex={0}
          >
            <Heart className={saved ? "h-5 w-5 fill-current" : "h-5 w-5"} />
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-700">
          <span>{listing.beds} bd</span>
          <span>{listing.baths} ba</span>
          <span>{listing.sqft.toLocaleString()} sqft</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-md border-2 border-health bg-health-soft text-2xl font-extrabold text-health">
            {listing.score}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600">Healthy Community Score</div>
            <div className="font-extrabold text-health">{listing.scoreLabel}</div>
          </div>
        </div>
      </div>
    </button>
  );
}

function ScorePanel({ listing }: { listing: RankedListing }) {
  return (
    <div className="grid gap-4 rounded-lg border border-green-200 bg-health-soft p-4 md:grid-cols-[180px_1fr_180px]">
      <div className="flex items-center gap-4 md:flex-col md:items-start md:justify-center">
        <div className="grid h-24 w-24 place-items-center rounded-full border-[7px] border-health bg-white text-4xl font-black text-health">
          {listing.score}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-600">Healthy Community Score</div>
          <div className="text-xl font-extrabold text-health">{listing.scoreLabel}</div>
        </div>
      </div>
      <div>
        <div className="mb-3 text-sm font-extrabold text-ink">Why this score?</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {listing.matchReasons.concat(listing.highlights).slice(0, 6).map((reason, index) => (
            <div key={`${reason}-${index}`} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="grid h-5 w-5 place-items-center rounded bg-green-100 text-health">
                <Check className="h-4 w-4" />
              </span>
              {reason}
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-md border border-green-200 bg-white/70 p-3 text-sm">
        <div className="mb-2 font-extrabold text-ink">About this Area</div>
        <div className="space-y-1 text-xs font-semibold text-slate-700">
          <div className="flex justify-between gap-2">
            <span>Population</span>
            <span>{listing.area.population.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Income</span>
            <span>{formatMoney(listing.area.medianHouseholdIncome)}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Walk Score</span>
            <span>{listing.area.walkScore}/100</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Transit</span>
            <span>{listing.area.transitScore}/100</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendsChart({ listing }: { listing: RankedListing }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <LineChart data={listing.area.trends} margin={{ left: 0, right: 8, top: 12, bottom: 0 }}>
          <CartesianGrid stroke="#e5edf7" vertical={false} />
          <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#42526b", fontWeight: 700 }} />
          <YAxis
            yAxisId="percent"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#42526b", fontWeight: 700 }}
            domain={[0, 100]}
          />
          <YAxis
            yAxisId="rent"
            orientation="right"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#42526b", fontWeight: 700 }}
            domain={[500, 2500]}
          />
          <Tooltip
            formatter={(value, name) => [
              name === "medianRent" ? formatMoney(Number(value)) : `${value}%`,
              name === "diabetes" ? "Diabetes" : name === "preventiveCare" ? "Preventive Care" : "Median Rent"
            ]}
          />
          <Legend iconType="line" wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
          <Line yAxisId="percent" dataKey="diabetes" name="Diabetes Prevalence (%)" stroke="#7d3fc8" strokeWidth={3} dot={{ r: 4 }} />
          <Line yAxisId="percent" dataKey="preventiveCare" name="Preventive Care Use (%)" stroke="#12a63a" strokeWidth={3} dot={{ r: 4 }} />
          <Line yAxisId="rent" dataKey="medianRent" name="Median Rent ($)" stroke="#0b63ce" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ResourceIcon({ type }: { type: RankedListing["resources"][number]["type"] }) {
  if (type === "hospital") return <Hospital className="h-6 w-6" />;
  if (type === "clinic") return <Stethoscope className="h-6 w-6" />;
  return <Train className="h-6 w-6" />;
}

export default function HealthyHomeDashboard() {
  const [query, setQuery] = useState(guidedPrompts[0].query);
  const [response, setResponse] = useState<SearchResponse>({
    intent: defaultIntent,
    listings: initialListings,
    selectedListingId: initialListings[0].id,
    aiMeta: {
      provider: "local-fallback",
      attempted: ["local-fallback"],
      confidence: defaultIntent.confidence,
      note: "Seeded opening state. Run Search to parse with OCI, Vercel AI Gateway, or local fallback."
    }
  });
  const [loading, setLoading] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [savedListings, setSavedListings] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = window.localStorage.getItem("healthyhome.savedListings");
    return saved ? (JSON.parse(saved) as string[]) : [];
  });
  const [savedSearches, setSavedSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = window.localStorage.getItem("healthyhome.savedSearches");
    const legacySaved = window.localStorage.getItem("healthyhome.savedSearch");
    if (saved) return JSON.parse(saved) as string[];
    return legacySaved ? [legacySaved] : [];
  });

  const selected = useMemo(
    () => response.listings.find((listing) => listing.id === response.selectedListingId) ?? response.listings[0],
    [response.listings, response.selectedListingId]
  );
  const savedSearch = savedSearches.includes(query);

  const aiProviderLabel = {
    oci: "OCI Gen AI",
    "vercel-ai-gateway": "Vercel AI Gateway",
    "local-fallback": "Local fallback"
  }[response.aiMeta.provider];

  async function runSearch(nextQuery = query) {
    setLoading(true);
    setQuery(nextQuery);
    try {
      const apiResponse = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: nextQuery })
      });

      if (!apiResponse.ok) {
        throw new Error("Search failed");
      }

      const payload = (await apiResponse.json()) as SearchResponse;
      setResponse(payload);
    } catch {
      const local = rankListings(seededListings, defaultIntent);
      setResponse((current) => ({
        ...current,
        listings: local,
        selectedListingId: local[0].id,
        aiMeta: {
          provider: "local-fallback",
          attempted: ["local-fallback"],
          confidence: defaultIntent.confidence,
          note: "Network search failed, so the local fallback restored the demo state."
        }
      }));
    } finally {
      setLoading(false);
    }
  }

  function selectListing(id: string) {
    setResponse((current) => ({ ...current, selectedListingId: id }));
  }

  function toggleSaveListing(id: string) {
    setSavedListings((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      window.localStorage.setItem("healthyhome.savedListings", JSON.stringify(next));
      return next;
    });
  }

  function toggleSaveSearch() {
    const next = !savedSearch;
    setSavedSearches((current) => {
      const updated = next ? Array.from(new Set([...current, query])) : current.filter((item) => item !== query);
      window.localStorage.setItem("healthyhome.savedSearches", JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <main className="min-h-screen bg-white text-ink">
      <div className="border-b border-line-soft bg-warning-soft px-4 py-2 text-center text-xs font-bold text-amber-900">
        Demo mode: sample listings and public-data-inspired community metrics.
      </div>

      <header className="border-b border-line-soft bg-white">
        <div className="mx-auto flex max-w-[1780px] flex-col gap-4 px-5 py-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative grid h-14 w-14 place-items-center rounded-md border-[3px] border-primary text-primary">
              <Home className="h-9 w-9" />
              <Heart className="absolute bottom-2 right-1 h-5 w-5 fill-health text-health" />
            </div>
            <div>
              <h1 className="text-3xl font-black leading-none text-primary">
                Healthy<span className="text-health">Home</span> Finder
              </h1>
              <p className="mt-1 text-sm font-semibold text-slate-600">Find a Home. Build a Healthier Life.</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 xl:max-w-[880px]">
            <label htmlFor="search" className="text-sm font-extrabold text-ink">
              Describe what you&apos;re looking for:
            </label>
            <div className="flex rounded-lg border-2 border-primary bg-white p-1 shadow-sm">
              <div className="grid w-12 shrink-0 place-items-center text-navy">
                <Search className="h-6 w-6" />
              </div>
              <textarea
                id="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-h-[54px] flex-1 resize-none border-0 bg-transparent py-2 text-sm font-semibold leading-6 outline-none"
              />
              <button
                type="button"
                onClick={() => void runSearch()}
                disabled={loading}
                className="grid min-w-[104px] place-items-center rounded-md bg-primary px-5 text-base font-extrabold text-white transition hover:bg-primary-dark disabled:opacity-60"
              >
                {loading ? "Searching" : "Search"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {guidedPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => void runSearch(prompt.query)}
                  className="rounded-md border border-line-soft bg-panel-soft px-3 py-2 text-xs font-extrabold text-primary transition hover:border-primary hover:bg-blue-50"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>

          <nav className="flex items-center justify-end gap-3 text-xs font-bold text-navy">
            <button type="button" className="grid gap-1 place-items-center">
              <Heart className="h-7 w-7" />
              Saved
            </button>
            <button type="button" className="grid gap-1 place-items-center">
              <Bell className="h-7 w-7" />
              Alerts
            </button>
            <button type="button" className="grid gap-1 place-items-center">
              <UserCircle className="h-7 w-7" />
              Account
            </button>
          </nav>
        </div>
      </header>

      <section className="border-b border-line-soft bg-white">
        <div className="mx-auto flex max-w-[1780px] flex-wrap items-center gap-3 px-5 py-4">
          <button className="inline-flex items-center gap-2 rounded-md border border-line-soft bg-white px-4 py-3 text-sm font-extrabold text-primary shadow-sm">
            <SlidersHorizontal className="h-5 w-5" />
            Filters
          </button>
          <Badge>AI parsed: {aiProviderLabel}</Badge>
          <Badge>Max Rent {formatMoney(response.intent.maxRent)}</Badge>
          <Badge>Property Type Rentals</Badge>
          <Badge>Health Priorities Low Diabetes, Preventive Care</Badge>
          <Badge>Transit {response.intent.transitPreference === "any" ? "Flexible" : "Good Access"}</Badge>
          <Badge>Location {response.intent.locationLabel}</Badge>
          <button
            type="button"
            onClick={toggleSaveSearch}
            className={`ml-auto inline-flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-extrabold shadow-sm ${
              savedSearch ? "border-blue-200 bg-blue-50 text-primary" : "border-line-soft bg-white text-primary"
            }`}
          >
            <Heart className={savedSearch ? "h-5 w-5 fill-current" : "h-5 w-5"} />
            {savedSearch ? "Saved" : "Save Search"}
          </button>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1780px] gap-4 px-5 py-4 xl:grid-cols-[530px_minmax(520px,1fr)_580px]">
        <section className="rounded-lg border border-line-soft bg-white p-3 shadow-panel">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-ink">{response.listings.length} Rental Properties Found</h2>
            <button className="inline-flex items-center gap-1 text-xs font-extrabold text-primary">
              Sort: Best Match <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3">
            {response.listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                selected={listing.id === selected.id}
                saved={savedListings.includes(listing.id)}
                onSelect={() => selectListing(listing.id)}
                onToggleSave={() => toggleSaveListing(listing.id)}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-4">
          <div className="rounded-lg border border-line-soft bg-white p-3 shadow-panel">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="rounded-md border border-line-soft bg-white px-3 py-2 text-sm font-extrabold text-ink">
                Map Area: 04043 + 10 miles
              </div>
              <div className="inline-flex items-center gap-2 rounded-md border border-line-soft bg-white px-3 py-2 text-xs font-bold text-slate-700">
                <span className="grid h-5 w-5 place-items-center rounded bg-primary text-white">
                  <Check className="h-4 w-4" />
                </span>
                Search as I move the map
              </div>
            </div>
            <div className="h-[420px] overflow-hidden rounded-lg">
              <MapPanel listings={response.listings} selectedId={selected.id} onSelect={selectListing} />
            </div>
          </div>

          <div className="rounded-lg border border-line-soft bg-white p-3 shadow-panel">
            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
              <Image
                src={selected.image}
                alt=""
                width={440}
                height={300}
                className="h-full min-h-[150px] w-full rounded-md object-cover"
              />
              <div className="flex flex-col justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-ink">{selected.address}</h2>
                  <p className="text-base font-semibold text-slate-700">
                    {selected.town}, {selected.state} {selected.zip}
                  </p>
                  <div className="mt-4 text-2xl font-black text-ink">
                    {formatMoney(selected.rent)}
                    <span className="text-base font-bold"> / month</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-5 text-sm font-bold text-slate-700">
                    <span>{selected.beds} bd</span>
                    <span>{selected.baths} ba</span>
                    <span>{selected.sqft.toLocaleString()} sqft</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDetailOpen(true)}
                    className="flex-1 rounded-md bg-primary px-5 py-3 text-sm font-extrabold text-white transition hover:bg-primary-dark"
                  >
                    View Property Details
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSaveListing(selected.id)}
                    className="grid h-12 w-12 place-items-center rounded-md border border-line-soft text-primary"
                  >
                    <Heart className={savedListings.includes(selected.id) ? "h-6 w-6 fill-current" : "h-6 w-6"} />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 border-t border-line-soft pt-4">
              <ScorePanel listing={selected} />
              <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
                Scores and data sources
                <button type="button" onClick={() => setSourceOpen(true)} className="text-primary">
                  <Info className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="grid gap-4">
          <section className="rounded-lg border border-line-soft bg-white p-4 shadow-panel">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-ink">Health & Housing Overview</h2>
              <button type="button" onClick={() => setSourceOpen(true)} className="text-xs font-extrabold text-primary">
                View All Data
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard icon={<Activity className="h-6 w-6" />} value={`${selected.area.diabetesPrevalence}%`} label="Diabetes Prevalence" detail="Lower than US avg. (10.5%)" tone="purple" />
              <MetricCard icon={<Stethoscope className="h-6 w-6" />} value={selected.area.primaryCareProviders.toLocaleString()} label="Primary Care Providers" detail="Per 100,000 residents" />
              <MetricCard icon={<ShieldCheck className="h-6 w-6" />} value={`${selected.area.preventiveCareUse}%`} label="Preventive Care Use" detail="Higher than US avg. (61%)" tone="green" />
              <MetricCard icon={<Home className="h-6 w-6" />} value={`${selected.area.housingAffordability}%`} label="Housing Affordability" detail="Of income on housing" tone="orange" />
              <MetricCard icon={<Info className="h-6 w-6" />} value={`${selected.area.uninsuredRate}%`} label="Uninsured Rate" detail="Lower than US avg. (8%)" />
              <MetricCard icon={<Bus className="h-6 w-6" />} value={selected.area.transitAccess} label="Transit Access" detail="Multiple options nearby" />
            </div>
          </section>

          <section className="rounded-lg border border-line-soft bg-white p-4 shadow-panel">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-black text-ink">Trends for {selected.town} (Past 5 Years)</h2>
              <button type="button" className="text-xs font-extrabold text-primary">
                View Details
              </button>
            </div>
            <TrendsChart listing={selected} />
          </section>

          <section className="rounded-lg border border-line-soft bg-white p-4 shadow-panel">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-ink">Nearby Healthcare Resources</h2>
              <button type="button" className="text-xs font-extrabold text-primary">
                View Map
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {selected.resources.map((resource) => (
                <div key={resource.id} className="flex gap-3 rounded-md bg-panel-soft p-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-blue-50 text-primary">
                    <ResourceIcon type={resource.type} />
                  </span>
                  <div>
                    <div className="text-sm font-extrabold text-ink">{resource.name}</div>
                    <div className="text-sm font-semibold text-slate-700">{resource.distanceMiles} miles</div>
                    <div className="text-xs text-slate-600">{resource.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-line-soft bg-panel-soft p-4 text-sm shadow-panel">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-7 w-7 shrink-0 text-primary" />
              <p className="font-semibold leading-6 text-slate-700">
                We use public community indicators only. No personal health data is collected, and this prototype does not provide medical, financial, or real-estate advice.
              </p>
            </div>
          </section>
        </aside>
      </div>

      <footer className="mx-auto mb-20 grid max-w-[1780px] gap-4 px-5 pb-6 md:grid-cols-3">
        <div className="rounded-lg bg-panel-soft p-4 text-sm font-semibold text-slate-700">
          Our mission: connect people with homes in communities that support better health and well-being.
        </div>
        <div className="rounded-lg bg-panel-soft p-4 text-sm font-semibold text-slate-700">
          Sources modeled: CDC PLACES, Census/ACS, HUD, HRSA, EPA/AirNow, GTFS and local transit agencies.
        </div>
        <div className="rounded-lg bg-panel-soft p-4 text-sm font-semibold text-slate-700">
          Search path: OCI Gen AI first, Vercel AI Gateway fallback, deterministic parser as final fallback.
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-[500] border-t border-line-soft bg-white/95 px-4 py-3 shadow-panel backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 text-xs font-bold text-navy">
          {[Home, Search, MapPin, Heart, SlidersHorizontal].map((Icon, index) => (
            <button key={index} className={`grid place-items-center gap-1 ${index === 0 ? "text-primary" : ""}`}>
              <Icon className="h-6 w-6" />
              {["Home", "Search", "Map", "Saved", "More"][index]}
            </button>
          ))}
        </div>
      </nav>

      {sourceOpen && (
        <div className="fixed inset-0 z-[1000] bg-navy/30" onClick={() => setSourceOpen(false)}>
          <aside
            className="ml-auto h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-ink">Data Sources & Definitions</h2>
                <p className="mt-1 text-sm font-semibold text-slate-600">Seeded public-data-inspired metrics for demo mode.</p>
              </div>
              <button type="button" onClick={() => setSourceOpen(false)} className="grid h-10 w-10 place-items-center rounded-md border border-line-soft">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-3">
              {dataSources.map((source) => (
                <div key={source.metric} className="rounded-lg border border-line-soft bg-panel-soft p-4">
                  <div className="text-base font-black text-ink">{source.metric}</div>
                  <div className="mt-1 text-sm font-bold text-primary">{source.source}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-700">{source.definition}</div>
                  <div className="mt-2 text-xs font-bold text-slate-500">{source.year}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {detailOpen && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-navy/30 p-4" onClick={() => setDetailOpen(false)}>
          <section
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-5 shadow-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-ink">{selected.address}</h2>
                <p className="font-semibold text-slate-700">
                  {selected.town}, {selected.state} {selected.zip}
                </p>
              </div>
              <button type="button" onClick={() => setDetailOpen(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-line-soft">
                <X className="h-5 w-5" />
              </button>
            </div>
            <Image
              src={selected.image}
              alt=""
              width={900}
              height={420}
              className="mb-4 h-64 w-full rounded-lg object-cover"
            />
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard icon={<Home className="h-6 w-6" />} value={`${formatMoney(selected.rent)}/mo`} label="Rent" detail={`${selected.beds} bed, ${selected.baths} bath, ${selected.sqft.toLocaleString()} sqft`} />
              <MetricCard icon={<Activity className="h-6 w-6" />} value={`${selected.score}`} label="Health Score" detail={selected.matchReasons.join(", ")} tone="green" />
              <MetricCard icon={<Bus className="h-6 w-6" />} value={selected.area.transitAccess} label="Transit" detail={`${selected.area.transitScore}/100 transit score`} />
            </div>
            <div className="mt-4">
              <ScorePanel listing={selected} />
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
