import { NextRequest, NextResponse } from "next/server";
import { authenticator } from "otplib";
import { verifyAuthRequest } from "@/app/lib/authServer";
import { getFirebaseAdmin } from "@/app/lib/firebaseAdmin";
import { checkRateLimit } from "@/app/lib/rateLimit";

export async function POST(request: NextRequest) {
  const decoded = await verifyAuthRequest(request);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit(`2fa-setup:${decoded.uid}`, 5, 300_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many setup attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  let body: { secret?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const secret = body.secret?.trim();
  const code = body.code?.trim();

  if (!secret || secret.length < 16) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 400 });
  }

  if (!code || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "A valid 6-digit code is required" }, { status: 400 });
  }

  const isValid = authenticator.verify({ token: code, secret });
  if (!isValid) {
    return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
  }

  try {
    const admin = getFirebaseAdmin();
    const db = admin.firestore();
    const batch = db.batch();

    batch.set(db.collection("userSecrets").doc(decoded.uid), { twoFactorSecret: secret });
    batch.set(
      db.collection("users").doc(decoded.uid),
      { twoFactorEnabled: true },
      { merge: true }
    );

    await batch.commit();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to enable 2FA" }, { status: 500 });
  }
}
