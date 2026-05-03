import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../../auth/[...nextauth]/options";

import { connectDB } from "@/lib/db";

import Transaction from "@/models/Transaction";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();

    const session: any =
      await getServerSession(
        authOptions
      );

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // Current month range
    const now = new Date();

    const startOfMonth = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        1,
        0,
        0,
        0
      )
    );

    const endOfMonth = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() + 1,
        1,
        0,
        0,
        0
      )
    );


    const data =
      await Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(
            session.user.id
          ),

            type:
              "expense",

            categoryId: {
              $ne: null,
            },

            date: {
              $gte:
                startOfMonth,

              $lt:
                endOfMonth,
            },
          },
        },

        {
          $group: {
            _id:
              "$categoryId",

            totalExpense:
              {
                $sum:
                  "$amount",
              },
          },
        },

        {
          $lookup: {
            from:
              "categories",

            localField:
              "_id",

            foreignField:
              "_id",

            as:
              "category",
          },
        },

        {
          $unwind:
            "$category",
        },

        {
          $project: {
            _id: 0,

            categoryId:
              "$_id",

            categoryName:
              "$category.name",

            totalExpense: 1,
          },
        },

        {
          $sort: {
            totalExpense:
              -1,
          },
        },
      ]);


    return NextResponse.json(
      {
        data,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Category analytics error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Server error",
      },
      {
        status: 500,
      }
    );
  }
}