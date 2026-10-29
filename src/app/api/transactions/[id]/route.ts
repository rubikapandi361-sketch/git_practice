import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const VALID_TYPES = ["INCOME", "EXPENSE", "SAVINGS"] as const;

// DELETE /api/transactions/[id] - delete a transaction
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.transaction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    await db.transaction.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/transactions/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}

// PATCH /api/transactions/[id] - edit a transaction
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.transaction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

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

    let parsedDate = existing.date;
    if (date) {
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      }
      parsedDate = d;
    }

    const transaction = await db.transaction.update({
      where: { id },
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

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("PATCH /api/transactions/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}
