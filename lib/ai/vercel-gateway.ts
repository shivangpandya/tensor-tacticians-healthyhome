import { buildSearchPrompt, extractJsonObject, normalizeIntent } from "@/lib/search-intent";
import type { SearchIntent } from "@/lib/types";

export async function parseWithVercelGateway(query: string, fallback: SearchIntent): Promise<SearchIntent | null> {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  const model = process.env.AI_GATEWAY_MODEL;

  if (!apiKey || !model) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "Return valid JSON only. No markdown, no prose."
          },
          {
            role: "user",
            content: buildSearchPrompt(query)
          }
        ],
        temperature: 0,
        stream: false,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return null;
    }

    const json = extractJsonObject(content);
    return json ? normalizeIntent(json, fallback) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
