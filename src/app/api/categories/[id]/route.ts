import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Transaction from "@/models/Transaction";
import { getAuthenticatedUserId } from "@/lib/mobileAuth";

async function getOwnedCategory(req: Request, id: string) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const category = await Category.findOne({ _id: id, userId, isDefault: false });
  if (!category) return { error: NextResponse.json({ error: "Category not found" }, { status: 404 }) };
  return { category };
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;
    const owned = await getOwnedCategory(req, id);
    if (owned.error) return owned.error;
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    owned.category.name = name;
    if (typeof body.icon === "string") owned.category.icon = body.icon;
    await owned.category.save();
    return NextResponse.json({ success: true, data: owned.category }, { status: 200 });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { id } =
      await context.params;

    const owned = await getOwnedCategory(req, id);
    if (owned.error) return owned.error;
    const category = owned.category;

    if (!category) {
      return NextResponse.json(
        {
          error:
            "Category not found",
        },
        {
          status: 404,
        }
      );
    }

    // Prevent deleting if used in transactions
    const usedInTransactions =
      await Transaction.findOne({
        categoryId: id,
        userId: category.userId,
      });

    if (
      usedInTransactions
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot delete category because it is being used in transactions",
        },
        {
          status: 400,
        }
      );
    }

    await Category.findByIdAndDelete(
      id
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Category deleted successfully",
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "Delete category error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}