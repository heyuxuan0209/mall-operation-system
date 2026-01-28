'use client';

import React from 'react';
import { Mic, Square, Trash2, Play, Pause, ChevronDown } from 'lucide-react';
import { MediaAttachment, VoiceNote } from '@/types';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

interface VoiceRecorderProps {
  onRecordComplete?: (voiceNote: VoiceNote, transcript?: string) => void;
  maxDuration?: number;
  withSpeechRecognition?: boolean;
}

// Phase 3: 访谈提纲定义
const interviewGuides = {
  businessPain: {
    title: '经营痛点访谈',
    icon: '💬',
    color: 'blue',
    prompts: [
      '最近客流量有什么变化？',
      '目前最大的经营困难是什么？',
      '有没有遇到供应链或库存问题？',
      '员工招聘和管理上有什么挑战？',
      '对商场的服务支持有什么建议？',
    ],
  },
  improvementNeeds: {
    title: '改善需求访谈',
    icon: '🎯',
    color: 'green',
    prompts: [
      '店面装修或设备有哪些需要维修的？',
      '希望商场提供哪些营销支持？',
      '对商场的管理制度有什么意见？',
      '需要哪些培训或指导？',
    ],
  },
  riskAssessment: {
    title: '风险排查访谈',
    icon: '⚠️',
    color: 'orange',
    prompts: [
      '租金缴纳是否有压力？',
      '现金流是否充足？',
      '有没有考虑过调整经营方向？',
      '对未来经营是否有信心？',
    ],
  },
  freeNote: {
    title: '自由记录',
    icon: '📝',
    color: 'purple',
    prompts: [
      '记录现场观察到的情况',
      '记录与商户的沟通内容',
    ],
  },
};

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
  const [selectedType, setSelectedType] = React.useState<keyof typeof interviewGuides>('businessPain');
  const [showPrompts, setShowPrompts] = React.useState(true);
  const [speechSupported, setSpeechSupported] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // 检查语音识别支持
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      setSpeechSupported(supported);
      if (!supported && withSpeechRecognition) {
        console.warn('浏览器不支持语音识别功能');
      }
    }
  }, [withSpeechRecognition]);

  // 通知父组件录音完成
  const prevAudioAttachmentRef = React.useRef<MediaAttachment | null>(null);

  React.useEffect(() => {
    // 只在audioAttachment从null变为有值时触发一次
    if (audioAttachment && !prevAudioAttachmentRef.current && onRecordComplete) {
      const voiceNote: VoiceNote = {
        ...audioAttachment,
        interviewType: selectedType,
        transcript,
      };
      onRecordComplete(voiceNote, transcript);
    }
    prevAudioAttachmentRef.current = audioAttachment;
  }, [audioAttachment, transcript, selectedType, onRecordComplete]);

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

  const getTypeColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100';
      case 'green':
        return 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100';
      case 'orange':
        return 'border-orange-500 bg-orange-50 text-orange-700 hover:bg-orange-100';
      case 'purple':
        return 'border-purple-500 bg-purple-50 text-purple-700 hover:bg-purple-100';
      default:
        return 'border-gray-500 bg-gray-50 text-gray-700 hover:bg-gray-100';
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
        当前浏览器不支持录音功能，请使用Chrome、Safari或Edge浏览器。
      </div>
    );
  }

  const currentGuide = interviewGuides[selectedType];

  return (
    <div className="space-y-4">
      {/* Phase 3: 访谈类型选择 */}
      {!audioAttachment && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">选择访谈类型</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(interviewGuides).map(([key, guide]) => (
              <button
                key={key}
                onClick={() => setSelectedType(key as keyof typeof interviewGuides)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedType === key
                    ? getTypeColor(guide.color) + ' ring-2 ring-offset-2'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">{guide.icon}</span>
                <span className="text-sm font-medium">{guide.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Phase 3: 访谈提纲提示 */}
      {!audioAttachment && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowPrompts(!showPrompts)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentGuide.icon}</span>
              <span className="text-sm font-semibold text-gray-900">
                {currentGuide.title} - 访谈提纲
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`text-gray-500 transition-transform ${
                showPrompts ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showPrompts && (
            <div className="px-4 pb-4 space-y-2">
              {currentGuide.prompts.map((prompt, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-700 bg-white/60 px-3 py-2 rounded-md"
                >
                  <span className="text-brand-600 font-semibold flex-shrink-0">
                    {index + 1}.
                  </span>
                  <span>{prompt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
            {/* 访谈类型标签 */}
            <div className={`px-4 py-2 rounded-full border-2 ${getTypeColor(currentGuide.color)}`}>
              <span className="text-lg mr-2">{currentGuide.icon}</span>
              <span className="text-sm font-medium">{currentGuide.title}</span>
            </div>

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
          <div className="text-sm font-medium text-blue-900 mb-2">✅ 识别文本：</div>
          <div className="text-sm text-blue-700 whitespace-pre-wrap">{transcript}</div>
        </div>
      )}

      {/* 语音识别状态提示 */}
      {withSpeechRecognition && isRecording && !transcript && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">🎤</span>
            <span>正在监听语音识别...</span>
          </div>
          <div className="text-xs mt-1 text-yellow-600">
            请确保已授予麦克风权限，并开始说话
          </div>
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
        <div className="text-xs text-gray-500 text-center space-y-1">
          {withSpeechRecognition && speechSupported && (
            <p className="text-green-600 font-medium">✅ 语音识别功能已开启，录音时会自动转换为文字</p>
          )}
          {withSpeechRecognition && !speechSupported && (
            <p className="text-orange-600 font-medium">⚠️ 当前浏览器不支持语音识别，建议使用Chrome或Edge浏览器</p>
          )}
          <p>录音时请参考上方访谈提纲进行沟通</p>
        </div>
      )}
    </div>
  );
}
