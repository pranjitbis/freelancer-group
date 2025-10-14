// lib/cryptoUtils.js
const crypto = require("crypto");

// Use environment variable for encryption key
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "fallback-key-32-bytes-long-123456";

// Validate and prepare the key
function getValidKey() {
  let key = ENCRYPTION_KEY;

  if (!key) {
    throw new Error("ENCRYPTION_KEY is not set in environment variables");
  }

  // If key is hex string (64 characters), convert to buffer
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, "hex");
  }

  // If key is base64 (44 characters), decode it
  if (key.length === 44 && key.includes("=")) {
    return Buffer.from(key, "base64");
  }

  // For string keys, hash them to ensure 32 bytes
  if (key.length !== 32) {
    console.warn(`⚠️ Key length is ${key.length}, hashing to 32 bytes`);
    return crypto.createHash("sha256").update(key).digest();
  }

  return Buffer.from(key, "utf8");
}

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function encrypt(text) {
  try {
    if (!text || typeof text !== "string") {
      return text;
    }

    // For development without proper key, use a warning but still encrypt
    if (ENCRYPTION_KEY === "fallback-key-32-bytes-long-123456") {
      console.warn(
        "⚠️ Using fallback encryption key - NOT SECURE FOR PRODUCTION"
      );
    }

    const key = getValidKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // Return format: iv:encrypted:authTag
    return `${iv.toString("hex")}:${encrypted}:${authTag.toString("hex")}`;
  } catch (error) {
    console.error("❌ Encryption error:", error);
    // Return original text if encryption fails
    return text;
  }
}

function decrypt(encryptedText) {
  try {
    if (!encryptedText || typeof encryptedText !== "string") {
      return encryptedText;
    }

    // Check if the text is actually encrypted (has our format)
    if (!encryptedText.includes(":")) {
      return encryptedText;
    }

    const parts = encryptedText.split(":");
    if (parts.length !== 3) {
      return encryptedText;
    }

    const key = getValidKey();
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("❌ Decryption error:", error);
    // Return the encrypted text if decryption fails
    return encryptedText;
  }
}

// Test function to verify encryption is working
function testEncryption() {
  const testText = "Hello, World! 1234567890";
  console.log("🧪 Testing encryption system...");
  console.log("Original:", testText);

  const encrypted = encrypt(testText);
  console.log("Encrypted:", encrypted);

  const decrypted = decrypt(encrypted);
  console.log("Decrypted:", decrypted);

  const success = testText === decrypted;
  console.log("✅ Test", success ? "PASSED" : "FAILED");
  return success;
}

module.exports = {
  encrypt,
  decrypt,
  testEncryption,
};
