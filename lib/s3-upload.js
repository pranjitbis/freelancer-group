import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "./aws-config.js";

export async function uploadToS3(file, folder = "uploads") {
  try {
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${folder}/${timestamp}_${randomString}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    });

    await s3Client.send(command);

    // Return public URL
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new Error(`Failed to upload to S3: ${error.message}`);
  }
}
