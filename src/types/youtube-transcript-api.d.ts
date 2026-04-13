declare module "youtube-transcript-api" {
  interface TranscriptTrack {
    language: string;
    transcript: Array<{
      text: string;
      start: string;
      dur: string;
    }>;
  }

  interface TranscriptResult {
    id: string;
    title: string;
    tracks: TranscriptTrack[];
    isLive: boolean;
    languages: Array<{
      label: string;
      languageCode: string;
    }>;
    isLoginRequired: boolean;
    playabilityStatus: {
      status: string;
      reason?: string;
    };
    author: string;
    channelId: string;
  }

  class TranscriptClient {
    ready: Promise<void>;
    constructor();
    getTranscript(videoId: string): Promise<TranscriptResult>;
  }

  export default TranscriptClient;
}