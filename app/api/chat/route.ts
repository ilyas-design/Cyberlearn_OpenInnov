import { NextRequest, NextResponse } from "next/server";
import { buildChatbotPrompt, getFallbackResponse } from "@/app/lib/chatbotContext";
import { checkRateLimit } from "@/app/lib/rateLimit";

const CHATBOT_API_URL = process.env.CHATBOT_API_URL ?? "http://localhost:8080";
const CHATBOT_INTERNAL_API_KEY = process.env.CHATBOT_INTERNAL_API_KEY ?? "";
const CHATBOT_API_TIMEOUT_MS = 5_000;
const MAX_MESSAGE_LENGTH = 2000;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "local";
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(`chat:${getClientIp(request)}`, 30, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before sending another message." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  let body: { message?: string; locale?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = body.message?.trim();
  const locale = body.locale === "en" ? "en" : "fr";

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer` },
      { status: 400 }
    );
  }

  if (!CHATBOT_INTERNAL_API_KEY) {
    const fallback = getFallbackResponse(message, locale);
    return NextResponse.json({
      response: fallback,
      source: "fallback",
    });
  }

  try {
    const response = await fetch(`${CHATBOT_API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Api-Key": CHATBOT_INTERNAL_API_KEY,
      },
      body: JSON.stringify({ message: buildChatbotPrompt(message, locale) }),
      signal: AbortSignal.timeout(CHATBOT_API_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Chatbot API returned ${response.status}`);
    }

    const data = await response.json();
    const reply = data.response?.trim();

    if (!reply) {
      throw new Error("Empty response from chatbot API");
    }

    return NextResponse.json({ response: reply, source: "api" });
  } catch {
    const fallback = getFallbackResponse(message, locale);
    return NextResponse.json({
      response: fallback,
      source: "fallback",
    });
  }
}
