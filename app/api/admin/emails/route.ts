import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getEmailStats, getEmailHistory } from "@/lib/email";
import { EmailType, EmailStatus } from "@prisma/client";

/**
 * API Route pour la gestion admin des emails
 * GET /api/admin/emails - Liste l'historique des emails avec statistiques
 *
 * @security Réservé aux administrateurs
 */
export async function GET(request: NextRequest) {
  // Vérification admin
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Accès non autorisé" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type") as EmailType | null;
    const status = searchParams.get("status") as EmailStatus | null;
    const email = searchParams.get("email") || undefined;

    // Récupérer les statistiques et l'historique en parallèle
    const [stats, history] = await Promise.all([
      getEmailStats(),
      getEmailHistory(page, limit, {
        type: type || undefined,
        status: status || undefined,
        email,
      }),
    ]);

    return NextResponse.json({
      stats,
      ...history,
    });
  } catch (error) {
    console.error("❌ Erreur récupération emails:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
