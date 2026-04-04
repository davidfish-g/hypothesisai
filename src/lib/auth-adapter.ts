import { sql } from "@/lib/db";
import type { Adapter, AdapterUser, AdapterAccount } from "next-auth/adapters";

export function BunSqlAdapter(): Adapter {
  return {
    async createUser(user: Omit<AdapterUser, "id">) {
      const rows = await sql`
        INSERT INTO users (id, name, email, image, "emailVerified")
        VALUES (gen_random_uuid(), ${user.name ?? null}, ${user.email}, ${user.image ?? null}, ${user.emailVerified ?? null})
        RETURNING id, name, email, image, "emailVerified", expertise, "scholarId"
      `;
      return mapUser(rows[0]);
    },

    async getUser(id: string) {
      const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
      return rows[0] ? mapUser(rows[0]) : null;
    },

    async getUserByEmail(email: string) {
      const rows = await sql`SELECT * FROM users WHERE email = ${email}`;
      return rows[0] ? mapUser(rows[0]) : null;
    },

    async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      const rows = await sql`
        SELECT u.* FROM users u
        JOIN accounts a ON u.id = a."userId"
        WHERE a."providerAccountId" = ${providerAccountId} AND a.provider = ${provider}
      `;
      return rows[0] ? mapUser(rows[0]) : null;
    },

    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      const rows = await sql`
        UPDATE users SET
          name = COALESCE(${user.name ?? null}, name),
          email = COALESCE(${user.email ?? null}, email),
          image = COALESCE(${user.image ?? null}, image),
          "emailVerified" = COALESCE(${user.emailVerified ?? null}, "emailVerified")
        WHERE id = ${user.id}
        RETURNING id, name, email, image, "emailVerified", expertise, "scholarId"
      `;
      return mapUser(rows[0]);
    },

    async linkAccount(account: AdapterAccount) {
      await sql`
        INSERT INTO accounts (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
        VALUES (gen_random_uuid(), ${account.userId}, ${account.type}, ${account.provider}, ${account.providerAccountId}, ${account.refresh_token ?? null}, ${account.access_token ?? null}, ${account.expires_at ?? null}, ${account.token_type ?? null}, ${account.scope ?? null}, ${account.id_token ?? null}, ${account.session_state ?? null})
      `;
      return account;
    },

    async createSession() {
      throw new Error("JWT strategy is used");
    },

    async getSessionAndUser() {
      throw new Error("JWT strategy is used");
    },

    async updateSession() {
      throw new Error("JWT strategy is used");
    },

    async deleteSession() {
      throw new Error("JWT strategy is used");
    },
  };
}

function mapUser(row: Record<string, unknown>): AdapterUser {
  return {
    id: row.id as string,
    name: row.name as string | null,
    email: row.email as string,
    emailVerified: row.emailVerified as Date | null,
    image: row.image as string | null,
    expertise: (row.expertise as string[]) ?? [],
    scholarId: (row.scholarId as string) ?? null,
  };
}
