import type { SearchFilters } from "./properties";

export interface ParsedIntent extends SearchFilters {
  summary?: string;
}

const SYSTEM_PROMPT = `You are a property search assistant for ABODE, a new-build home platform in Edinburgh, Scotland.
Extract search intent from the user's natural language query and return a JSON object with these fields:
- beds: number (bedrooms requested, e.g. 3)
- max_price: number (maximum price in GBP, e.g. 500000)
- min_price: number (minimum price if specified)
- near: array of strings from ["school", "station", "park", "transport"]
- keywords: array of relevant keywords from ["family", "commuter", "modern", "luxury", "apartment", "house"]
- summary: a one-sentence friendly description of what the user is looking for

Only include fields that are clearly specified or strongly implied. Return valid JSON only, no markdown.`;

export async function parseIntent(query: string): Promise<ParsedIntent> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === "your_openai_api_key_here") {
    return fallbackParse(query);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: query },
        ],
        temperature: 0.1,
        max_tokens: 256,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return fallbackParse(query);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return fallbackParse(query);

    const parsed = JSON.parse(content);
    return {
      beds: parsed.beds,
      max_price: parsed.max_price,
      min_price: parsed.min_price,
      near: parsed.near,
      keywords: parsed.keywords,
      summary: parsed.summary,
    };
  } catch {
    return fallbackParse(query);
  }
}

function fallbackParse(query: string): ParsedIntent {
  const q = query.toLowerCase();
  const intent: ParsedIntent = {};

  const bedMatch = q.match(/\b([1-5])\s*(?:bed(?:room)?s?|br)\b/);
  if (bedMatch) intent.beds = parseInt(bedMatch[1]);

  const priceMatch = q.match(/(?:under|below|max|up to|£)\s*(?:£?\s*)?([0-9,]+)\s*k?/i);
  if (priceMatch) {
    let price = parseInt(priceMatch[1].replace(/,/g, ""));
    if (q.includes("k") && price < 10000) price *= 1000;
    intent.max_price = price;
  }

  const near: string[] = [];
  if (/school|family|kid|child/.test(q)) near.push("school");
  if (/station|train|tram|commut|transport/.test(q)) near.push("station");
  if (/park|green|garden|outdoor/.test(q)) near.push("park");
  if (near.length > 0) intent.near = near;

  const summaryParts: string[] = [];
  if (intent.beds) summaryParts.push(`${intent.beds}-bedroom`);
  if (near.includes("school")) summaryParts.push("family-friendly");
  if (near.includes("station")) summaryParts.push("commuter-friendly");
  summaryParts.push("homes in Edinburgh");
  if (intent.max_price) summaryParts.push(`under £${(intent.max_price / 1000).toFixed(0)}k`);

  intent.summary = summaryParts.length > 1 ? summaryParts.join(" ") : `Homes in Edinburgh matching "${query}"`;

  return intent;
}
