// app/api/freelancer/bank-details/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { encrypt, decrypt, testEncryption } from "../../../../lib/cryptoUtils";

const prisma = new PrismaClient();

// Test encryption on startup
console.log("🔐 Testing encryption system...");
testEncryption();

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}

// POST - Add new bank details with ENFORCED encryption
export async function POST(request) {
  console.log("✅ POST /api/freelancer/bank-details called");

  try {
    const body = await request.json();
    console.log("📦 Request body received");

    const { userId, bankName, accountNumber, accountHolder, ifscCode, branch } =
      body;

    if (!userId) {
      console.log("❌ User ID missing");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!bankName || !accountNumber || !accountHolder || !ifscCode || !branch) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        { error: "All bank details are required" },
        { status: 400 }
      );
    }

    console.log("🔍 Finding wallet for user:", userId);

    // Find user's wallet
    let wallet = await prisma.freelancerWallet.findUnique({
      where: { userId: parseInt(userId) },
    });

    // Create wallet if it doesn't exist
    if (!wallet) {
      console.log("💰 Creating new wallet for user:", userId);
      wallet = await prisma.freelancerWallet.create({
        data: {
          userId: parseInt(userId),
          balance: 0,
        },
      });
    }

    console.log("🔍 Checking for existing bank account...");

    // Get all bank accounts for this wallet to check for duplicates
    const existingBankAccounts = await prisma.bankDetail.findMany({
      where: {
        walletId: wallet.id,
      },
    });

    // Check if account number already exists (decrypt each one to compare)
    let duplicateAccount = false;
    for (const account of existingBankAccounts) {
      try {
        const decryptedAccountNumber = decrypt(account.accountNumber);
        console.log(
          `🔍 Comparing: ${decryptedAccountNumber} vs ${accountNumber}`
        );
        if (decryptedAccountNumber === accountNumber) {
          duplicateAccount = true;
          break;
        }
      } catch (error) {
        console.error("Error decrypting for comparison:", error);
        // If decryption fails, compare as-is
        if (account.accountNumber === accountNumber) {
          duplicateAccount = true;
          break;
        }
      }
    }

    if (duplicateAccount) {
      console.log("❌ Bank account already exists");
      return NextResponse.json(
        { error: "Bank account with this account number already exists" },
        { status: 400 }
      );
    }

    console.log("🔐 ENCRYPTING sensitive bank data...");

    // FORCE encryption - these will be encrypted no matter what
    const encryptedAccountNumber = encrypt(accountNumber);
    const encryptedAccountHolder = encrypt(accountHolder);
    const encryptedIfscCode = encrypt(ifscCode);
    const encryptedBranch = encrypt(branch);

    console.log("Original Account Number:", accountNumber);
    console.log("Encrypted Account Number:", encryptedAccountNumber);
    console.log("Is encrypted:", encryptedAccountNumber !== accountNumber);

    // Verify encryption worked
    if (encryptedAccountNumber === accountNumber) {
      console.warn("⚠️ WARNING: Account number was not encrypted!");
    }

    console.log("📝 Creating new bank detail with encrypted data...");

    // Create bank detail with ENCRYPTED data
    const bankDetail = await prisma.bankDetail.create({
      data: {
        bankName, // Only bank name remains unencrypted
        accountNumber: encryptedAccountNumber,
        accountHolder: encryptedAccountHolder,
        ifscCode: encryptedIfscCode,
        branch: encryptedBranch,
        walletId: wallet.id,
        isVerified: false,
        isActive: true,
      },
    });

    console.log("✅ Bank detail created successfully with ID:", bankDetail.id);

    // Return response with masked data for security
    const responseData = {
      id: bankDetail.id,
      bankName: bankDetail.bankName,
      accountNumber: `****${accountNumber.slice(-4)}`, // Only show last 4 digits
      accountHolder: "••••••••••", // Fully masked
      ifscCode: "••••••••••", // Fully masked
      branch: "••••••••••", // Fully masked
      isVerified: bankDetail.isVerified,
      isActive: bankDetail.isActive,
      createdAt: bankDetail.createdAt,
      updatedAt: bankDetail.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        bankDetail: responseData,
        message:
          "Bank details added successfully! Waiting for admin verification.",
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (error) {
    console.error("❌ Error adding bank details:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}

// GET - Get bank details with proper encryption/decryption
export async function GET(request) {
  console.log("✅ GET /api/freelancer/bank-details called");

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const isAdmin = searchParams.get("admin") === "true";

    console.log("📋 User ID:", userId, "Is Admin:", isAdmin);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const wallet = await prisma.freelancerWallet.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        bankDetails: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!wallet) {
      console.log("💰 No wallet found");
      return NextResponse.json({
        success: true,
        bankDetails: [],
      });
    }

    console.log(`📊 Found ${wallet.bankDetails.length} bank details`);

    // Process each bank detail based on user type
    const processedBankDetails = wallet.bankDetails.map((bankDetail) => {
      console.log(`🔍 Processing bank detail ${bankDetail.id}:`);
      console.log("  Raw account number:", bankDetail.accountNumber);
      console.log("  Is encrypted:", bankDetail.accountNumber.includes(":"));

      if (isAdmin) {
        // Admin gets fully decrypted data
        try {
          const decryptedData = {
            id: bankDetail.id,
            bankName: bankDetail.bankName,
            accountNumber: decrypt(bankDetail.accountNumber),
            accountHolder: decrypt(bankDetail.accountHolder),
            ifscCode: decrypt(bankDetail.ifscCode),
            branch: decrypt(bankDetail.branch),
            isVerified: bankDetail.isVerified,
            isActive: bankDetail.isActive,
            createdAt: bankDetail.createdAt,
            updatedAt: bankDetail.updatedAt,
            walletId: bankDetail.walletId,
          };
          console.log("  Decrypted for admin:", decryptedData.accountNumber);
          return decryptedData;
        } catch (error) {
          console.error("  Decryption failed:", error);
          return {
            ...bankDetail,
            decryptionError: true,
            note: "Unable to decrypt - data may be stored in plain text",
          };
        }
      } else {
        // Regular users get masked data only
        let lastFourDigits = "****";
        try {
          const decrypted = decrypt(bankDetail.accountNumber);
          lastFourDigits = decrypted.slice(-4);
          console.log("  Masked for user: ****" + lastFourDigits);
        } catch (error) {
          console.error("  Could not decrypt for masking:", error);
          // Try to extract last 4 from whatever format
          try {
            const raw = bankDetail.accountNumber;
            lastFourDigits = raw.slice(-4);
          } catch (e) {
            lastFourDigits = "****";
          }
        }

        return {
          id: bankDetail.id,
          bankName: bankDetail.bankName,
          accountNumber: `****${lastFourDigits}`,
          accountHolder: "••••••••••",
          ifscCode: "••••••••••",
          branch: "••••••••••",
          isVerified: bankDetail.isVerified,
          isActive: bankDetail.isActive,
          createdAt: bankDetail.createdAt,
          updatedAt: bankDetail.updatedAt,
        };
      }
    });

    return NextResponse.json({
      success: true,
      bankDetails: processedBankDetails,
      dataType: isAdmin ? "decrypted" : "masked",
      total: processedBankDetails.length,
    });
  } catch (error) {
    console.error("Error fetching bank details:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
