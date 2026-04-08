import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      slug: 'parfumbox-dior-savage-inspired',
      name: 'Parfumbox — Dior Savage (inspired)',
      description:
        'Bold aromatic fougere style. Inspired fragrance; not affiliated with the brand.',
      price: 49.99,
      currency: 'USD',
      volumeMl: 100,
      stock: 50,
      imageUrl:
        'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80',
    },
    {
      slug: 'parfumbox-oud-wood-inspired',
      name: 'Parfumbox — Oud Wood (inspired)',
      description: 'Warm woody oud blend for evening wear.',
      price: 59.99,
      currency: 'USD',
      volumeMl: 50,
      stock: 30,
      imageUrl:
        'https://images.unsplash.com/photo-1595425970377-c970029bf294?w=600&q=80',
    },
    {
      slug: 'parfumbox-citrus-noir',
      name: 'Parfumbox — Citrus Noir',
      description: 'Fresh citrus opening with a dark amber base.',
      price: 39.99,
      currency: 'USD',
      volumeMl: 100,
      stock: 100,
      imageUrl:
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80',
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        currency: p.currency,
        volumeMl: p.volumeMl,
        stock: p.stock,
        imageUrl: p.imageUrl,
        isActive: true,
      },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price,
        currency: p.currency,
        volumeMl: p.volumeMl,
        stock: p.stock,
        imageUrl: p.imageUrl,
        isActive: true,
      },
    });
  }

  console.log('Seed completed:', products.length, 'products');
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
