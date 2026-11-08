import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Education', slug: 'education' },
  { name: 'Health', slug: 'health' },
  { name: 'Environment', slug: 'environment' },
  { name: 'Community', slug: 'community' },
  { name: 'Technology', slug: 'technology' },
  { name: 'Arts & Culture', slug: 'arts-culture' },
  { name: 'Emergency Relief', slug: 'emergency-relief' },
  { name: 'Other', slug: 'other' },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`Seeded ${categories.length} categories.`);
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
