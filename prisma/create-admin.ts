import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🔐 Création de l'utilisateur admin...\n");

  const email = "admin@lafineparfumerie.fr";
  const password = "admin123"; // À changer en production !
  const hashedPassword = await bcrypt.hash(password, 10);

  // Vérifier si l'admin existe déjà
  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log("⚠️  L'admin existe déjà !");
    console.log(`📧 Email: ${email}`);
    console.log("🔑 Mot de passe: admin123\n");
    return;
  }

  // Créer l'admin
  const admin = await prisma.user.create({
    data: {
      email,
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log("✅ Admin créé avec succès !\n");
  console.log("📧 Email: admin@lafineparfumerie.fr");
  console.log("🔑 Mot de passe: admin123");
  console.log("\n🔗 Connectez-vous sur: http://localhost:3000/login\n");
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
