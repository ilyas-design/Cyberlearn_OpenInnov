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

  const rateLimit = checkRateLimit(`2fa-verify:${decoded.uid}`, 10, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const code = body.code?.trim();
  if (!code || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "A valid 6-digit code is required" }, { status: 400 });
  }

  try {
    const admin = getFirebaseAdmin();
    const db = admin.firestore();
    const secretRef = db.collection("userSecrets").doc(decoded.uid);
    const secretDoc = await secretRef.get();

    let secret = secretDoc.data()?.twoFactorSecret as string | undefined;

    // Migrate legacy secrets stored on the user document
    if (!secret) {
      const userDoc = await db.collection("users").doc(decoded.uid).get();
      secret = userDoc.data()?.twoFactorSecret as string | undefined;

      if (secret) {
        const batch = db.batch();
        batch.set(secretRef, { twoFactorSecret: secret });
        batch.set(
          db.collection("users").doc(decoded.uid),
          { twoFactorSecret: admin.firestore.FieldValue.delete() },
          { merge: true }
        );
        await batch.commit();
      }
    }

    if (!secret) {
      return NextResponse.json({ error: "2FA is not configured" }, { status: 400 });
    }

    const isValid = authenticator.verify({ token: code, secret });
    return NextResponse.json({ valid: isValid });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
