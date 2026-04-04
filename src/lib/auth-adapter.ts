import { query } from "@/lib/db";
import type { Adapter, AdapterUser, AdapterAccount } from "next-auth/adapters";

export function PgAdapter(): Adapter {
  return {
    async createUser(user: Omit<AdapterUser, "id">) {
      const rows = await query(
        `INSERT INTO users (id, name, email, image, "emailVerified")
         VALUES (gen_random_uuid(), $1, $2, $3, $4)
         RETURNING id, name, email, image, "emailVerified", expertise, "scholarId"`,
        [user.name ?? null, user.email, user.image ?? null, user.emailVerified ?? null]
      );
      return mapUser(rows[0]);
    },

    async getUser(id: string) {
      const rows = await query(`SELECT * FROM users WHERE id = $1`, [id]);
      return rows[0] ? mapUser(rows[0]) : null;
    },

    async getUserByEmail(email: string) {
      const rows = await query(`SELECT * FROM users WHERE email = $1`, [email]);
      return rows[0] ? mapUser(rows[0]) : null;
    },

    async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      const rows = await query(
        `SELECT u.* FROM users u
         JOIN accounts a ON u.id = a."userId"
         WHERE a."providerAccountId" = $1 AND a.provider = $2`,
        [providerAccountId, provider]
      );
      return rows[0] ? mapUser(rows[0]) : null;
    },

    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      const rows = await query(
        `UPDATE users SET
           name = COALESCE($1, name),
           email = COALESCE($2, email),
           image = COALESCE($3, image),
           "emailVerified" = COALESCE($4, "emailVerified")
         WHERE id = $5
         RETURNING id, name, email, image, "emailVerified", expertise, "scholarId"`,
        [user.name ?? null, user.email ?? null, user.image ?? null, user.emailVerified ?? null, user.id]
      );
      return mapUser(rows[0]);
    },

    async linkAccount(account: AdapterAccount) {
      await query(
        `INSERT INTO accounts (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [account.userId, account.type, account.provider, account.providerAccountId, account.refresh_token ?? null, account.access_token ?? null, account.expires_at ?? null, account.token_type ?? null, account.scope ?? null, account.id_token ?? null, account.session_state ?? null]
      );
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
