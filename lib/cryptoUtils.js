import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = crypto.scryptSync(process.env.ENCRYPT_SECRET, "salt", 32);

// Encrypt
export function encrypt(text) {
  const iv = crypto.randomBytes(16); // new IV for each record
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`; // store iv + encrypted
}

// Decrypt
export function decrypt(encryptedText) {
  if (!encryptedText) return null;

  const [ivHex, encrypted] = encryptedText.split(":");
  if (!ivHex || !encrypted) return null;

  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
