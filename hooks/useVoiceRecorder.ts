'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { MediaAttachment } from '@/types';
import { audioStorage } from '@/utils/audioStorage';
import { getSpeechRecognition } from '@/utils/speechRecognition';

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  duration: number;
  transcript: string;
  audioAttachment: MediaAttachment | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  clear: () => void;
  isSupported: boolean;
  error: string | null;
}

export function useVoiceRecorder(options?: {
  withSpeechRecognition?: boolean;
  maxDuration?: number;
}): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [audioAttachment, setAudioAttachment] = useState<MediaAttachment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const withSpeech = options?.withSpeechRecognition ?? true;
  const maxDuration = options?.maxDuration ?? 120;

  const isSupported = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('浏览器不支持录音功能');
      return;
    }

    setError(null);
    setTranscript('');
    setAudioAttachment(null);
    setDuration(0);

    try {
      // 开始音频录制
      const { recorder, stream } = await audioStorage.startRecording();
      recorderRef.current = recorder;
      streamRef.current = stream;

      recorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // 启动计时器
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);

        // 达到最大时长自动停止
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 1000);

      // 启动语音识别（如果支持且启用）
      if (withSpeech) {
        console.log('[useVoiceRecorder] Attempting to start speech recognition');
        const speechRecognition = getSpeechRecognition();
        if (speechRecognition.isSupported()) {
          console.log('[useVoiceRecorder] Speech recognition is supported');
          speechRecognition.clearTranscript();
          await speechRecognition.startRecognition({
            continuous: true,
            interimResults: true,
            onResult: (text, isFinal) => {
              console.log('[useVoiceRecorder] Got speech result:', { text, isFinal });
              if (isFinal) {
                setTranscript(prev => {
                  const newTranscript = prev + text;
                  console.log('[useVoiceRecorder] Updated transcript:', newTranscript);
                  return newTranscript;
                });
              }
            },
            onError: (err) => {
              console.warn('[useVoiceRecorder] Speech recognition error:', err);
            },
          });
        } else {
          console.warn('[useVoiceRecorder] Speech recognition not supported');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '录音失败');
      setIsRecording(false);
    }
  }, [isSupported, withSpeech, maxDuration]);

  const stopRecording = useCallback(async () => {
    if (!recorderRef.current || !streamRef.current || !isRecording) {
      return;
    }

    // 停止计时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 停止语音识别
    if (withSpeech) {
      console.log('[useVoiceRecorder] Stopping speech recognition');
      const speechRecognition = getSpeechRecognition();
      if (speechRecognition.isSupported()) {
        const finalTranscript = speechRecognition.stopRecognition();
        console.log('[useVoiceRecorder] Final transcript from stop:', finalTranscript);
        if (finalTranscript) {
          setTranscript(finalTranscript);
        }
      }
    }

    try {
      // 获取地理位置（可选）
      let geolocation: GeolocationPosition | undefined;
      try {
        geolocation = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
          });
        });
      } catch {
        // 忽略定位错误
      }

      // 停止录音并保存
      const attachment = await audioStorage.stopRecording(
        recorderRef.current,
        streamRef.current,
        geolocation,
        duration
      );

      setAudioAttachment(attachment);
      setIsRecording(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '停止录音失败');
      setIsRecording(false);
    }

    recorderRef.current = null;
    streamRef.current = null;
  }, [isRecording, duration, withSpeech]);

  const clear = useCallback(() => {
    setTranscript('');
    setAudioAttachment(null);
    setDuration(0);
    setError(null);
  }, []);

  return {
    isRecording,
    duration,
    transcript,
    audioAttachment,
    startRecording,
    stopRecording,
    clear,
    isSupported,
    error,
  };
}
