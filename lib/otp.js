// lib\otp.js
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = async (email, otp) => {
  try {
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours
    const hashedOTP = bcrypt.hashSync(otp, 10);

    console.log(`💾 Storing OTP for: ${email}`);
    console.log(`📝 Plain OTP: ${otp}`);
    console.log(`⏰ Expires at: ${expiresAt}`);

    // First, delete any existing OTP for this email
    await prisma.oTP.deleteMany({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    // Then create new OTP
    const result = await prisma.oTP.create({
      data: {
        email: email.toLowerCase().trim(),
        otp: hashedOTP,
        expiresAt,
      },
    });

    console.log(`✅ OTP stored successfully in database, ID: ${result.id}`);
    return true;
  } catch (error) {
    console.error("❌ Error storing OTP:", error);

    // Fallback to in-memory storage
    console.log("🔄 Falling back to in-memory OTP storage");
    return storeOTPInMemory(email, otp);
  }
};

// In-memory fallback storage
const memoryOTPStorage = new Map();

const storeOTPInMemory = async (email, otp) => {
  try {
    const expiresAt = Date.now() + 3 * 60 * 60 * 1000; // 3 hours
    const hashedOTP = bcrypt.hashSync(otp, 10);

    memoryOTPStorage.set(email.toLowerCase().trim(), {
      otp: hashedOTP,
      expiresAt,
    });

    console.log(`✅ OTP stored in memory for: ${email}`);
    return true;
  } catch (error) {
    console.error("❌ In-memory OTP storage failed:", error);
    return false;
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const cleanEmail = email.toLowerCase().trim();
    console.log(`🔍 Verifying OTP for: ${cleanEmail}`);
    console.log(`📝 Provided OTP: ${otp}`);

    // First try database
    let storedOTP = await prisma.oTP.findFirst({
      where: {
        email: cleanEmail,
      },
    });

    let storageType = "database";

    // If not in database, try memory
    if (!storedOTP) {
      console.log("🔍 OTP not found in database, checking memory...");
      const memoryData = memoryOTPStorage.get(cleanEmail);
      if (memoryData) {
        storedOTP = memoryData;
        storageType = "memory";
        console.log("✅ OTP found in memory storage");
      }
    } else {
      console.log("✅ OTP found in database storage");
    }

    if (!storedOTP) {
      console.log("❌ OTP not found in any storage");
      return { isValid: false, message: "OTP not found or expired" };
    }

    // Check if OTP has expired
    const now = new Date();
    const expiresAt =
      storageType === "database"
        ? storedOTP.expiresAt
        : new Date(storedOTP.expiresAt);

    console.log(`⏰ Current time: ${now}`);
    console.log(`⏰ OTP expires: ${expiresAt}`);

    if (now > expiresAt) {
      console.log("❌ OTP has expired");

      // Clean up expired OTP
      if (storageType === "database") {
        await prisma.oTP.deleteMany({
          where: { email: cleanEmail },
        });
      } else {
        memoryOTPStorage.delete(cleanEmail);
      }

      return { isValid: false, message: "OTP has expired" };
    }

    console.log("✅ OTP is still valid, verifying hash...");

    // Verify OTP
    const isValid = await bcrypt.compare(otp, storedOTP.otp);
    console.log(`🔐 Hash comparison result: ${isValid}`);

    if (isValid) {
      // Remove OTP after successful verification
      if (storageType === "database") {
        await prisma.oTP.deleteMany({
          where: { email: cleanEmail },
        });
        console.log("✅ OTP removed from database");
      } else {
        memoryOTPStorage.delete(cleanEmail);
        console.log("✅ OTP removed from memory");
      }
      console.log(`🎉 OTP verified successfully for ${cleanEmail}`);
    } else {
      console.log(`❌ OTP verification failed for ${cleanEmail}`);
    }

    return {
      isValid,
      message: isValid ? "OTP verified successfully" : "Invalid OTP",
      storageType,
    };
  } catch (error) {
    console.error("💥 Error verifying OTP:", error);
    return { isValid: false, message: "Error verifying OTP" };
  }
};

export const deleteOTP = async (email) => {
  try {
    const cleanEmail = email.toLowerCase().trim();

    // Delete from database
    await prisma.oTP.deleteMany({
      where: { email: cleanEmail },
    });

    // Delete from memory
    memoryOTPStorage.delete(cleanEmail);

    console.log(`✅ OTP deleted for ${cleanEmail}`);
  } catch (error) {
    console.error("❌ Error deleting OTP:", error);
  }
};

// Clean up expired OTPs periodically
export const cleanupExpiredOTPs = async () => {
  try {
    // Clean database
    const dbResult = await prisma.oTP.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    // Clean memory
    const now = Date.now();
    let memoryCount = 0;
    for (const [email, data] of memoryOTPStorage.entries()) {
      if (now > data.expiresAt) {
        memoryOTPStorage.delete(email);
        memoryCount++;
      }
    }

    if (dbResult.count > 0 || memoryCount > 0) {
      console.log(
        `🧹 Cleaned up ${dbResult.count} expired OTPs from database and ${memoryCount} from memory`
      );
    }
  } catch (error) {
    console.error("❌ Error cleaning up expired OTPs:", error);
  }
};

// Run cleanup every hour
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredOTPs, 60 * 60 * 1000);
}

// Initial cleanup on startup
cleanupExpiredOTPs();
