import { DefaultDeepgramClient } from "@deepgram/sdk";
import type { ListenV1Response } from "@deepgram/sdk";
import { env } from "@/lib/env";
import { presignGetUrl } from "@/lib/storage/seaweed";

let _client: DefaultDeepgramClient | null = null;

function getClient(): DefaultDeepgramClient {
  if (!_client) {
    _client = new DefaultDeepgramClient({ apiKey: env.DEEPGRAM_API_KEY });
  }
  return _client;
}

export type TranscribedSegment = {
  speaker: string | null;
  startMs: number;
  endMs: number;
  text: string;
  confidence: number | null;
};

export type TranscriptionResult = {
  text: string;
  language: string;
  confidence: number | null;
  segments: TranscribedSegment[];
  rawJson: unknown;
};

export type TranscribeOptions = {
  language?: string; // default "pt-BR"
  model?: string; // default "nova-3"
  diarize?: boolean; // default true
  smartFormat?: boolean; // default true
};

/**
 * Transcribe audio from S3 storage key using Deepgram
 * @param storageKey - The S3 storage key of the audio file
 * @param opts - Transcription options
 * @returns TranscriptionResult with text, language, confidence, segments, and raw JSON
 */
export async function transcribeFromStorageKey(
  storageKey: string,
  opts?: TranscribeOptions
): Promise<TranscriptionResult> {
  const {
    language = "pt-BR",
    model = "nova-3",
    diarize = true,
    smartFormat = true,
  } = opts || {};

  try {
    // Generate presigned URL for the audio file (1 hour expiration)
    const presignedUrl = await presignGetUrl({
      key: storageKey,
      expiresInSec: 3600,
    });

    const client = getClient();

    // Call Deepgram with presigned URL
    // transcribeUrl returns a Promise that resolves to either ListenV1Response or ListenV1AcceptedResponse
    const response = await client.listen.v1.media.transcribeUrl({
      url: presignedUrl,
      language,
      model,
      diarize,
      smart_format: smartFormat,
      paragraphs: true,
      utterances: true,
    });

    // Handle both accepted and normal responses - we expect ListenV1Response for prerecorded
    const result = response as unknown as ListenV1Response;
    const channels = result.results?.channels;

    if (!channels || channels.length === 0) {
      throw new Error("No transcription result from Deepgram");
    }

    const channel = channels[0];
    const alternatives = channel.alternatives;

    if (!alternatives || alternatives.length === 0) {
      throw new Error("No alternatives in Deepgram response");
    }

    const alternative = alternatives[0];
    const text = alternative.transcript || "";
    const confidence = alternative.confidence ?? null;
    const detectedLanguage = channel.detected_language || language;

    // Map utterances to segments (utterances are at results level, not channel level)
    const segments: TranscribedSegment[] = [];
    const utterances = result.results?.utterances;
    if (utterances && Array.isArray(utterances)) {
      for (const utterance of utterances) {
        if (utterance.transcript) {
          segments.push({
            speaker: utterance.speaker !== undefined ? `speaker_${utterance.speaker}` : null,
            startMs: Math.round((utterance.start || 0) * 1000),
            endMs: Math.round((utterance.end || 0) * 1000),
            text: utterance.transcript,
            confidence: utterance.confidence ?? null,
          });
        }
      }
    }

    return {
      text,
      language: detectedLanguage,
      confidence,
      segments,
      rawJson: result,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Deepgram failed: ${message}`);
  }
}
