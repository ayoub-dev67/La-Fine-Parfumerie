import { NextResponse } from "next/server";

/**
 * Route de debug pour vérifier la configuration NextAuth
 * GET /api/auth/debug
 */
export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    nextauthUrl: process.env.NEXTAUTH_URL || "NON DÉFINI",
    authSecret: process.env.AUTH_SECRET ? "DÉFINI" : "NON DÉFINI",
    nextauthSecret: process.env.NEXTAUTH_SECRET ? "DÉFINI" : "NON DÉFINI",
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    googleClientIdPreview: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + "...",
    hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
  });
}
