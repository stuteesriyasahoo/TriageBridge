'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Mic,
  MicOff,
  Pause,
  Play,
  Square,
  RotateCcw,
  CheckCircle2,
  Volume2,
  AlertCircle,
  VolumeX,
  Edit3,
} from 'lucide-react';

interface VoiceInputStudioProps {
  initialText?: string;
  onTranscriptionChange: (text: string) => void;
  onAudioRecorded?: (audioBlobUrl: string) => void;
  placeholder?: string;
  label?: string;
  samplePhrase?: string;
}

export function VoiceInputStudio({
  initialText = '',
  onTranscriptionChange,
  onAudioRecorded,
  placeholder,
  label,
  samplePhrase,
}: VoiceInputStudioProps) {
  const { currentLanguageMeta, t, isRTL } = useLanguage();

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState(initialText);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [noiseDetected, setNoiseDetected] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // References
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Sync initial text
  useEffect(() => {
    if (initialText && !transcript) {
      setTranscript(initialText);
    }
  }, [initialText]);

  const stopAllMedia = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllMedia();
    };
  }, []);

  const startRecording = async () => {
    setPermissionError(null);
    setIsConfirmed(false);
    audioChunksRef.current = [];

    // Request Mic permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermissionState('granted');

      // Audio analysis for background noise
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyserRef.current = analyser;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          // Check ambient noise level
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          setTimeout(() => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const avg = sum / dataArray.length;
              if (avg > 38) {
                setNoiseDetected(true);
              } else {
                setNoiseDetected(false);
              }
            }
          }, 1500);
        }
      } catch {
        // audio analysis optional
      }

      // Initialize MediaRecorder for Replay
      try {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        mediaRecorder.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            if (onAudioRecorded) {
              onAudioRecorded(url);
            }
          }
          // Stop stream tracks
          stream.getTracks().forEach((track) => track.stop());
        };
        mediaRecorder.start(250);
      } catch {
        // MediaRecorder fallback
      }

      // Live Speech-to-Text if supported by browser & language
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition && currentLanguageMeta.speechRecognitionSupported) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = currentLanguageMeta.bcp47;

          recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + ' ';
              }
            }
            if (finalTranscript.trim()) {
              setTranscript((prev) => {
                const updated = (prev ? prev.trim() + ' ' : '') + finalTranscript.trim();
                onTranscriptionChange(updated);
                return updated;
              });
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('Speech recognition warning:', e.error);
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (recErr) {
          console.warn('Speech recognition failed to start:', recErr);
        }
      }

      setIsRecording(true);
      setIsPaused(false);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setMicPermissionState('denied');
      setPermissionError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? t.voice.micPermissionDenied
          : t.voice.micPermission
      );
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsPaused(true);
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && currentLanguageMeta.speechRecognitionSupported) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = currentLanguageMeta.bcp47;
        recognition.onresult = (event: any) => {
          let text = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) text += event.results[i][0].transcript + ' ';
          }
          if (text.trim()) {
            setTranscript((prev) => {
              const updated = (prev ? prev.trim() + ' ' : '') + text.trim();
              onTranscriptionChange(updated);
              return updated;
            });
          }
        };
        recognition.start();
        recognitionRef.current = recognition;
      } catch {}
    }
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    stopAllMedia();
    setIsRecording(false);
    setIsPaused(false);
  };

  const handleAudioPlayback = () => {
    if (!audioUrl) return;
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlayingAudio(false);
    }
    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTranscript(val);
    onTranscriptionChange(val);
    setIsConfirmed(false);
  };

  const handleUseSample = () => {
    const sample = samplePhrase || currentLanguageMeta.sampleSymptom;
    setTranscript(sample);
    onTranscriptionChange(sample);
  };

  const formatSecs = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-xs space-y-4">
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 flex items-center justify-center font-medium">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {label || t.voice.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Language: <span className="font-semibold text-slate-700 dark:text-slate-200">{currentLanguageMeta.nameNative}</span> ({currentLanguageMeta.nameEn})
            </p>
          </div>
        </div>

        {/* Quick Sample Button */}
        <button
          type="button"
          onClick={handleUseSample}
          className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
        >
          Paste Native Sample Symptom
        </button>
      </div>

      {/* Honest Capability Notice */}
      {!currentLanguageMeta.speechRecognitionSupported && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-800 dark:text-sky-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Live STT in Technical Preview for {currentLanguageMeta.nameNative}</span>
            {t.voice.notSupportedHonest}
          </div>
        </div>
      )}

      {/* Background Noise Alert */}
      {noiseDetected && isRecording && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
          <Volume2 className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{t.voice.noiseNotice}</span>
        </div>
      )}

      {/* Microphone Permission Warning */}
      {permissionError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200">
          <MicOff className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <span className="font-semibold block">Microphone Access Required:</span>
            {permissionError}
          </div>
        </div>
      )}

      {/* Voice Controls Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F8B8D] hover:bg-[#0c7274] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Mic className="w-4 h-4" />
            <span>{t.voice.start}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {!isPaused ? (
              <button
                type="button"
                onClick={pauseRecording}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>{t.voice.pause}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={resumeRecording}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{t.voice.resume}</span>
              </button>
            )}

            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
              <span>{t.voice.stop}</span>
            </button>

            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>{formatSecs(recordingDuration)}</span>
            </div>
          </div>
        )}

        {/* Audio Replay Button */}
        {audioUrl && (
          <button
            type="button"
            onClick={handleAudioPlayback}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              isPlayingAudio
                ? 'bg-teal-50 dark:bg-teal-900/40 border-teal-500 text-teal-800 dark:text-teal-200'
                : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-teal-600 animate-bounce" />
                <span>{t.voice.playing}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.voice.replay}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Editable Transcription Area */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.voice.editTranscript}</span>
          </label>
          <span className="text-[11px] text-slate-400">
            {transcript ? `${transcript.length} characters` : 'Review & correct below'}
          </span>
        </div>

        <textarea
          rows={4}
          value={transcript}
          onChange={handleTextChange}
          placeholder={placeholder || t.triage.typePlaceholder}
          dir={isRTL ? 'rtl' : 'ltr'}
          className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0F8B8D] leading-relaxed break-words-indic"
        />
      </div>

      {/* Confirmation before submission */}
      {transcript.trim().length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setIsConfirmed(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isConfirmed
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isConfirmed ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>{isConfirmed ? t.voice.confirmed : t.voice.confirmTranscript}</span>
          </button>

          <span className="text-[11px] text-slate-400">
            Original patient statement will be preserved exactly
          </span>
        </div>
      )}
    </div>
  );
}

// Reusable Text-To-Speech Button for Questions & Warnings
export function TextToSpeechButton({
  text,
  className = '',
  size = 'sm',
}: {
  text: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}) {
  const { currentLanguageMeta } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguageMeta.bcp47;
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={speak}
      title="Listen / Read aloud (Text-to-Speech)"
      className={`inline-flex items-center gap-1 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 transition-colors ${className}`}
    >
      {isPlaying ? (
        <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
      ) : (
        <Volume2 className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
