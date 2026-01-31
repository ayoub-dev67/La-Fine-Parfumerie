/**
 * API Import Produits CSV
 * POST /api/admin/import/products
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { productsListCache } from '@/lib/redis';
import Papa from 'papaparse';
import { z } from 'zod';

const productRowSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  brand: z.string().optional(),
  description: z.string().min(1, 'Description requise'),
  price: z.coerce.number().positive('Prix invalide'),
  volume: z.string().optional(),
  category: z.enum(['Signature', 'Niche', 'Femme', 'Homme', 'Coffret']),
  subcategory: z.string().optional(),
  stock: z.coerce.number().int().min(0, 'Stock invalide'),
  notesTop: z.string().optional(),
  notesHeart: z.string().optional(),
  notesBase: z.string().optional(),
  isFeatured: z.string().optional().transform((v) => v?.toLowerCase() === 'oui'),
  isNew: z.string().optional().transform((v) => v?.toLowerCase() === 'oui'),
  isBestSeller: z.string().optional().transform((v) => v?.toLowerCase() === 'oui'),
  image: z.string().url('URL image invalide'),
});

interface ImportResult {
  success: number;
  errors: Array<{ line: number; errors: string[] }>;
  created: number;
  updated: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 });
    }

    const content = await file.text();

    const parsed = Papa.parse(content, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        {
          error: 'Erreur de parsing CSV',
          details: parsed.errors,
        },
        { status: 400 }
      );
    }

    const result: ImportResult = {
      success: 0,
      errors: [],
      created: 0,
      updated: 0,
    };

    for (let i = 0; i < parsed.data.length; i++) {
      const row = parsed.data[i] as Record<string, string>;
      const lineNumber = i + 2; // +2 car header + index 0

      try {
        const validated = productRowSchema.parse(row);

        // Vérifier si le produit existe (par ID ou par nom+marque)
        let existingProduct = null;
        if (row.id) {
          existingProduct = await prisma.product.findUnique({
            where: { id: parseInt(row.id) },
          });
        }

        if (!existingProduct && validated.name && validated.brand) {
          existingProduct = await prisma.product.findFirst({
            where: {
              name: validated.name,
              brand: validated.brand,
            },
          });
        }

        if (existingProduct) {
          // Mise à jour
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              name: validated.name,
              brand: validated.brand || null,
              description: validated.description,
              price: validated.price,
              volume: validated.volume || null,
              category: validated.category,
              subcategory: validated.subcategory || null,
              stock: validated.stock,
              notesTop: validated.notesTop || null,
              notesHeart: validated.notesHeart || null,
              notesBase: validated.notesBase || null,
              isFeatured: validated.isFeatured,
              isNew: validated.isNew,
              isBestSeller: validated.isBestSeller,
              image: validated.image,
            },
          });
          result.updated++;
        } else {
          // Création
          await prisma.product.create({
            data: {
              name: validated.name,
              brand: validated.brand || null,
              description: validated.description,
              price: validated.price,
              volume: validated.volume || null,
              category: validated.category,
              subcategory: validated.subcategory || null,
              stock: validated.stock,
              notesTop: validated.notesTop || null,
              notesHeart: validated.notesHeart || null,
              notesBase: validated.notesBase || null,
              isFeatured: validated.isFeatured,
              isNew: validated.isNew,
              isBestSeller: validated.isBestSeller,
              image: validated.image,
            },
          });
          result.created++;
        }

        result.success++;
      } catch (error) {
        if (error instanceof z.ZodError) {
          result.errors.push({
            line: lineNumber,
            errors: error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
          });
        } else {
          result.errors.push({
            line: lineNumber,
            errors: [(error as Error).message],
          });
        }
      }
    }

    // Invalider le cache
    await productsListCache.invalidateAll();

    return NextResponse.json({
      success: true,
      imported: result.success,
      created: result.created,
      updated: result.updated,
      errors: result.errors,
      message: `${result.success} produits importés (${result.created} créés, ${result.updated} mis à jour), ${result.errors.length} erreurs`,
    });
  } catch (error) {
    console.error('[IMPORT API] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
