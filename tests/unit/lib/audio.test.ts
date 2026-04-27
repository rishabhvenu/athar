import { beforeEach, describe, expect, it, vi } from "vitest";

import { startRecording, stopRecording } from "@/lib/audio";

class MockMediaRecorder {
  static latestOptions: MediaRecorderOptions | undefined;

  readonly stream: MediaStream;
  ondataavailable: ((event: BlobEvent) => void) | null = null;
  start = vi.fn();

  constructor(stream: MediaStream, options?: MediaRecorderOptions) {
    this.stream = stream;
    MockMediaRecorder.latestOptions = options;
  }

  stop() {
    const blob = new Blob(["recorded"], { type: "audio/webm" });
    this.ondataavailable?.({ data: blob } as BlobEvent);
  }
}

describe("audio recording helpers", () => {
  const stopTrack = vi.fn();
  const stream = {
    getTracks: vi.fn(() => [{ stop: stopTrack }]),
  } as unknown as MediaStream;
  const getUserMedia = vi.fn();

  beforeEach(() => {
    stopTrack.mockClear();
    stream.getTracks = vi.fn(() => [{ stop: stopTrack } as unknown as MediaStreamTrack]);
    getUserMedia.mockResolvedValue(stream);
    MockMediaRecorder.latestOptions = undefined;

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });
    Object.defineProperty(globalThis, "MediaRecorder", {
      configurable: true,
      value: MockMediaRecorder,
    });
  });

  it("starts a low-bitrate opus MediaRecorder from microphone audio", async () => {
    const recorder = await startRecording();

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(MockMediaRecorder.latestOptions).toEqual({
      mimeType: "audio/webm;codecs=opus",
      audioBitsPerSecond: 24000,
    });
    expect(recorder.start).toHaveBeenCalledOnce();
  });

  it("resolves the recorded blob and stops all tracks", async () => {
    const recorder = await startRecording();

    const blob = await stopRecording(recorder);

    expect(blob.type).toBe("audio/webm");
    expect(stopTrack).toHaveBeenCalledOnce();
  });
});
