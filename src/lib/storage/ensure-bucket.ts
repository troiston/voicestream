import "dotenv/config";
import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { env } from "../env";

const s3Client = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
});

/**
 * Ensure the S3 bucket exists, creating it if necessary
 */
export async function ensureBucket(): Promise<void> {
  const bucketName = env.S3_BUCKET;

  try {
    // Try to check if bucket exists
    await s3Client.send(
      new HeadBucketCommand({
        Bucket: bucketName,
      })
    );
    console.log(`[storage] bucket ${bucketName} já existe`);
  } catch (error: unknown) {
    const err = error as { name?: string; $metadata?: { httpStatusCode?: number } };
    const isNotFound =
      err.name === "NotFound" || err.$metadata?.httpStatusCode === 404;

    if (isNotFound) {
      // Bucket doesn't exist, create it
      await s3Client.send(
        new CreateBucketCommand({
          Bucket: bucketName,
        })
      );
      console.log(`[storage] bucket ${bucketName} criado`);
    } else {
      // Other error, re-throw
      throw error;
    }
  }
}

// ESM check: if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  ensureBucket()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("[storage] erro ao garantir bucket:", error);
      process.exit(1);
    });
}
