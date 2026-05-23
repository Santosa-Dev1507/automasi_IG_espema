import { sql } from "@vercel/postgres";

export { sql };

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
