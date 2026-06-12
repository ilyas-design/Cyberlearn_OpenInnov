import admin from "firebase-admin";
import fs from "fs";
import path from "path";

function loadServiceAccount(): admin.ServiceAccount {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (serviceAccountPath) {
    const resolved = path.resolve(process.cwd(), serviceAccountPath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Firebase service account file not found: ${resolved}`);
    }
    return JSON.parse(fs.readFileSync(resolved, "utf8")) as admin.ServiceAccount;
  }

  if (clientEmail && privateKey && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    };
  }

  throw new Error(
    "Firebase Admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY in .env"
  );
}

export function getFirebaseAdmin(): typeof admin {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(loadServiceAccount()),
    });
  }
  return admin;
}
