// Applies every .sql file in scripts/migrations, in filename order.
// Each statement uses IF NOT EXISTS, so this is safe to re-run any time
// (on a fresh DB, after a schema change, or as a Vercel deploy step).
//
//   node --env-file=.env.local scripts/migrate.mjs
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env.local (see .env.example) before running this script.");
  process.exit(1);
}

const migrationsDir = path.join(import.meta.dirname, "migrations");
const files = (await readdir(migrationsDir)).filter((f) => f.endsWith(".sql")).sort();

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

try {
  for (const file of files) {
    const contents = await readFile(path.join(migrationsDir, file), "utf8");
    console.log(`Applying ${file}...`);
    await sql.unsafe(contents);
  }
  console.log(`Done — ${files.length} migration file(s) applied.`);
} finally {
  await sql.end();
}
