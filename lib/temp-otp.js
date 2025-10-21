// Temporary in-memory OTP storage while database is being repaired
const otpStorage = new Map();

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = (email, otp) => {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStorage.set(email.toLowerCase().trim(), { otp, expiresAt });
  console.log("📝 OTP stored in memory:", {
    email,
    otp,
    expiresAt: new Date(expiresAt),
  });
};

export const verifyOTP = async (email, otp) => {
  const stored = otpStorage.get(email.toLowerCase().trim());

  if (!stored) {
    return { isValid: false, message: "OTP not found or expired" };
  }

  if (Date.now() > stored.expiresAt) {
    otpStorage.delete(email.toLowerCase().trim());
    return { isValid: false, message: "OTP has expired" };
  }

  const isValid = stored.otp === otp;

  if (isValid) {
    otpStorage.delete(email.toLowerCase().trim());
  }

  return {
    isValid,
    message: isValid ? "OTP verified successfully" : "Invalid OTP",
  };
};

export const deleteOTP = (email) => {
  otpStorage.delete(email.toLowerCase().trim());
};

// Clean up expired OTPs every hour
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;

  for (const [email, data] of otpStorage.entries()) {
    if (now > data.expiresAt) {
      otpStorage.delete(email);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired OTPs`);
  }
}, 60 * 60 * 1000);
