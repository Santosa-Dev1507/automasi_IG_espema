import { NextRequest, NextResponse } from "next/server";
import { initDB, sql } from "@/lib/db";
import bcrypt from "bcryptjs";

// GET /api/init?secret=XXX — Initialize database tables and create default admin
// Run this ONCE after first deploy. Protected by INIT_SECRET env var.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const providedSecret = searchParams.get("secret");
  const expectedSecret = process.env.INIT_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "INIT_SECRET belum dikonfigurasi di env" },
      { status: 500 }
    );
  }

  if (providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await initDB();

    // Check if admin exists
    const existing = await sql`
      SELECT id FROM users WHERE email = 'admin@smpn5klaten.sch.id'
    `;

    let adminCreated = false;
    if (existing.rows.length === 0) {
      // Use temporary password from env, fallback warns user to change
      const initialPassword = process.env.INIT_ADMIN_PASSWORD || "admin123";
      const hashedPassword = await bcrypt.hash(initialPassword, 12);
      await sql`
        INSERT INTO users (name, email, password, role)
        VALUES ('Admin SMPN 5', 'admin@smpn5klaten.sch.id', ${hashedPassword}, 'admin')
      `;
      adminCreated = true;
    }

    return NextResponse.json({
      success: true,
      adminCreated,
      message: adminCreated
        ? "Database & admin dibuat. SEGERA ganti password default!"
        : "Database sudah ter-init.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Init failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
