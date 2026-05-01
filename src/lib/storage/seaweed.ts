import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { env } from "../env";

// Internal S3 client (server-to-server inside the swarm).
const s3Client = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
});

// Public S3 client used only to mint presigned URLs that the browser will hit.
// Falls back to the internal endpoint in dev where there is no public hostname.
const s3PublicClient = new S3Client({
  endpoint: env.S3_PUBLIC_ENDPOINT ?? env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
});

export type PresignUrlOptions = {
  expiresInSec?: number;
};

export type PresignPutUrlOptions = PresignUrlOptions & {
  key: string;
  contentType: string;
};

export type PresignGetUrlOptions = PresignUrlOptions & {
  key: string;
};

export type HeadObjectOptions = {
  key: string;
};

export type HeadObjectResult = {
  exists: boolean;
  size?: number;
  contentType?: string;
};

/**
 * Generate an object key with uuid
 * @param prefix - prefix path (e.g. "audio/clips")
 * @param ext - file extension without dot (e.g. "mp3")
 */
export function getObjectKey(prefix: string, ext: string): string {
  const id = randomUUID();
  return `${prefix}/${id}.${ext}`;
}

/**
 * Get a presigned URL for uploading an object to S3 (PUT)
 */
export async function presignPutUrl(
  options: PresignPutUrlOptions
): Promise<string> {
  const { key, contentType, expiresInSec = 600 } = options;

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3PublicClient, command, { expiresIn: expiresInSec });
}

/**
 * Get a presigned URL for downloading an object from S3 (GET)
 */
export async function presignGetUrl(
  options: PresignGetUrlOptions
): Promise<string> {
  const { key, expiresInSec = 3600 } = options;

  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
  });

  return getSignedUrl(s3PublicClient, command, { expiresIn: expiresInSec });
}

/**
 * Get raw object bytes from S3
 */
export async function getObjectBytes(options: { key: string }): Promise<Buffer> {
  const { key } = options;
  const res = await s3Client.send(
    new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key })
  );
  const body = res.Body as unknown as { transformToByteArray?: () => Promise<Uint8Array> };
  if (body && typeof body.transformToByteArray === "function") {
    return Buffer.from(await body.transformToByteArray());
  }
  const stream = res.Body as NodeJS.ReadableStream;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/**
 * Put raw bytes to S3
 */
export async function putObjectBytes(options: {
  key: string;
  body: Buffer;
  contentType?: string;
}): Promise<void> {
  const { key, body, contentType } = options;
  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

/**
 * Delete an object from S3
 */
export async function deleteObject(options: { key: string }): Promise<void> {
  const { key } = options;

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    })
  );
}

/**
 * Check if an object exists in S3
 */
export async function headObject(
  options: HeadObjectOptions
): Promise<HeadObjectResult> {
  const { key } = options;

  try {
    const response = await s3Client.send(
      new HeadObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
      })
    );

    return {
      exists: true,
      size: response.ContentLength,
      contentType: response.ContentType,
    };
  } catch (error: unknown) {
    const err = error as { name?: string; $metadata?: { httpStatusCode?: number } };
    if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
      return { exists: false };
    }
    throw error;
  }
}

export { s3Client };
