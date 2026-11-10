import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const authors = [
    { name: 'Pramoedya Ananta Toer', order: 1 },
    { name: 'Tere Liye', order: 2 },
    { name: 'Andrea Hirata', order: 3 },
    { name: 'Eka Kurniawan', order: 4 },
    { name: 'Dee Lestari', order: 5 },
    { name: 'Leila S. Chudori', order: 6 },
  ];

  for (const author of authors) {
    await prisma.curatedAuthor.upsert({
      where: { name: author.name },
      update: { order: author.order },
      create: author,
    });
    console.log(`Seeded: ${author.name}`);
  }

  console.log('CuratedAuthor seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });