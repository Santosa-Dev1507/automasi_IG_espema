import { createPool, VercelPool } from "@vercel/postgres";

type Primitive = string | number | boolean | undefined | null;

/**
 * Get connection string from any of the standard env var names.
 * Neon integration may use DATABASE_URL while @vercel/postgres expects POSTGRES_URL.
 */
function getConnectionString(): string {
  const url =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!url) {
    throw new Error(
      "Database connection string belum dikonfigurasi. Set POSTGRES_URL atau DATABASE_URL di env."
    );
  }
  return url;
}

let pool: VercelPool | null = null;

function getPool(): VercelPool {
  if (!pool) {
    pool = createPool({ connectionString: getConnectionString() });
  }
  return pool;
}

// Provide an `sql` tagged template that delegates to a lazy pool.
export const sql = ((strings: TemplateStringsArray, ...values: Primitive[]) => {
  return getPool().sql(strings, ...values);
}) as VercelPool["sql"];

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'editor',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      caption TEXT,
      hashtags TEXT[],
      media_url TEXT,
      media_type VARCHAR(20) DEFAULT 'FEED',
      location VARCHAR(255),
      status VARCHAR(20) DEFAULT 'draft',
      scheduled_at TIMESTAMP,
      posted_at TIMESTAMP,
      ig_post_id VARCHAR(100),
      error_message TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(100) UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS analytics (
      id SERIAL PRIMARY KEY,
      post_id INTEGER REFERENCES posts(id),
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      reach INTEGER DEFAULT 0,
      impressions INTEGER DEFAULT 0,
      fetched_at TIMESTAMP DEFAULT NOW()
    )
  `;
}
