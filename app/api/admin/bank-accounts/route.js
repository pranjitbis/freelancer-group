// app/api/admin/bank-accounts/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { decrypt } from "../../../../lib/cryptoUtils";

const prisma = new PrismaClient();

// GET all bank accounts for admin with decryption
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const status = searchParams.get("status"); // verified, pending

    const skip = (page - 1) * limit;

    const where = {};
    if (status === "verified") where.isVerified = true;
    if (status === "pending") where.isVerified = false;

    const bankAccounts = await prisma.bankDetail.findMany({
      where,
      include: {
        wallet: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Decrypt sensitive data for admin view
    const decryptedBankAccounts = bankAccounts.map((bankAccount) => {
      try {
        return {
          ...bankAccount,
          accountNumber: decrypt(bankAccount.accountNumber),
          accountHolder: decrypt(bankAccount.accountHolder),
          ifscCode: decrypt(bankAccount.ifscCode),
          branch: decrypt(bankAccount.branch),
        };
      } catch (error) {
        console.error("Error decrypting bank account data:", error);
        return {
          ...bankAccount,
          decryptionError: true,
          accountNumber: "Decryption Error",
          accountHolder: "Decryption Error",
          ifscCode: "Decryption Error",
          branch: "Decryption Error",
        };
      }
    });

    const total = await prisma.bankDetail.count({ where });

    return NextResponse.json({
      success: true,
      bankAccounts: decryptedBankAccounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// UPDATE bank account verification status
export async function PUT(request) {
  try {
    const { bankAccountId, isVerified, adminNotes } = await request.json();

    if (!bankAccountId) {
      return NextResponse.json(
        { error: "Bank account ID is required" },
        { status: 400 }
      );
    }

    const bankAccount = await prisma.bankDetail.update({
      where: { id: parseInt(bankAccountId) },
      data: {
        isVerified,
        ...(adminNotes && { adminNotes }),
      },
      include: {
        wallet: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Bank account ${
        isVerified ? "verified" : "unverified"
      } successfully`,
      bankAccount: {
        ...bankAccount,
        // Return decrypted data for admin
        accountNumber: decrypt(bankAccount.accountNumber),
        accountHolder: decrypt(bankAccount.accountHolder),
        ifscCode: decrypt(bankAccount.ifscCode),
        branch: decrypt(bankAccount.branch),
      },
    });
  } catch (error) {
    console.error("Error updating bank account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
