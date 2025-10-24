const crypto = require("crypto");

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "fallback-key-32-bytes-long-123456";

function getValidKey() {
  let key = ENCRYPTION_KEY;

  if (!key) {
    throw new Error("ENCRYPTION_KEY is not set in environment variables");
  }

  return crypto.createHash("sha256").update(String(key)).digest();
}

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function encrypt(text) {
  try {
    if (!text || typeof text !== "string") {
      console.warn("⚠️ encrypt: Invalid input, returning as-is");
      return text;
    }

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

    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  } catch (error) {
    console.error("❌ Encryption error:", error);
    return text;
  }
}

function decrypt(encryptedText) {
  try {
    if (!encryptedText || typeof encryptedText !== "string") {
      console.warn("⚠️ decrypt: Invalid input, returning as-is");
      return encryptedText;
    }

    if (!encryptedText.includes(":")) {
      console.warn("⚠️ decrypt: Text doesn't appear to be encrypted");
      return encryptedText;
    }

    const parts = encryptedText.split(":");
    if (parts.length !== 3) {
      console.warn("⚠️ decrypt: Invalid encrypted text format");
      return encryptedText;
    }

    const key = getValidKey();
    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encrypted = parts[2];

    if (iv.length !== IV_LENGTH) {
      console.error(`❌ Invalid IV length: ${iv.length}, expected: ${IV_LENGTH}`);
      return encryptedText;
    }

    if (authTag.length !== AUTH_TAG_LENGTH) {
      console.error(`❌ Invalid auth tag length: ${authTag.length}, expected: ${AUTH_TAG_LENGTH}`);
      return encryptedText;
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("❌ Decryption error:", error);
    console.error("❌ Encrypted text that failed:", encryptedText);
    
    return encryptedText;
  }
}

function testEncryption() {
  console.log("🧪 Testing encryption system...");
  
  const testCases = [
    "Hello, World!",
    "Test message 123",
    "Another message with symbols !@#$%",
    "Short",
    ""
  ];

  let allPassed = true;

  testCases.forEach((testText, index) => {
    console.log(`\n--- Test Case ${index + 1} ---`);
    console.log("Original:", testText);

    const encrypted = encrypt(testText);
    console.log("Encrypted:", encrypted);

    const decrypted = decrypt(encrypted);
    console.log("Decrypted:", decrypted);

    const success = testText === decrypted;
    console.log("Result:", success ? "✅ PASSED" : "❌ FAILED");
    
    if (!success) allPassed = false;
  });

  console.log(`\n🎯 Overall: ${allPassed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"}`);
  return allPassed;
}

if (require.main === module) {
  testEncryption();
}

module.exports = {
  encrypt,
  decrypt,
  testEncryption,
};