// lib/s3-upload.js
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "./aws-config.js";

export async function uploadToS3(file, userId, folder = "profiles") {
  try {
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${folder}/profile_${userId}_${timestamp}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      // REMOVE this line: ACL: 'public-read',
    });

    await s3Client.send(command);

    // Return public URL for eu-north-1
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new Error(`Failed to upload to S3: ${error.message}`);
  }
}
