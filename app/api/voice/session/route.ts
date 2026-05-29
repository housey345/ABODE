import { NextRequest, NextResponse } from "next/server";
import { ISLA } from "@/lib/persona";
import { checkRateLimit, sameOriginOnly } from "@/lib/rate-limit";

// Mints a short-lived OpenAI Realtime ephemeral token for the browser.
// The browser uses client_secret.value to open a WebRTC peer connection
// directly to the Realtime endpoint — OPENAI_API_KEY never leaves the server.
export async function POST(req: NextRequest) {
  // Token minting bills our OpenAI account — gate it tightly.
  const origin = sameOriginOnly(req);
  if (origin) return origin;
  const limited = checkRateLimit(req, { key: "voice", limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Voice search is not configured on this server." },
      { status: 503 }
    );
  }

  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: "gpt-realtime-2",
          instructions: ISLA.voiceSystemPrompt,
          // Transcription only — the client requests text modality and does not
          // play audio back, so no output voice is provisioned.
          audio: {
            input: { transcription: { model: "gpt-4o-mini-transcribe" } },
          },
        },
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach OpenAI. Try again." },
      { status: 502 }
    );
  }

  if (!response.ok) {
    const body = await response.text();
    return NextResponse.json(
      { error: "OpenAI returned an error.", detail: body },
      { status: response.status }
    );
  }

  const session = await response.json();
  return NextResponse.json(session);
}
