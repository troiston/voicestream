import {
  createCipheriv,
  createDecipheriv,
  hkdfSync,
  randomBytes,
} from "crypto";
import { env } from "@/lib/env";

const ALGO = "aes-256-gcm";
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;

let _masterKey: Buffer | null = null;

function getMasterKey(): Buffer {
  if (_masterKey) return _masterKey;
  const key = Buffer.from(env.ENCRYPTION_KEY, "base64");
  if (key.length !== KEY_BYTES) {
    throw new Error(
      `ENCRYPTION_KEY must decode to ${KEY_BYTES} bytes (got ${key.length})`
    );
  }
  _masterKey = key;
  return key;
}

function aesGcmEncrypt(
  plaintext: Buffer,
  key: Buffer,
  aad?: Buffer
): { ciphertext: Buffer; iv: Buffer; tag: Buffer } {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv, { authTagLength: TAG_BYTES });
  if (aad) cipher.setAAD(aad);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ciphertext, iv, tag };
}

function aesGcmDecrypt(
  ciphertext: Buffer,
  key: Buffer,
  iv: Buffer,
  tag: Buffer,
  aad?: Buffer
): Buffer {
  const decipher = createDecipheriv(ALGO, key, iv, { authTagLength: TAG_BYTES });
  if (aad) decipher.setAAD(aad);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

export type AudioEncryptionMeta = {
  v: 1;
  alg: "AES-256-GCM";
  iv: string;
  tag: string;
  wrappedDek: string;
  dekIv: string;
  dekTag: string;
};

export function encryptAudio(plaintext: Buffer): {
  ciphertext: Buffer;
  meta: AudioEncryptionMeta;
} {
  const master = getMasterKey();
  const dek = randomBytes(KEY_BYTES);
  try {
    const data = aesGcmEncrypt(plaintext, dek);
    const wrap = aesGcmEncrypt(dek, master);
    return {
      ciphertext: data.ciphertext,
      meta: {
        v: 1,
        alg: "AES-256-GCM",
        iv: data.iv.toString("base64"),
        tag: data.tag.toString("base64"),
        wrappedDek: wrap.ciphertext.toString("base64"),
        dekIv: wrap.iv.toString("base64"),
        dekTag: wrap.tag.toString("base64"),
      },
    };
  } finally {
    dek.fill(0);
  }
}

export function decryptAudio(
  ciphertext: Buffer,
  meta: AudioEncryptionMeta
): Buffer {
  const master = getMasterKey();
  const dek = aesGcmDecrypt(
    Buffer.from(meta.wrappedDek, "base64"),
    master,
    Buffer.from(meta.dekIv, "base64"),
    Buffer.from(meta.dekTag, "base64")
  );
  try {
    return aesGcmDecrypt(
      ciphertext,
      dek,
      Buffer.from(meta.iv, "base64"),
      Buffer.from(meta.tag, "base64")
    );
  } finally {
    dek.fill(0);
  }
}

export function isAudioEncryptionMeta(v: unknown): v is AudioEncryptionMeta {
  if (!v || typeof v !== "object") return false;
  const m = v as Record<string, unknown>;
  return (
    m.v === 1 &&
    m.alg === "AES-256-GCM" &&
    typeof m.iv === "string" &&
    typeof m.tag === "string" &&
    typeof m.wrappedDek === "string" &&
    typeof m.dekIv === "string" &&
    typeof m.dekTag === "string"
  );
}

const TRANSCRIPT_INFO = Buffer.from("voicestream:transcript:v1");

function deriveTranscriptKey(userId: string): Buffer {
  const master = getMasterKey();
  const salt = Buffer.from(`user:${userId}`, "utf8");
  const derived = hkdfSync("sha256", master, salt, TRANSCRIPT_INFO, KEY_BYTES);
  return Buffer.from(derived);
}

const TRANSCRIPT_PREFIX = "enc:v1:";

export function encryptTranscriptText(plaintext: string, userId: string): string {
  const key = deriveTranscriptKey(userId);
  try {
    const { ciphertext, iv, tag } = aesGcmEncrypt(
      Buffer.from(plaintext, "utf8"),
      key
    );
    const payload = Buffer.concat([iv, tag, ciphertext]).toString("base64");
    return `${TRANSCRIPT_PREFIX}${payload}`;
  } finally {
    key.fill(0);
  }
}

export function decryptTranscriptText(stored: string, userId: string): string {
  if (!stored.startsWith(TRANSCRIPT_PREFIX)) return stored;
  const raw = Buffer.from(stored.slice(TRANSCRIPT_PREFIX.length), "base64");
  const iv = raw.subarray(0, IV_BYTES);
  const tag = raw.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ciphertext = raw.subarray(IV_BYTES + TAG_BYTES);
  const key = deriveTranscriptKey(userId);
  try {
    return aesGcmDecrypt(ciphertext, key, iv, tag).toString("utf8");
  } finally {
    key.fill(0);
  }
}

export function isTranscriptCiphertext(s: string): boolean {
  return typeof s === "string" && s.startsWith(TRANSCRIPT_PREFIX);
}
