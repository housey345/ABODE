"use client";

import { useState, useRef, useCallback } from "react";

interface Props {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export default function VoiceSearch({ onTranscript, disabled, compact }: Props) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const startListening = useCallback(() => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) { setSupported(false); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-GB";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => { setListening(false); recognitionRef.current = null; };
    recognition.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      recognition.stop();
      setListening(false);
      if (transcript.trim()) onTranscript(transcript.trim());
    };
    recognition.onerror = (e) => {
      setListening(false);
      recognitionRef.current = null;
      if (e.error === "not-allowed") {
        setErrorMsg("Microphone access denied");
      } else if (e.error === "network") {
        setErrorMsg("Network error — try again");
      } else if (e.error !== "no-speech") {
        setErrorMsg("Voice search unavailable");
      }
      setTimeout(() => setErrorMsg(null), 3500);
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, [listening, onTranscript]);

  if (!supported) return null;

  if (compact) {
    return (
      <div className="relative flex items-center">
        <button
          onClick={startListening}
          disabled={disabled}
          aria-label={listening ? "Stop listening" : "Start voice search"}
          className={`relative flex items-center justify-center w-8 h-8 shrink-0 transition-colors duration-200 outline-none focus:outline-none rounded-full md:rounded-none
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          style={{ background: errorMsg || listening ? "var(--abode-error)" : "var(--abode-gold)" }}
        >
          {listening ? <WaveformIcon size={12} /> : <span className="animate-pulse-ring inline-flex"><MicIcon size={14} /></span>}
        </button>
        {errorMsg && (
          <span className="absolute left-10 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-sans tracking-wide text-red-300 pointer-events-none">
            {errorMsg}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full gap-4 md:gap-0">
      <span className="md:hidden text-white text-xs font-sans font-semibold tracking-[0.22em] uppercase">
        {errorMsg ? errorMsg : listening ? "Tap to Stop" : "Ask Isla"}
      </span>
      <button
        onClick={startListening}
        disabled={disabled}
        aria-label={listening ? "Stop listening" : "Start voice search"}
        className={`relative flex flex-col items-center justify-center gap-3 w-20 h-20 rounded-full md:rounded-none md:w-full md:h-auto md:py-9 transition-colors duration-300 outline-none focus:outline-none
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        style={{ background: listening ? "var(--abode-error)" : "var(--abode-gold)" }}
      >
        {listening ? <WaveformIcon size={30} /> : <span className="animate-pulse-ring inline-flex"><MicIcon size={30} /></span>}
        <span className="hidden md:inline text-white text-xs font-sans font-semibold tracking-[0.22em] uppercase">
          {errorMsg ?? (listening ? "Listening — Tap to Stop" : "Ask Isla")}
        </span>
      </button>
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
