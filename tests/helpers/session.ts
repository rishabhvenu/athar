import type { BrowserContext } from "@playwright/test";

type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: "bearer";
  user: {
    id: string;
    aud: "authenticated";
    role: "authenticated";
    email: string;
  };
};

function encodeSupabaseCookie(session: SupabaseSession) {
  return `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`;
}

export async function addSupabaseAuthCookie(context: BrowserContext, baseURL: string) {
  const session: SupabaseSession = {
    access_token: "e2e-token",
    refresh_token: "e2e-refresh-token",
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    expires_in: 60 * 60,
    token_type: "bearer",
    user: {
      id: "user-1",
      aud: "authenticated",
      role: "authenticated",
      email: "e2e@example.com",
    },
  };

  await context.addCookies([
    {
      name: "sb-127-auth-token",
      value: encodeSupabaseCookie(session),
      url: baseURL,
      httpOnly: false,
      sameSite: "Lax",
    },
  ]);
}
