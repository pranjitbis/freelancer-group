// app/api/freelancer/sync-payments/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Find all completed payments for this freelancer
    const payments = await prisma.paymentRequest.findMany({
      where: {
        freelancerId: parseInt(userId),
        status: 'completed'
      },
      include: {
        conversation: {
          include: {
            project: true
          }
        }
      }
    })

    const wallet = await prisma.freelancerWallet.findUnique({
      where: { userId: parseInt(userId) }
    })

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    let syncedCount = 0
    let totalAmount = 0

    // Sync each payment to wallet transactions
    for (const payment of payments) {
      // Check if this payment already exists in wallet transactions
      const existingTransaction = await prisma.walletTransaction.findFirst({
        where: {
          walletId: wallet.id,
          description: {
            contains: `Payment: ${payment.description}`
          },
          amount: payment.amount
        }
      })

      if (!existingTransaction) {
        // Create wallet transaction
        await prisma.walletTransaction.create({
          data: {
            amount: payment.amount,
            type: 'credit',
            description: `Payment: ${payment.description}`,
            status: 'completed',
            walletId: wallet.id
          }
        })

        totalAmount += payment.amount
        syncedCount++
      }
    }

    // Update wallet balance if new transactions were added
    if (syncedCount > 0) {
      await prisma.freelancerWallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: totalAmount
          }
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Synced ${syncedCount} payments to wallet`,
      syncedCount,
      totalAmount 
    })
  } catch (error) {
    console.error('Error syncing payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}