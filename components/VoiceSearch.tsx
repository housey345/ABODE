"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface Props {
  onTranscript: (text: string) => void;
  onIslaText?: (text: string) => void;
  disabled?: boolean;
}

type Status = "idle" | "connecting" | "listening" | "processing";

interface RealtimeEvent {
  type: string;
  delta?: string;
  transcript?: string;
}

export default function VoiceSearch({ onTranscript, onIslaText, disabled }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [interimText, setInterimText] = useState("");

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const userTranscriptRef = useRef<string>("");
  const interimRef = useRef<string>("");
  const islaTextRef = useRef<string>("");
  const processingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const teardown = useCallback(() => {
    if (processingTimerRef.current) {
      clearTimeout(processingTimerRef.current);
      processingTimerRef.current = null;
    }
    dcRef.current?.close();
    pcRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    dcRef.current = null;
    pcRef.current = null;
    streamRef.current = null;
    setStatus("idle");
    setInterimText("");
  }, []);

  const setError = useCallback((msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3500);
  }, []);

  const stopMic = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (dcRef.current?.readyState === "open") {
      dcRef.current.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
      dcRef.current.send(JSON.stringify({ type: "response.create" }));
    }
    setStatus("processing");
    setInterimText("");
    processingTimerRef.current = setTimeout(() => {
      teardown();
      setError("Could not get transcript — please try again");
    }, 10000);
  }, [teardown, setError]);

  const start = useCallback(async () => {
    if (status !== "idle") { teardown(); return; }

    setStatus("connecting");
    setErrorMsg(null);

    try {
      // 1. Mint ephemeral token from our server — OPENAI_API_KEY stays server-side
      const res = await fetch("/api/voice/session", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string; detail?: string };
        throw new Error(body.detail ? `${body.detail}` : (body.error ?? "Voice search unavailable"));
      }
      const session = await res.json() as { value?: string };
      const key = session.value;
      if (!key) throw new Error("No session token returned");

      // 2. Microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Peer connection — add mic track
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      stream.getAudioTracks().forEach(t => pc.addTrack(t, stream));

      // 4. Data channel — shared message handler used for both browser- and server-created channels
      const onDcMessage = (e: MessageEvent) => {
        const ev = JSON.parse(e.data as string) as RealtimeEvent;

        // Server is ready — now safe to configure transcription and start listening
        if (ev.type === "session.created") {
          dcRef.current?.send(JSON.stringify({
            type: "session.update",
            session: {
              modalities: ["text"],
              audio: {
                input: { transcription: { model: "gpt-4o-mini-transcribe" } },
              },
            },
          }));
          setStatus("listening");
        }

        if (
          ev.type === "conversation.item.input_audio_transcription_delta" ||
          ev.type === "conversation.item.input_audio_transcription.delta"
        ) {
          const next = interimRef.current + (ev.delta ?? "");
          interimRef.current = next;
          setInterimText(next);
        }

        if (ev.type === "input_audio_buffer.speech_stopped") {
          setStatus("processing");
          processingTimerRef.current = setTimeout(() => {
            teardown();
            setError("Could not get transcript — please try again");
          }, 10000);
        }

        if (
          ev.type === "conversation.item.input_audio_transcription_completed" ||
          ev.type === "conversation.item.input_audio_transcription.completed"
        ) {
          const userText = ev.transcript?.trim() ?? "";
          interimRef.current = "";
          setInterimText("");
          if (userText) {
            userTranscriptRef.current = userText;
            onIslaText?.(islaTextRef.current.trim());
            onTranscript(userText);
            teardown();
          } else {
            teardown();
          }
        }

        if (ev.type === "response.audio_transcript.delta" || ev.type === "response.text.delta") {
          islaTextRef.current += ev.delta ?? "";
        }

        if (ev.type === "response.done") {
          const userText = userTranscriptRef.current || interimRef.current.trim();
          if (userText) {
            userTranscriptRef.current = "";
            interimRef.current = "";
            onIslaText?.(islaTextRef.current.trim());
            onTranscript(userText);
            teardown();
          }
        }
      };

      const activateChannel = (channel: RTCDataChannel) => {
        dcRef.current = channel;
        channel.onmessage = onDcMessage;
        channel.onerror = () => { teardown(); setError("Connection lost — try again"); };
        // session.update is sent after server fires session.created
      };

      // Browser creates the DC so it appears in the SDP offer
      const dc = pc.createDataChannel("oai-events");
      dc.onopen = () => activateChannel(dc);

      // OpenAI may also push its own DC — wire the same handler if so
      pc.ondatachannel = (e) => {
        if (e.channel.readyState === "open") {
          activateChannel(e.channel);
        } else {
          e.channel.onopen = () => activateChannel(e.channel);
        }
      };

      // 5. SDP offer/answer handshake directly with OpenAI using the ephemeral key
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });

      if (!sdpRes.ok) throw new Error("WebRTC handshake failed");
      const answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

    } catch (err) {
      teardown();
      setError(err instanceof Error ? err.message : "Voice search unavailable");
    }
  }, [status, teardown, setError, onTranscript, onIslaText]);

  // Clean up WebRTC on unmount (e.g. page navigation mid-session)
  useEffect(() => () => { teardown(); }, [teardown]);

  const listening = status === "listening";
  const connecting = status === "connecting";
  const processing = status === "processing";
  const busy = connecting || processing;

  // Subtle rings invite a tap when idle and signal active capture when listening
  const showRings = !disabled && (status === "idle" || listening);
  const ringColor = listening ? "var(--abode-error)" : "var(--abode-gold)";

  const handleMicClick = () => {
    if (status === "idle") start();
    else if (listening) stopMic();
    else teardown();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-white text-xs font-sans font-semibold tracking-[0.22em] uppercase">
        {errorMsg ?? (connecting ? "Connecting…" : processing ? "Searching…" : listening ? "Tap to Stop" : "Ask Isla")}
      </span>
      <div className="relative flex items-center justify-center w-20 h-20">
        {showRings && (
          <>
            {/* Soft radial glow that gently breathes behind the button */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-[-30%] rounded-full animate-glow-breathe"
              style={{
                background: `radial-gradient(circle, ${ringColor} 0%, transparent 65%)`,
                opacity: 0.4,
              }}
            />
            {/* Concentric hairline rings radiating outward */}
            {[0, 1, 2].map(i => (
              <span
                key={i}
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full animate-ripple"
                style={{
                  border: `1px solid ${ringColor}`,
                  animationDelay: `${i * 1.5}s`,
                }}
              />
            ))}
          </>
        )}
        <button
          type="button"
          onClick={handleMicClick}
          disabled={disabled || busy}
          aria-label={listening ? "Stop listening" : "Start voice search"}
          className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-colors duration-300 outline-none focus:outline-none
            ${disabled || busy ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          style={{ background: listening ? "var(--abode-error)" : "var(--abode-gold)" }}
        >
          {listening ? <WaveformIcon size={30} /> : processing ? <span className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <MicIcon size={30} />}
        </button>
      </div>
      {interimText && (
        <p className="text-white/60 text-xs font-sans text-center max-w-xs truncate">{interimText}</p>
      )}
    </div>
  );
}

function MicIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="text-white">
      <rect x="9" y="2" width="6" height="13" rx="3" fill="currentColor" />
      <path d="M5 10a7 7 0 0014 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="21" x2="12" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WaveformIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.72)} viewBox="0 0 28 20" fill="none" className="text-white">
      <rect x="0" y="8" width="3" height="4" rx="1.5" fill="currentColor">
        <animate attributeName="height" values="4;12;4" dur="0.8s" repeatCount="indefinite" />
        <animate attributeName="y" values="8;4;8" dur="0.8s" repeatCount="indefinite" />
      </rect>
      <rect x="5" y="5" width="3" height="10" rx="1.5" fill="currentColor">
        <animate attributeName="height" values="10;18;10" dur="0.6s" repeatCount="indefinite" />
        <animate attributeName="y" values="5;1;5" dur="0.6s" repeatCount="indefinite" />
      </rect>
      <rect x="10" y="2" width="3" height="16" rx="1.5" fill="currentColor">
        <animate attributeName="height" values="16;8;16" dur="0.9s" repeatCount="indefinite" />
        <animate attributeName="y" values="2;6;2" dur="0.9s" repeatCount="indefinite" />
      </rect>
      <rect x="15" y="5" width="3" height="10" rx="1.5" fill="currentColor">
        <animate attributeName="height" values="10;18;10" dur="0.7s" repeatCount="indefinite" />
        <animate attributeName="y" values="5;1;5" dur="0.7s" repeatCount="indefinite" />
      </rect>
      <rect x="20" y="8" width="3" height="4" rx="1.5" fill="currentColor">
        <animate attributeName="height" values="4;14;4" dur="0.8s" repeatCount="indefinite" />
        <animate attributeName="y" values="8;3;8" dur="0.8s" repeatCount="indefinite" />
      </rect>
      <rect x="25" y="6" width="3" height="8" rx="1.5" fill="currentColor">
        <animate attributeName="height" values="8;16;8" dur="0.65s" repeatCount="indefinite" />
        <animate attributeName="y" values="6;2;6" dur="0.65s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}
