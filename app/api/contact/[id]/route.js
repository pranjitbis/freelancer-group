import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Update contact request status
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Contact request ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ["pending", "accepted", "rejected", "completed"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid status. Must be one of: pending, accepted, rejected, completed",
        },
        { status: 400 }
      );
    }

    // First try to find as website submission
    let submission = await prisma.contactSubmission.findUnique({
      where: { id: parseInt(id) },
    });

    if (submission) {
      // Update website contact submission
      const submissionStatus = mapRequestStatusToSubmission(status);

      const updatedSubmission = await prisma.contactSubmission.update({
        where: { id: parseInt(id) },
        data: { status: submissionStatus },
      });

      console.log(
        `Website submission ${id} status updated to: ${submissionStatus}`
      );

      return NextResponse.json({
        success: true,
        message: "Contact submission updated successfully",
        submission: updatedSubmission,
      });
    }

    // If not found as submission, try as contact request
    let contactRequest = await prisma.contactRequest.findUnique({
      where: { id: parseInt(id) },
    });

    if (contactRequest) {
      const updatedRequest = await prisma.contactRequest.update({
        where: { id: parseInt(id) },
        data: { status },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              profile: true,
            },
          },
          freelancer: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              profile: true,
            },
          },
        },
      });

      console.log(`Contact request ${id} status updated to: ${status}`);

      return NextResponse.json({
        success: true,
        message: "Contact request updated successfully",
        contactRequest: updatedRequest,
      });
    }

    // If neither found, return 404
    return NextResponse.json(
      { success: false, error: "Contact request not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error updating contact request:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Contact request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update contact request",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Get single contact request
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Contact request ID is required" },
        { status: 400 }
      );
    }

    // First try to find as website submission
    let submission = await prisma.contactSubmission.findUnique({
      where: { id: parseInt(id) },
    });

    if (submission) {
      // Convert to contact request format
      const contactRequest = {
        id: submission.id,
        subject: `${submission.service} Inquiry`,
        message: submission.message,
        status: mapSubmissionStatus(submission.status),
        createdAt: submission.createdAt,
        client: {
          name: submission.name,
          email: submission.email,
          profile: {
            phone: submission.phone,
          },
        },
        projectDetails: `Service: ${
          submission.service
        }\nType: Website Contact Form\nSource: ${
          submission.source || "Website"
        }`,
        isWebsiteSubmission: true,
      };

      return NextResponse.json({
        success: true,
        contactRequest,
      });
    }

    // If not found as submission, try as contact request
    let contactRequest = await prisma.contactRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            profile: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            profile: true,
          },
        },
      },
    });

    if (contactRequest) {
      return NextResponse.json({
        success: true,
        contactRequest,
      });
    }

    // If neither found, return 404
    return NextResponse.json(
      { success: false, error: "Contact request not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching contact request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch contact request" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Delete contact request
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Contact request ID is required" },
        { status: 400 }
      );
    }

    // First try to delete as website submission
    try {
      await prisma.contactSubmission.delete({
        where: { id: parseInt(id) },
      });

      console.log(`Website submission ${id} deleted successfully`);
      return NextResponse.json({
        success: true,
        message: "Contact submission deleted successfully",
      });
    } catch (submissionError) {
      if (submissionError.code !== "P2025") {
        throw submissionError;
      }
    }

    // If not found as submission, try as contact request
    try {
      await prisma.contactRequest.delete({
        where: { id: parseInt(id) },
      });

      console.log(`Contact request ${id} deleted successfully`);
      return NextResponse.json({
        success: true,
        message: "Contact request deleted successfully",
      });
    } catch (requestError) {
      if (requestError.code !== "P2025") {
        throw requestError;
      }
    }

    // If neither found, return 404
    return NextResponse.json(
      { success: false, error: "Contact request not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error deleting contact request:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Contact request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete contact request",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper functions
function mapSubmissionStatus(submissionStatus) {
  const statusMap = {
    new: "pending",
    pending: "pending",
    in_progress: "accepted",
    accepted: "accepted",
    rejected: "rejected",
    completed: "completed",
  };

  return statusMap[submissionStatus] || "pending";
}

function mapRequestStatusToSubmission(requestStatus) {
  const statusMap = {
    pending: "in_progress",
    accepted: "accepted",
    rejected: "rejected",
    completed: "completed",
  };

  return statusMap[requestStatus] || "in_progress";
}
