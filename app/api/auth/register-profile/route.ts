import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { verifyAuthRequest } from "@/app/lib/authServer";
import { getFirebaseAdmin } from "@/app/lib/firebaseAdmin";
import { checkRateLimit } from "@/app/lib/rateLimit";

function isValidTeacherCode(provided: string, expected: string): boolean {
  if (!expected || expected.length === 0) {
    return false;
  }

  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);

  if (providedBuf.length !== expectedBuf.length) {
    return false;
  }

  return timingSafeEqual(providedBuf, expectedBuf);
}

export async function POST(request: NextRequest) {
  const decoded = await verifyAuthRequest(request);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit(`register-profile:${decoded.uid}`, 5, 300_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  let body: { username?: string; teacherAccessCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const username = body.username?.trim();
  if (!username || username.length < 2 || username.length > 50) {
    return NextResponse.json({ error: "A valid username is required" }, { status: 400 });
  }

  const teacherAccessCode = body.teacherAccessCode?.trim() ?? "";
  const expectedTeacherCode = process.env.TEACHER_ACCESS_CODE?.trim() ?? "";

  let isTeacher = false;
  if (teacherAccessCode.length > 0) {
    if (!expectedTeacherCode) {
      return NextResponse.json(
        { error: "Teacher registration is not available" },
        { status: 400 }
      );
    }
    if (!isValidTeacherCode(teacherAccessCode, expectedTeacherCode)) {
      return NextResponse.json({ error: "Invalid teacher access code" }, { status: 400 });
    }
    isTeacher = true;
  }

  try {
    const admin = getFirebaseAdmin();
    const db = admin.firestore();
    const userRef = db.collection("users").doc(decoded.uid);
    const existing = await userRef.get();

    if (existing.exists) {
      return NextResponse.json({ isTeacher: existing.data()?.isTeacher === true });
    }

    await userRef.set({
      username,
      email: decoded.email ?? "",
      authID: decoded.uid,
      isAdmin: false,
      isTeacher,
      createdAt: new Date().toISOString(),
      exp: 0,
      level: 1,
      completedLessons: [],
      favorites: [],
      notes: {},
      badges: [],
      lastLogin: new Date().toISOString(),
    });

    return NextResponse.json({ isTeacher });
  } catch {
    return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 });
  }
}
