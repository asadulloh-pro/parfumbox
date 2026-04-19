import { Prisma, PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const seedAdminEmail = "admin@parfumbox.local";
const seedAdminPassword = "changeme";

type SeedProduct = {
  title: string;
  description: string;
  priceUzs: number;
  stock: number;
  images: string[];
  /** slug -> price (UZS integer) */
  sizePrices?: Record<string, number>;
};

const demoProducts: SeedProduct[] = [
  {
    title: "Noir Vetiver",
    description: "Dark vetiver with smoky woods.",
    priceUzs: 198_000,
    stock: 24,
    images: [
      "https://picsum.photos/seed/pv1/800/800",
      "https://picsum.photos/seed/pv1b/800/800",
    ],
    sizePrices: { "10g": 198_000, "30g": 540_000, "50g": 860_000 },
  },
  {
    title: "Amber Dune",
    description: "Warm amber and soft spice.",
    priceUzs: 205_000,
    stock: 18,
    images: ["https://picsum.photos/seed/pv2/800/800"],
    sizePrices: { "10g": 205_000, "30g": 530_000, "50g": 830_000 },
  },
  {
    title: "Santal Mist",
    description: "Creamy sandalwood and musk.",
    priceUzs: 192_000,
    stock: 12,
    images: ["https://picsum.photos/seed/pv3/800/800"],
  },
  {
    title: "Cedar Bloom",
    description: "Cedar, florals, and clean air.",
    priceUzs: 210_000,
    stock: 30,
    images: ["https://picsum.photos/seed/pv4/800/800"],
  },
  {
    title: "Oud Silk",
    description: "Rich oud with a silky dry-down.",
    priceUzs: 248_000,
    stock: 8,
    images: ["https://picsum.photos/seed/pv5/800/800"],
    sizePrices: { "10g": 248_000, "30g": 648_000, "50g": 1_020_000 },
  },
  {
    title: "Fig Leaf",
    description: "Green fig and milky sap.",
    priceUzs: 178_000,
    stock: 22,
    images: ["https://picsum.photos/seed/pv6/800/800"],
  },
  {
    title: "Marine Moss",
    description: "Salt spray and coastal moss.",
    priceUzs: 199_000,
    stock: 16,
    images: ["https://picsum.photos/seed/pv7/800/800"],
  },
  {
    title: "Rose Ash",
    description: "Smoked rose petals and ash wood.",
    priceUzs: 215_000,
    stock: 14,
    images: ["https://picsum.photos/seed/pv8/800/800"],
  },
  {
    title: "Vanilla Smoke",
    description: "Vanilla bean with incense smoke.",
    priceUzs: 202_000,
    stock: 20,
    images: ["https://picsum.photos/seed/pv9/800/800"],
  },
  {
    title: "Green Tea",
    description: "Fresh tea leaves and citrus zest.",
    priceUzs: 165_000,
    stock: 40,
    images: ["https://picsum.photos/seed/pv10/800/800"],
  },
  {
    title: "Linen Air",
    description: "Crisp cotton and white florals.",
    priceUzs: 188_000,
    stock: 26,
    images: ["https://picsum.photos/seed/pv11/800/800"],
  },
  {
    title: "Night Jasmine",
    description: "Indolic jasmine under moonlight.",
    priceUzs: 228_000,
    stock: 10,
    images: ["https://picsum.photos/seed/pv12/800/800"],
  },
];

async function upsertPresets(): Promise<Map<string, string>> {
  const defs = [
    { slug: "10g", label: "10 g", grams: 10, sortOrder: 0 },
    { slug: "30g", label: "30 g", grams: 30, sortOrder: 1 },
    { slug: "50g", label: "50 g", grams: 50, sortOrder: 2 },
  ];
  const slugToId = new Map<string, string>();
  for (const d of defs) {
    const row = await prisma.productSizePreset.upsert({
      where: { slug: d.slug },
      create: {
        slug: d.slug,
        label: d.label,
        grams: d.grams,
        sortOrder: d.sortOrder,
      },
      update: {
        label: d.label,
        grams: d.grams,
        sortOrder: d.sortOrder,
      },
    });
    slugToId.set(d.slug, row.id);
  }
  return slugToId;
}

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

  const presetIds = await upsertPresets();

  for (const p of demoProducts) {
    const slug = p.title.toLowerCase().replace(/\s+/g, "-");
    let sizesJson: Prisma.InputJsonValue | undefined;
    let listingPrice = p.priceUzs;

    if (p.sizePrices) {
      const lines: { presetId: string; priceUzs: number }[] = [];
      for (const [slugKey, priceUzs] of Object.entries(p.sizePrices)) {
        const pid = presetIds.get(slugKey);
        if (!pid) {
          throw new Error(`Missing preset ${slugKey}`);
        }
        lines.push({ presetId: pid, priceUzs });
      }
      sizesJson = lines as unknown as Prisma.InputJsonValue;
      const ten = p.sizePrices["10g"];
      listingPrice =
        typeof ten === "number"
          ? ten
          : Math.min(...lines.map((l) => l.priceUzs));
    }

    await prisma.product.upsert({
      where: { id: `seed-${slug}` },
      create: {
        id: `seed-${slug}`,
        title: p.title,
        description: p.description,
        priceUzs: listingPrice,
        ...(sizesJson !== undefined ? { sizes: sizesJson } : {}),
        stock: p.stock,
        images: [...p.images],
      },
      update: {
        title: p.title,
        description: p.description,
        priceUzs: listingPrice,
        ...(sizesJson !== undefined
          ? { sizes: sizesJson }
          : { sizes: Prisma.DbNull }),
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
