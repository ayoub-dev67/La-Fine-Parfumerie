import { NextRequest, NextResponse } from "next/server";
import { processScheduledEmails } from "@/lib/email";

/**
 * API Route pour traiter les emails programmés
 * GET /api/cron/emails
 *
 * Cette route doit être appelée périodiquement (cron job)
 * Par exemple avec Vercel Cron Jobs ou un service externe
 *
 * @security Protégée par un secret dans l'header
 */
export async function GET(request: NextRequest) {
  // Vérification du secret de cron
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn("⚠️ Tentative d'accès non autorisé au cron emails");
    return NextResponse.json(
      { error: "Non autorisé" },
      { status: 401 }
    );
  }

  try {
    console.log("🔄 Démarrage traitement emails programmés...");

    const result = await processScheduledEmails();

    console.log(`✅ Emails traités: ${result.processed} succès, ${result.errors} erreurs`);

    return NextResponse.json({
      success: true,
      processed: result.processed,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erreur traitement emails programmés:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors du traitement",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
