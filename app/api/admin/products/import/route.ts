import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * POST /api/admin/products/import
 * Import des produits depuis un CSV
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Fichier CSV requis" },
        { status: 400 }
      );
    }

    const csvText = await file.text();
    const lines = csvText.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "Le fichier CSV est vide ou invalide" },
        { status: 400 }
      );
    }

    // Ignorer l'en-tête
    const dataLines = lines.slice(1);

    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];

      try {
        // Parser la ligne CSV (gestion des guillemets)
        const values = parseCSVLine(line);

        if (values.length < 10) {
          results.errors.push(`Ligne ${i + 2}: Nombre de colonnes insuffisant`);
          continue;
        }

        const [
          idStr,
          name,
          brand,
          description,
          priceStr,
          volume,
          image,
          category,
          subcategory,
          stockStr,
          notesTop,
          notesHeart,
          notesBase,
          isFeaturedStr,
          isNewStr,
          isBestSellerStr,
        ] = values;

        // Validation basique
        if (!name || !category) {
          results.errors.push(`Ligne ${i + 2}: Nom et catégorie requis`);
          continue;
        }

        const price = parseFloat(priceStr) || 0;
        const stock = parseInt(stockStr) || 0;
        const isFeatured = isFeaturedStr?.toLowerCase() === "oui" || isFeaturedStr === "true";
        const isNew = isNewStr?.toLowerCase() === "oui" || isNewStr === "true";
        const isBestSeller = isBestSellerStr?.toLowerCase() === "oui" || isBestSellerStr === "true";

        const productData = {
          name: name.trim(),
          brand: brand?.trim() || null,
          description: description?.trim() || "",
          price,
          volume: volume?.trim() || null,
          image: image?.trim() || "/images/placeholder.jpg",
          category: category.trim(),
          subcategory: subcategory?.trim() || null,
          stock,
          notesTop: notesTop?.trim() || null,
          notesHeart: notesHeart?.trim() || null,
          notesBase: notesBase?.trim() || null,
          isFeatured,
          isNew,
          isBestSeller,
        };

        // Si ID fourni, essayer de mettre à jour
        const id = parseInt(idStr);
        if (id && !isNaN(id)) {
          const existing = await prisma.product.findUnique({
            where: { id },
          });

          if (existing) {
            await prisma.product.update({
              where: { id },
              data: productData,
            });
            results.updated++;
          } else {
            await prisma.product.create({
              data: productData,
            });
            results.created++;
          }
        } else {
          // Créer un nouveau produit
          await prisma.product.create({
            data: productData,
          });
          results.created++;
        }
      } catch (error) {
        results.errors.push(`Ligne ${i + 2}: Erreur de traitement`);
        console.error(`Erreur import ligne ${i + 2}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import terminé: ${results.created} créé(s), ${results.updated} mis à jour`,
      ...results,
    });
  } catch (error) {
    console.error("Erreur import produits:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * Parser une ligne CSV en tenant compte des guillemets
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Guillemet échappé
        current += '"';
        i++;
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}
