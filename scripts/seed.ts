import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const count = await db.transaction.count();
  if (count > 0) {
    console.log(`Database already has ${count} transactions, skipping seed.`);
    return;
  }

  const now = new Date();
  const d = (dayOfMonth: number) =>
    new Date(now.getFullYear(), now.getMonth(), dayOfMonth, 12, 0, 0);

  const seed = [
    // Credited income
    { type: "INCOME", amount: 3200, category: "Salary", description: "Monthly salary", date: d(1) },
    { type: "INCOME", amount: 450, category: "Freelance", description: "Design project", date: d(12) },
    // Deposits to savings
    { type: "SAVINGS", amount: 500, category: "Bank Deposit", description: "Monthly savings transfer", date: d(2) },
    { type: "SAVINGS", amount: 200, category: "Emergency Fund", description: "Top-up", date: d(15) },
    // Product expenses
    { type: "EXPENSE", amount: 180.5, category: "Groceries", description: "Weekly groceries", date: d(3) },
    { type: "EXPENSE", amount: 129.99, category: "Electronics", description: "Wireless headphones", date: d(8) },
    { type: "EXPENSE", amount: 64.2, category: "Food & Drinks", description: "Dinner with friends", date: d(10) },
    { type: "EXPENSE", amount: 45, category: "Transport", description: "Metro card top-up", date: d(11) },
    { type: "EXPENSE", amount: 89.9, category: "Clothing", description: "Running shoes", date: d(16) },
    { type: "EXPENSE", amount: 30, category: "Entertainment", description: "Movie night", date: d(18) },
  ];

  for (const item of seed) {
    await db.transaction.create({ data: item });
  }

  console.log(`Seeded ${seed.length} sample transactions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
