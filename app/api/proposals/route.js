import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      coverLetter,
      bidAmount,
      timeframe,
      jobId,
      freelancerId
    } = body;

    if (!coverLetter || !bidAmount || !timeframe || !jobId || !freelancerId) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    const existingProposal = await prisma.proposal.findFirst({
      where: {
        jobId: parseInt(jobId),
        freelancerId: parseInt(freelancerId)
      }
    });

    if (existingProposal) {
      return NextResponse.json(
        { error: 'You have already submitted a proposal for this job' },
        { status: 400 }
      );
    }

    const proposal = await prisma.proposal.create({
      data: {
        coverLetter,
        bidAmount: parseFloat(bidAmount),
        timeframe: parseInt(timeframe),
        jobId: parseInt(jobId),
        freelancerId: parseInt(freelancerId)
      },
      include: {
        freelancer: {
          select: {
            name: true,
            email: true,
            UserProfile: {
              select: {
                avatar: true
              }
            }
          }
        },
        job: {
          select: {
            title: true,
            budget: true
          }
        }
      }
    });

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error) {
    console.error('Create proposal error:', error);
    return NextResponse.json(
      { error: 'Failed to submit proposal' },
      { status: 500 }
    );
  }
}