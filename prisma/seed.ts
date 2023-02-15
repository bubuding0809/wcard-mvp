import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  // TODO: Seed your database here
  console.log("Seeding database...");
};

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
