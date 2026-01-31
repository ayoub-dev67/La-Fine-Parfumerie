-- AlterTable
ALTER TABLE "products" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isNew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notesBase" TEXT,
ADD COLUMN     "notesHeart" TEXT,
ADD COLUMN     "notesTop" TEXT,
ADD COLUMN     "subcategory" TEXT,
ADD COLUMN     "volume" TEXT;

-- CreateIndex
CREATE INDEX "products_brand_idx" ON "products"("brand");

-- CreateIndex
CREATE INDEX "products_isFeatured_idx" ON "products"("isFeatured");
