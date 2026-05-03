import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Transaction from "@/models/Transaction";

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

    const category =
      await Category.findById(id);

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