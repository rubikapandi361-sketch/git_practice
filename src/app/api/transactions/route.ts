import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const VALID_TYPES = ["INCOME", "EXPENSE", "SAVINGS"] as const;

// GET /api/transactions - list all transactions (newest first)
export async function GET() {
  try {
    const transactions = await db.transaction.findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST /api/transactions - create a new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, amount, category, description, date } = body ?? {};

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Type must be one of INCOME, EXPENSE or SAVINGS" },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    if (!category || typeof category !== "string" || !category.trim()) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    let parsedDate = new Date();
    if (date) {
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      }
      parsedDate = d;
    }

    const transaction = await db.transaction.create({
      data: {
        type,
        amount: Math.round(parsedAmount * 100) / 100,
        category: category.trim(),
        description:
          typeof description === "string" && description.trim()
            ? description.trim()
            : null,
        date: parsedDate,
      },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
