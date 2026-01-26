'use client';

import React from 'react';
import { Mic, Square, Trash2, Play, Pause } from 'lucide-react';
import { MediaAttachment } from '@/types';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

interface VoiceRecorderProps {
  onRecordComplete?: (attachment: MediaAttachment, transcript?: string) => void;
  maxDuration?: number;
  withSpeechRecognition?: boolean;
}

export default function VoiceRecorder({
  onRecordComplete,
  maxDuration = 120,
  withSpeechRecognition = true,
}: VoiceRecorderProps) {
  const {
    isRecording,
    duration,
    transcript,
    audioAttachment,
    startRecording,
    stopRecording,
    clear,
    isSupported,
    error,
  } = useVoiceRecorder({ withSpeechRecognition, maxDuration });

  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // 通知父组件录音完成
  React.useEffect(() => {
    if (audioAttachment && onRecordComplete) {
      onRecordComplete(audioAttachment, transcript);
    }
  }, [audioAttachment, transcript, onRecordComplete]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
        当前浏览器不支持录音功能，请使用Chrome、Safari或Edge浏览器。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 录音控制区域 */}
      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8 space-y-4">
        {/* 录音按钮 */}
        {!audioAttachment && (
          <>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-brand-600 hover:bg-brand-700'
              }`}
            >
              {isRecording ? (
                <Square size={32} className="text-white" />
              ) : (
                <Mic size={32} className="text-white" />
              )}

              {/* 录音动画波形 */}
              {isRecording && (
                <div className="absolute inset-0 -z-10">
                  <div className="absolute inset-0 rounded-full bg-red-500 opacity-50 animate-ping" />
                </div>
              )}
            </button>

            {/* 计时器 */}
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-gray-900">
                {formatDuration(duration)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {isRecording ? '录音中...' : '点击开始录音'}
              </div>
              {isRecording && (
                <div className="text-xs text-gray-400 mt-1">
                  最长{maxDuration}秒
                </div>
              )}
            </div>
          </>
        )}

        {/* 播放控制（录音完成后） */}
        {audioAttachment && (
          <>
            <div className="flex gap-3">
              <button
                onClick={handlePlayPause}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                {isPlaying ? '暂停' : '播放'}
              </button>
              <button
                onClick={clear}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 size={20} />
                删除
              </button>
            </div>

            {/* 音频元素 */}
            <audio
              ref={audioRef}
              src={audioAttachment.data}
              onEnded={handleAudioEnd}
              className="hidden"
            />

            {/* 录音信息 */}
            <div className="text-sm text-gray-600 text-center">
              <div>
                时长: {formatDuration(audioAttachment.duration || 0)}
              </div>
              <div>大小: {(audioAttachment.size / 1024).toFixed(1)} KB</div>
            </div>
          </>
        )}
      </div>

      {/* 语音识别文本 */}
      {withSpeechRecognition && transcript && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-900 mb-2">识别文本：</div>
          <div className="text-sm text-blue-700 whitespace-pre-wrap">{transcript}</div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 提示信息 */}
      {!isRecording && !audioAttachment && (
        <div className="text-xs text-gray-500 text-center">
          {withSpeechRecognition && (
            <p>语音识别功能已开启，录音时会自动转换为文字</p>
          )}
        </div>
      )}
    </div>
  );
}
