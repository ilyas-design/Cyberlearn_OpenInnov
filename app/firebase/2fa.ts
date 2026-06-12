import { auth } from "./config";

async function getAuthHeaders(): Promise<HeadersInit> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("User not authenticated");
  }

  const idToken = await currentUser.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${idToken}`,
  };
}

export const enableTwoFactor = async (secret: string, code: string): Promise<boolean> => {
  const response = await fetch("/api/auth/setup-2fa", {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ secret, code }),
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.success === true;
};

export const verifyTwoFactorCode = async (_userId: string, code: string): Promise<boolean> => {
  const response = await fetch("/api/auth/verify-2fa", {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.valid === true;
};
