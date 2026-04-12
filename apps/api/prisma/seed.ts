import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const seedAdminEmail = "admin@parfumbox.local";
const seedAdminPassword = "changeme";

const demoProducts = [
  {
    title: "Noir Vetiver",
    description: "Dark vetiver with smoky woods.",
    priceCents: 89_00,
    stock: 24,
    images: [
      "https://picsum.photos/seed/pv1/800/800",
      "https://picsum.photos/seed/pv1b/800/800",
    ],
  },
  {
    title: "Amber Dune",
    description: "Warm amber and soft spice.",
    priceCents: 72_00,
    stock: 18,
    images: ["https://picsum.photos/seed/pv2/800/800"],
  },
  {
    title: "Santal Mist",
    description: "Creamy sandalwood and musk.",
    priceCents: 95_00,
    stock: 12,
    images: ["https://picsum.photos/seed/pv3/800/800"],
  },
  {
    title: "Cedar Bloom",
    description: "Cedar, florals, and clean air.",
    priceCents: 68_00,
    stock: 30,
    images: ["https://picsum.photos/seed/pv4/800/800"],
  },
  {
    title: "Oud Silk",
    description: "Rich oud with a silky dry-down.",
    priceCents: 112_00,
    stock: 8,
    images: ["https://picsum.photos/seed/pv5/800/800"],
  },
  {
    title: "Fig Leaf",
    description: "Green fig and milky sap.",
    priceCents: 59_00,
    stock: 22,
    images: ["https://picsum.photos/seed/pv6/800/800"],
  },
  {
    title: "Marine Moss",
    description: "Salt spray and coastal moss.",
    priceCents: 64_00,
    stock: 16,
    images: ["https://picsum.photos/seed/pv7/800/800"],
  },
  {
    title: "Rose Ash",
    description: "Smoked rose petals and ash wood.",
    priceCents: 81_00,
    stock: 14,
    images: ["https://picsum.photos/seed/pv8/800/800"],
  },
  {
    title: "Vanilla Smoke",
    description: "Vanilla bean with incense smoke.",
    priceCents: 76_00,
    stock: 20,
    images: ["https://picsum.photos/seed/pv9/800/800"],
  },
  {
    title: "Green Tea",
    description: "Fresh tea leaves and citrus zest.",
    priceCents: 52_00,
    stock: 40,
    images: ["https://picsum.photos/seed/pv10/800/800"],
  },
  {
    title: "Linen Air",
    description: "Crisp cotton and white florals.",
    priceCents: 61_00,
    stock: 26,
    images: ["https://picsum.photos/seed/pv11/800/800"],
  },
  {
    title: "Night Jasmine",
    description: "Indolic jasmine under moonlight.",
    priceCents: 88_00,
    stock: 10,
    images: ["https://picsum.photos/seed/pv12/800/800"],
  },
] as const;

async function main() {
  const passwordHash = await bcrypt.hash(seedAdminPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: seedAdminEmail },
    create: {
      email: seedAdminEmail,
      passwordHash,
    },
    update: {
      passwordHash,
    },
  });
  console.log(`Seeded admin user ${seedAdminEmail} (password: ${seedAdminPassword}).`);

  for (const p of demoProducts) {
    const slug = p.title.toLowerCase().replace(/\s+/g, "-");
    await prisma.product.upsert({
      where: { id: `seed-${slug}` },
      create: {
        id: `seed-${slug}`,
        title: p.title,
        description: p.description,
        priceCents: p.priceCents,
        stock: p.stock,
        images: [...p.images],
      },
      update: {
        title: p.title,
        description: p.description,
        priceCents: p.priceCents,
        stock: p.stock,
        images: [...p.images],
      },
    });
  }

  console.log(`Seeded ${demoProducts.length} demo products.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
