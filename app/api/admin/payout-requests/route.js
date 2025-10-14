// app/api/admin/payout-requests/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all payout requests for admin
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    const where = {};
    if (status && status !== "all") where.status = status;

    const payoutRequests = await prisma.payoutRequest.findMany({
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
        bankDetail: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.payoutRequest.count({ where });

    return NextResponse.json({
      success: true,
      payoutRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching payout requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// UPDATE payout request status
export async function PUT(request) {
  try {
    const { payoutRequestId, status, adminNotes } = await request.json();

    if (!payoutRequestId || !status) {
      return NextResponse.json(
        { error: "Payout request ID and status are required" },
        { status: 400 }
      );
    }

    console.log(
      `🔄 Updating payout request ${payoutRequestId} to status: ${status}`
    );

    // Start transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Get the payout request with wallet info
      const payoutRequest = await tx.payoutRequest.findUnique({
        where: { id: parseInt(payoutRequestId) },
        include: {
          wallet: true,
          bankDetail: true,
        },
      });

      if (!payoutRequest) {
        throw new Error("Payout request not found");
      }

      // Update payout request status
      const updatedPayoutRequest = await tx.payoutRequest.update({
        where: { id: parseInt(payoutRequestId) },
        data: {
          status,
          ...(adminNotes && { adminNotes }),
        },
        include: {
          wallet: {
            include: {
              user: true,
            },
          },
          bankDetail: true,
        },
      });

      // Find the corresponding debit transaction
      const debitTransaction = await tx.walletTransaction.findFirst({
        where: {
          walletId: payoutRequest.walletId,
          amount: payoutRequest.amount,
          type: "debit",
          description: {
            contains: `Payout request to ${payoutRequest.bankDetail.bankName}`,
          },
          status: "pending",
        },
      });

      if (status === "completed") {
        console.log("✅ Completing payout - marking transaction as completed");

        // Update the debit transaction status to completed
        if (debitTransaction) {
          await tx.walletTransaction.update({
            where: { id: debitTransaction.id },
            data: {
              status: "completed",
              description: `Payout to ${
                payoutRequest.bankDetail.bankName
              } - ****${payoutRequest.bankDetail.accountNumber.slice(-4)}`,
            },
          });
        }
      } else if (status === "rejected") {
        console.log("❌ Rejecting payout - refunding amount");

        // 1. Refund the amount back to wallet
        const updatedWallet = await tx.freelancerWallet.update({
          where: { id: payoutRequest.walletId },
          data: {
            balance: {
              increment: payoutRequest.amount,
            },
          },
        });

        console.log("💰 Wallet balance after refund:", updatedWallet.balance);

        // 2. Create a credit transaction for the refund
        await tx.walletTransaction.create({
          data: {
            amount: payoutRequest.amount,
            type: "credit",
            description: `Refund: Payout request rejected - ${
              payoutRequest.bankDetail.bankName
            } - ****${payoutRequest.bankDetail.accountNumber.slice(-4)}`,
            status: "completed",
            walletId: payoutRequest.walletId,
          },
        });

        // 3. Update the original debit transaction status to rejected
        if (debitTransaction) {
          await tx.walletTransaction.update({
            where: { id: debitTransaction.id },
            data: {
              status: "rejected",
              description: `Failed payout to ${
                payoutRequest.bankDetail.bankName
              } - ****${payoutRequest.bankDetail.accountNumber.slice(
                -4
              )} (Rejected: ${adminNotes || "No reason provided"})`,
            },
          });
        }

        console.log("✅ Payout rejected and amount refunded successfully");
      } else if (status === "approved") {
        console.log("👍 Approving payout - keeping amount deducted");

        // Update the transaction status
        if (debitTransaction) {
          await tx.walletTransaction.update({
            where: { id: debitTransaction.id },
            data: {
              status: "approved",
              description: `Approved payout to ${
                payoutRequest.bankDetail.bankName
              } - ****${payoutRequest.bankDetail.accountNumber.slice(
                -4
              )} (Processing)`,
            },
          });
        }
      }

      return { payoutRequest: updatedPayoutRequest };
    });

    let message = "Payout request status updated successfully";
    if (status === "rejected") {
      message = `Payout request rejected and amount refunded to wallet. Reason: ${
        adminNotes || "No reason provided"
      }`;
    } else if (status === "completed") {
      message = "Payout completed successfully";
    } else if (status === "approved") {
      message = "Payout request approved and processing";
    }

    return NextResponse.json({
      success: true,
      message,
      ...result,
    });
  } catch (error) {
    console.error("Error updating payout request:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
