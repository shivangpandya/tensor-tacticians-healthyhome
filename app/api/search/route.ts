import { NextResponse } from "next/server";
import { defaultIntent, listings } from "@/lib/data";
import { parseWithOci } from "@/lib/ai/oci";
import { parseWithVercelGateway } from "@/lib/ai/vercel-gateway";
import { parseIntentLocally } from "@/lib/local-parser";
import { rankListings } from "@/lib/ranking";
import type { SearchResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    query?: string;
    promptId?: string;
  };
  const query = body.query?.trim() || "Show me rentals under $2,000/month near 04043 with low diabetes and good preventive care.";
  const attempted: string[] = [];

  let intent = defaultIntent;
  let provider: SearchResponse["aiMeta"]["provider"] = "local-fallback";

  attempted.push("oci");
  const ociIntent = await parseWithOci(query, defaultIntent);

  if (ociIntent) {
    intent = ociIntent;
    provider = "oci";
  } else {
    attempted.push("vercel-ai-gateway");
    const gatewayIntent = await parseWithVercelGateway(query, defaultIntent);

    if (gatewayIntent) {
      intent = gatewayIntent;
      provider = "vercel-ai-gateway";
    } else {
      attempted.push("local-fallback");
      intent = parseIntentLocally(query);
    }
  }

  const rankedListings = rankListings(listings, intent);
  const response: SearchResponse = {
    intent,
    listings: rankedListings,
    selectedListingId: rankedListings[0]?.id ?? listings[0].id,
    aiMeta: {
      provider,
      attempted,
      confidence: intent.confidence,
      note:
        provider === "oci"
          ? "Parsed with OCI Generative AI."
          : provider === "vercel-ai-gateway"
            ? "OCI was unavailable, so Vercel AI Gateway parsed the request."
            : "AI services were unavailable or unconfigured, so a deterministic parser kept the demo working."
    }
  };

  return NextResponse.json(response);
}
