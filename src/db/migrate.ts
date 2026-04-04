import { Pool } from "pg";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const schema = readFileSync(join(__dirname, "schema.sql"), "utf-8");
await pool.query(schema);
console.log("Schema applied successfully");
await pool.end();
process.exit(0);
