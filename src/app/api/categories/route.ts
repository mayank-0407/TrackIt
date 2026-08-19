import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/mobileAuth";

import Category from "@/models/Category";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const categories = await Category.find({
      $or: [
        { isDefault: true },
        { userId }
      ]
    }).sort({ name: 1 });

    return NextResponse.json(
      {
        success: true,
        data: categories,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const { name, icon } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const existingCategory = await Category.findOne({
      name,
      userId,
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      );
    }

    const category = await Category.create({
      name,
      icon,
      userId,
      isDefault: false,
    });

    return NextResponse.json(
      {
        success: true,
        data: category,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}