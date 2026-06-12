import { NextRequest } from "next/server";
import { getFirebaseAdmin } from "@/app/lib/firebaseAdmin";

export async function verifyAuthRequest(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return null;
  }

  try {
    const admin = getFirebaseAdmin();
    return await admin.auth().verifyIdToken(token);
  } catch {
    return null;
  }
}
