import bcrypt from 'bcryptjs';

// In-memory storage for OTPs (use Redis in production)
const otpStorage = new Map();

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = (email, otp) => {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  const hashedOTP = bcrypt.hashSync(otp, 10);
  otpStorage.set(email, { otp: hashedOTP, expiresAt });
};

export const verifyOTP = async (email, otp) => {
  const stored = otpStorage.get(email);
  
  if (!stored) {
    return { isValid: false, message: 'OTP not found or expired' };
  }

  if (Date.now() > stored.expiresAt) {
    otpStorage.delete(email);
    return { isValid: false, message: 'OTP has expired' };
  }

  const isValid = await bcrypt.compare(otp, stored.otp);
  
  if (isValid) {
    otpStorage.delete(email); // Remove OTP after successful verification
  }

  return { 
    isValid, 
    message: isValid ? 'OTP verified successfully' : 'Invalid OTP' 
  };
};

export const deleteOTP = (email) => {
  otpStorage.delete(email);
};