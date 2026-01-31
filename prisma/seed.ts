import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Catalogue La Fine Parfumerie - Strasbourg
 * Collection complète avec notes olfactives
 */
const products = [
  // ============================================
  // COLLECTION SIGNATURE ROYALE (40€ / 50ml)
  // ============================================
  {
    id: 1,
    name: "Mythologia",
    brand: "Signature Royale",
    description: "Un voyage mythique aux accords divins. Une fragrance qui évoque les légendes anciennes avec une touche moderne et raffinée.",
    price: 40.0,
    volume: "50ml",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800",
    category: "Signature",
    notesTop: "Bergamote, Pamplemousse, Poivre rose",
    notesHeart: "Iris, Jasmin, Rose de Mai",
    notesBase: "Ambre gris, Musc blanc, Bois de santal",
    stock: 25,
    isFeatured: true,
    isNew: true,
  },
  {
    id: 2,
    name: "Grey London",
    brand: "Signature Royale",
    description: "L'élégance britannique capturée dans un flacon. Notes boisées et cuirées pour un style aristocratique intemporel.",
    price: 40.0,
    volume: "50ml",
    image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800",
    category: "Signature",
    notesTop: "Lavande anglaise, Menthe, Cardamome",
    notesHeart: "Cuir, Géranium, Violette",
    notesBase: "Vétiver, Cèdre, Mousse de chêne",
    stock: 30,
    isFeatured: true,
  },
  {
    id: 3,
    name: "Ghost Oud",
    brand: "Signature Royale",
    description: "Un oud mystérieux et envoûtant. La quintessence de l'orient dans une interprétation moderne et accessible.",
    price: 40.0,
    volume: "50ml",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800",
    category: "Signature",
    notesTop: "Safran, Rose de Damas, Encens",
    notesHeart: "Oud, Patchouli, Cyprès",
    notesBase: "Ambre, Musc, Résine de benjoin",
    stock: 20,
    isBestSeller: true,
  },
  {
    id: 4,
    name: "African Legend",
    brand: "Signature Royale",
    description: "L'esprit sauvage de l'Afrique. Des notes chaudes et épicées qui racontent une histoire de terres lointaines.",
    price: 40.0,
    volume: "50ml",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800",
    category: "Signature",
    notesTop: "Gingembre, Baies roses, Mandarine",
    notesHeart: "Fève Tonka, Café, Bois de gaïac",
    notesBase: "Vanille bourbon, Ambre, Cuir",
    stock: 22,
  },
  {
    id: 5,
    name: "Dragée Blanc",
    brand: "Signature Royale",
    description: "La douceur d'une dragée sublimée. Un parfum gourmand et délicat, parfait pour les âmes romantiques.",
    price: 40.0,
    volume: "50ml",
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800",
    category: "Signature",
    notesTop: "Amande douce, Fleur d'oranger, Bergamote",
    notesHeart: "Praline, Iris, Héliotrope",
    notesBase: "Vanille, Musc blanc, Caramel",
    stock: 28,
    isFeatured: true,
  },
  {
    id: 6,
    name: "Caramel Sugar",
    brand: "Signature Royale",
    description: "Une gourmandise irrésistible. Le caramel rencontre des notes florales pour une addiction olfactive unique.",
    price: 40.0,
    volume: "50ml",
    image: "https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=800",
    category: "Signature",
    notesTop: "Caramel, Pomme cuite, Cannelle",
    notesHeart: "Jasmin, Tubéreuse, Fleur de cerisier",
    notesBase: "Vanille, Santal, Musc sucré",
    stock: 35,
    isBestSeller: true,
  },

  // ============================================
  // PARFUMS DE NICHE (Premium)
  // ============================================
  {
    id: 7,
    name: "Sucre Noir",
    brand: "Niche Exclusive",
    description: "L'obscurité du sucre brûlé. Une création audacieuse qui mêle gourmandise et mystère dans un équilibre parfait.",
    price: 145.0,
    volume: "100ml",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800",
    category: "Niche",
    notesTop: "Sucre caramélisé, Rum, Orange sanguine",
    notesHeart: "Cacao, Rose noire, Encens",
    notesBase: "Oud, Vanille noire, Benjoin",
    stock: 8,
    isFeatured: true,
  },
  {
    id: 8,
    name: "Fève Tonka",
    brand: "Niche Exclusive",
    description: "L'essence pure de la fève tonka du Brésil. Un parfum enveloppant aux accords crémeux et addictifs.",
    price: 150.0,
    volume: "100ml",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800",
    category: "Niche",
    notesTop: "Lavande, Bergamote, Anis étoilé",
    notesHeart: "Fève Tonka, Amande, Héliotrope",
    notesBase: "Vanille, Musc, Bois de cèdre",
    stock: 12,
    isBestSeller: true,
  },
  {
    id: 9,
    name: "Oud de Carthage",
    brand: "Niche Exclusive",
    description: "L'héritage de Carthage dans un flacon. Un oud noble et raffiné inspiré des routes commerciales antiques.",
    price: 100.0,
    volume: "100ml",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800",
    category: "Niche",
    notesTop: "Safran, Rose, Cardamome",
    notesHeart: "Oud royal, Bois de rose, Encens oliban",
    notesBase: "Ambre, Musc, Santal",
    stock: 10,
  },
  {
    id: 10,
    name: "Kirke",
    brand: "Xerjoff",
    description: "L'enchantement de la magicienne Circé. Un parfum fruité et floral d'une élégance rare, signature de la maison Xerjoff.",
    price: 130.0,
    volume: "50ml",
    image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800",
    category: "Niche",
    notesTop: "Pêche, Passion, Groseille",
    notesHeart: "Rose, Pivoine, Freesia",
    notesBase: "Musc, Ambre, Vanille",
    stock: 6,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 11,
    name: "Ani",
    brand: "Nishane",
    description: "Un hommage à la ville d'Ani. Vanille et épices dans une composition orientale majestueuse signée Nishane.",
    price: 190.0,
    volume: "100ml",
    image: "https://images.unsplash.com/photo-1595425964071-2c1ecb10b52d?w=800",
    category: "Niche",
    notesTop: "Bergamote, Mandarine, Cardamome",
    notesHeart: "Cannelle, Rose, Orchidée",
    notesBase: "Vanille, Benjoin, Bois de santal",
    stock: 5,
  },
  {
    id: 12,
    name: "Erba Pura",
    brand: "Xerjoff",
    description: "La pureté des herbes méditerranéennes. Une explosion fruitée et musquée pour les amateurs de fraîcheur intense.",
    price: 190.0,
    volume: "100ml",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800",
    category: "Niche",
    notesTop: "Orange sicilienne, Citron de Calabre, Fruits exotiques",
    notesHeart: "Fruits blancs, Fleurs d'oranger",
    notesBase: "Musc blanc, Ambre, Cèdre",
    stock: 7,
    isBestSeller: true,
  },
  {
    id: 13,
    name: "Vanille D'Or",
    brand: "Niche Exclusive",
    description: "L'or liquide de Madagascar. Une vanille pure et précieuse rehaussée d'accords ambrés et musqués.",
    price: 165.0,
    volume: "100ml",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800",
    category: "Niche",
    notesTop: "Amande, Citron, Fleur d'oranger",
    notesHeart: "Cèdre, Héliotrope, Jasmin",
    notesBase: "Vanille de Madagascar, Musc, Ambre doré",
    stock: 9,
    isNew: true,
  },

  // ============================================
  // COLLECTION FEMME
  // ============================================
  {
    id: 14,
    name: "Good Girl",
    brand: "Carolina Herrera",
    description: "Le parfum iconique en forme d'escarpin. Sensuel et audacieux, il incarne la dualité de la femme moderne.",
    price: 95.0,
    volume: "80ml",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800",
    category: "Femme",
    notesTop: "Amande, Café, Bergamote",
    notesHeart: "Tubéreuse, Jasmin Sambac, Rose",
    notesBase: "Fève Tonka, Cacao, Bois de santal",
    stock: 15,
    isBestSeller: true,
  },
  {
    id: 15,
    name: "Libre",
    brand: "Yves Saint Laurent",
    description: "La liberté incarnée. Un fougère floral audacieux qui brise les codes de la parfumerie féminine.",
    price: 110.0,
    volume: "90ml",
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800",
    category: "Femme",
    notesTop: "Lavande, Mandarine, Cassis",
    notesHeart: "Fleur d'oranger, Jasmin, Orchidée",
    notesBase: "Vanille de Madagascar, Cèdre, Musc",
    stock: 18,
    isFeatured: true,
  },
  {
    id: 16,
    name: "La Vie Est Belle",
    brand: "Lancôme",
    description: "Un hymne au bonheur. L'iris et la praline créent une signature olfactive unique et reconnaissable.",
    price: 115.0,
    volume: "100ml",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800",
    category: "Femme",
    notesTop: "Cassis, Poire",
    notesHeart: "Iris, Jasmin, Fleur d'oranger",
    notesBase: "Praline, Vanille, Patchouli",
    stock: 20,
  },
  {
    id: 17,
    name: "Black Opium",
    brand: "Yves Saint Laurent",
    description: "L'addiction au féminin. Le café et la vanille créent une dépendance olfactive irrésistible.",
    price: 125.0,
    volume: "90ml",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800",
    category: "Femme",
    notesTop: "Café, Orange, Poire",
    notesHeart: "Jasmin, Fleur d'oranger",
    notesBase: "Vanille, Cèdre, Patchouli",
    stock: 16,
    isBestSeller: true,
  },
  {
    id: 18,
    name: "Miss Dior",
    brand: "Dior",
    description: "L'amour en flacon. Une rose moderne et pétillante pour les romantiques contemporaines.",
    price: 130.0,
    volume: "100ml",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800",
    category: "Femme",
    notesTop: "Mandarine, Rose",
    notesHeart: "Rose de Grasse, Pivoine, Iris",
    notesBase: "Musc, Bois rosé",
    stock: 14,
  },
  {
    id: 19,
    name: "Flowerbomb",
    brand: "Viktor & Rolf",
    description: "L'explosion florale ultime. Un bouquet addictif qui transforme le négatif en positif.",
    price: 120.0,
    volume: "100ml",
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800",
    category: "Femme",
    notesTop: "Thé, Bergamote, Osmanthus",
    notesHeart: "Jasmin Sambac, Rose Centifolia, Orchidée",
    notesBase: "Patchouli, Musc",
    stock: 12,
  },

  // ============================================
  // COLLECTION HOMME
  // ============================================
  {
    id: 20,
    name: "Sauvage",
    brand: "Dior",
    description: "L'instinct à l'état pur. Une fraîcheur brute et magnétique inspirée des grands espaces désertiques.",
    price: 98.0,
    volume: "100ml",
    image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800",
    category: "Homme",
    notesTop: "Bergamote de Calabre, Poivre",
    notesHeart: "Poivre de Sichuan, Lavande, Géranium",
    notesBase: "Ambroxan, Cèdre, Labdanum",
    stock: 25,
    isBestSeller: true,
    isFeatured: true,
  },
  {
    id: 21,
    name: "Gentleman",
    brand: "Givenchy",
    description: "Le gentleman moderne. Boisé et floral, il incarne l'élégance masculine contemporaine.",
    price: 85.0,
    volume: "100ml",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800",
    category: "Homme",
    notesTop: "Poire, Cardamome",
    notesHeart: "Iris, Lavande",
    notesBase: "Patchouli, Cuir, Fève Tonka",
    stock: 20,
  },
  {
    id: 22,
    name: "Bleu de Chanel",
    brand: "Chanel",
    description: "La liberté masculine. Un boisé aromatique d'une élégance intemporelle et universelle.",
    price: 135.0,
    volume: "100ml",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800",
    category: "Homme",
    notesTop: "Citron, Menthe, Pamplemousse",
    notesHeart: "Gingembre, Noix de muscade, Jasmin",
    notesBase: "Cèdre, Santal, Encens",
    stock: 18,
    isFeatured: true,
  },
  {
    id: 23,
    name: "1 Million",
    brand: "Paco Rabanne",
    description: "L'or de la séduction. Un parfum épicé et cuiré pour les hommes qui osent briller.",
    price: 89.0,
    volume: "100ml",
    image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800",
    category: "Homme",
    notesTop: "Mandarine, Pamplemousse, Menthe",
    notesHeart: "Rose, Cannelle, Épices",
    notesBase: "Cuir, Ambre, Bois",
    stock: 22,
    isBestSeller: true,
  },
  {
    id: 24,
    name: "Acqua di Gio",
    brand: "Giorgio Armani",
    description: "L'essence de la Méditerranée. Fraîcheur marine et solaire pour l'homme libre.",
    price: 95.0,
    volume: "100ml",
    image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800",
    category: "Homme",
    notesTop: "Bergamote, Néroli, Mandarine verte",
    notesHeart: "Notes marines, Jasmin, Romarin",
    notesBase: "Cèdre, Musc, Patchouli",
    stock: 24,
  },
  {
    id: 25,
    name: "Invictus",
    brand: "Paco Rabanne",
    description: "Le trophée de la victoire. Un parfum frais et puissant pour les champions.",
    price: 82.0,
    volume: "100ml",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800",
    category: "Homme",
    notesTop: "Pamplemousse, Mandarine, Notes marines",
    notesHeart: "Laurier, Jasmin",
    notesBase: "Bois de gaïac, Patchouli, Ambre gris",
    stock: 28,
  },

  // ============================================
  // COFFRETS CADEAUX
  // ============================================
  {
    id: 26,
    name: "Coffret Mauboussin Pour Elle",
    brand: "Mauboussin",
    description: "L'écrin parfait pour elle. Un coffret luxueux comprenant l'eau de parfum et sa crème corps assortie.",
    price: 75.0,
    volume: "Coffret",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
    category: "Coffret",
    notesTop: "Orange, Mandarine, Cassis",
    notesHeart: "Rose, Jasmin, Iris",
    notesBase: "Vanille, Santal, Musc",
    stock: 15,
    isNew: true,
  },
  {
    id: 27,
    name: "Coffret Gentleman Trio",
    brand: "La Fine Parfumerie",
    description: "Trois signatures masculines en miniatures. Le cadeau idéal pour découvrir l'univers de la parfumerie de luxe.",
    price: 55.0,
    volume: "3x15ml",
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800",
    category: "Coffret",
    notesTop: "Assortiment varié",
    notesHeart: "Sélection exclusive",
    notesBase: "Notes boisées et ambrées",
    stock: 20,
    isFeatured: true,
  },
  {
    id: 28,
    name: "Coffret Découverte Niche",
    brand: "La Fine Parfumerie",
    description: "Cinq échantillons de nos parfums de niche les plus précieux. L'initiation parfaite à la haute parfumerie.",
    price: 45.0,
    volume: "5x10ml",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800",
    category: "Coffret",
    notesTop: "Découverte olfactive",
    notesHeart: "Sélection premium",
    notesBase: "Notes exclusives",
    stock: 30,
    isBestSeller: true,
  },
  {
    id: 29,
    name: "Coffret Signature Royale Intégral",
    brand: "Signature Royale",
    description: "Les six parfums de la collection Signature Royale réunis. L'expérience complète pour les collectionneurs.",
    price: 199.0,
    volume: "6x30ml",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800",
    category: "Coffret",
    notesTop: "Collection complète",
    notesHeart: "Six univers olfactifs",
    notesBase: "Édition limitée",
    stock: 8,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 30,
    name: "Coffret Saint-Valentin",
    brand: "La Fine Parfumerie",
    description: "Le duo parfait pour les amoureux. Un parfum pour elle et un pour lui, dans un écrin romantique.",
    price: 89.0,
    volume: "2x50ml",
    image: "https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=800",
    category: "Coffret",
    notesTop: "Duo romantique",
    notesHeart: "Accord parfait",
    notesBase: "Notes sensuelles",
    stock: 12,
  },
];

async function main() {
  console.log("🌸 La Fine Parfumerie - Strasbourg");
  console.log("🌱 Début du seeding du catalogue...\n");

  // Supprimer les anciennes données
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  console.log("🗑️  Anciennes données supprimées\n");

  // Insérer les produits
  let count = 0;
  for (const product of products) {
    await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        brand: product.brand,
        description: product.description,
        price: product.price,
        volume: product.volume,
        image: product.image,
        category: product.category,
        notesTop: product.notesTop,
        notesHeart: product.notesHeart,
        notesBase: product.notesBase,
        stock: product.stock,
        isFeatured: product.isFeatured || false,
        isNew: product.isNew || false,
        isBestSeller: product.isBestSeller || false,
      },
    });
    count++;
    const badge = product.isFeatured ? "⭐" : product.isNew ? "🆕" : product.isBestSeller ? "🔥" : "✅";
    console.log(`${badge} ${product.name} (${product.category}) - ${product.price}€`);
  }

  // Réinitialiser la séquence auto-increment pour PostgreSQL
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT MAX(id) FROM products))`;

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Seeding terminé avec succès!");
  console.log(`📦 ${count} parfums importés dans la base de données`);
  console.log("=".repeat(50));

  // Statistiques
  const stats = {
    signature: products.filter(p => p.category === "Signature").length,
    niche: products.filter(p => p.category === "Niche").length,
    femme: products.filter(p => p.category === "Femme").length,
    homme: products.filter(p => p.category === "Homme").length,
    coffret: products.filter(p => p.category === "Coffret").length,
  };

  console.log("\n📊 Répartition du catalogue:");
  console.log(`   • Signature Royale: ${stats.signature} produits`);
  console.log(`   • Niche Premium: ${stats.niche} produits`);
  console.log(`   • Collection Femme: ${stats.femme} produits`);
  console.log(`   • Collection Homme: ${stats.homme} produits`);
  console.log(`   • Coffrets: ${stats.coffret} produits`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
