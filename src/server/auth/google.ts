import { getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import { query } from "@/lib/db";
import type { SessionUser } from "@/server/auth/session";

const stateCookieName = "hypothesisai_oauth_state";

type GoogleUserInfo = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export function getAppOrigin(c: Context) {
  return process.env.APP_URL || new URL(c.req.url).origin;
}

export function googleRedirectUri(c: Context) {
  return `${getAppOrigin(c)}/auth/google/callback`;
}

export function startGoogleAuth(c: Context) {
  const state = crypto.randomUUID();
  const callbackUrl = internalCallbackUrl(c.req.query("callbackUrl"));
  const stateValue = JSON.stringify({ state, callbackUrl });

  setCookie(c, stateCookieName, stateValue, {
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
  });

  const params = new URLSearchParams({
    client_id: requireEnv("GOOGLE_CLIENT_ID"),
    redirect_uri: googleRedirectUri(c),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

export async function finishGoogleAuth(c: Context) {
  const code = c.req.query("code");
  const state = c.req.query("state");
  const storedState = getCookie(c, stateCookieName);

  setCookie(c, stateCookieName, "", {
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });

  if (!code || !state || !storedState) {
    return { error: "Missing OAuth callback parameters", user: null, callbackUrl: "/" };
  }

  const parsedState = parseStoredState(storedState);
  if (!parsedState) {
    return { error: "Invalid OAuth state cookie", user: null, callbackUrl: "/" };
  }

  const { state: expectedState, callbackUrl } = parsedState;
  if (state !== expectedState) {
    return { error: "Invalid OAuth state", user: null, callbackUrl: "/" };
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: requireEnv("GOOGLE_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_CLIENT_SECRET"),
      redirect_uri: googleRedirectUri(c),
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Google token exchange failed (${tokenResponse.status}): ${error}`);
  }

  const tokenData = (await tokenResponse.json()) as {
    access_token: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
    id_token?: string;
  };

  const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  if (!userInfoResponse.ok) {
    const error = await userInfoResponse.text();
    throw new Error(`Google userinfo failed (${userInfoResponse.status}): ${error}`);
  }

  const profile = (await userInfoResponse.json()) as GoogleUserInfo;
  const user = await upsertGoogleUser(profile, tokenData);
  return { error: null, user, callbackUrl };
}

async function upsertGoogleUser(
  profile: GoogleUserInfo,
  tokenData: {
    access_token: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
    id_token?: string;
  }
): Promise<SessionUser> {
  const existingByAccount = await query(
    `SELECT u.* FROM users u
     JOIN accounts a ON u.id = a."userId"
     WHERE a.provider = $1 AND a."providerAccountId" = $2`,
    ["google", profile.sub]
  );

  let user = existingByAccount[0];

  if (!user) {
    const existingByEmail = await query(`SELECT * FROM users WHERE email = $1`, [profile.email]);
    user = existingByEmail[0];
  }

  if (user) {
    const rows = await query(
      `UPDATE users SET
         name = COALESCE($1, name),
         image = COALESCE($2, image),
         "emailVerified" = COALESCE("emailVerified", $3),
         "updatedAt" = NOW()
       WHERE id = $4
       RETURNING id, name, email, image, expertise, "scholarId"`,
      [
        profile.name ?? null,
        profile.picture ?? null,
        profile.email_verified ? new Date() : null,
        user.id,
      ]
    );
    user = rows[0];
  } else {
    const rows = await query(
      `INSERT INTO users (id, name, email, image, "emailVerified")
       VALUES (gen_random_uuid(), $1, $2, $3, $4)
       RETURNING id, name, email, image, expertise, "scholarId"`,
      [
        profile.name ?? null,
        profile.email,
        profile.picture ?? null,
        profile.email_verified ? new Date() : null,
      ]
    );
    user = rows[0];
  }

  const expiresAt = tokenData.expires_in
    ? Math.floor(Date.now() / 1000) + tokenData.expires_in
    : null;

  await query(
    `INSERT INTO accounts (id, "userId", type, provider, "providerAccountId", access_token, expires_at, token_type, scope, id_token)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (provider, "providerAccountId")
     DO UPDATE SET access_token = EXCLUDED.access_token,
       expires_at = EXCLUDED.expires_at,
       token_type = EXCLUDED.token_type,
       scope = EXCLUDED.scope,
       id_token = EXCLUDED.id_token`,
    [
      user.id,
      "oauth",
      "google",
      profile.sub,
      tokenData.access_token ?? null,
      expiresAt,
      tokenData.token_type ?? null,
      tokenData.scope ?? null,
      tokenData.id_token ?? null,
    ]
  );

  return {
    id: user.id as string,
    name: (user.name as string | null) ?? profile.name ?? null,
    email: user.email as string,
    image: (user.image as string | null) ?? profile.picture ?? null,
    expertise: (user.expertise as string[]) ?? [],
    scholarId: (user.scholarId as string | null) ?? null,
  };
}

function internalCallbackUrl(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

function parseStoredState(value: string) {
  try {
    const parsed = JSON.parse(value) as {
      state?: string;
      callbackUrl?: string;
    };

    if (!parsed.state) return null;
    return {
      state: parsed.state,
      callbackUrl: internalCallbackUrl(parsed.callbackUrl),
    };
  } catch {
    return null;
  }
}
