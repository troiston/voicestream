import { decryptTranscriptText, isTranscriptCiphertext } from "./envelope";

export type DecryptableTranscription = {
  text: string;
  encrypted?: boolean | null;
} | null | undefined;

export type DecryptableSegment = {
  text: string;
  encrypted?: boolean | null;
};

export function decryptTranscriptIfNeeded<
  T extends DecryptableTranscription
>(transcription: T, userId: string): T {
  if (!transcription) return transcription;
  if (!transcription.encrypted) return transcription;
  if (!isTranscriptCiphertext(transcription.text)) return transcription;
  return {
    ...transcription,
    text: decryptTranscriptText(transcription.text, userId),
  };
}

export function decryptSegmentIfNeeded<T extends DecryptableSegment>(
  segment: T,
  userId: string
): T {
  if (!segment.encrypted) return segment;
  if (!isTranscriptCiphertext(segment.text)) return segment;
  return { ...segment, text: decryptTranscriptText(segment.text, userId) };
}
