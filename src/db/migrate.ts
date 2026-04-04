import { sql } from "bun";
import { readFileSync } from "fs";
import { join } from "path";

const schema = readFileSync(join(import.meta.dir, "schema.sql"), "utf-8");
await sql.unsafe(schema);
console.log("Schema applied successfully");
process.exit(0);
