/**
 * 实时诊断助手
 * Sprint 2: 巡检中AI实时辅助
 *
 * 在巡检过程中实时显示AI诊断建议
 */

'use client';

import React from 'react';
import { Lightbulb, AlertTriangle, CheckCircle, TrendingUp, Camera, Mic, Star, Info } from 'lucide-react';
import { PhotoAttachment, VoiceNote, QuickRating } from '@/types';
import { analyzeMultiplePhotos, AIDetectedIssue } from '@/skills/photo-ai-analyzer';
import { analyzeSentiment, VoiceAIAnalysis } from '@/skills/voice-sentiment-analyzer';

interface RealTimeDiagnosticsProps {
  photos: PhotoAttachment[];
  audioNotes: VoiceNote[];
  rating: QuickRating | null;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export default function RealTimeDiagnostics({
  photos,
  audioNotes,
  rating,
  isExpanded = false,
  onToggle,
}: RealTimeDiagnosticsProps) {
  const [photoAnalysis, setPhotoAnalysis] = React.useState<{
    totalIssues: number;
    criticalIssues: number;
    warningIssues: number;
    avgQualityScore: number;
    allIssues: AIDetectedIssue[];
  } | null>(null);

  const [voiceAnalysis, setVoiceAnalysis] = React.useState<VoiceAIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  // 分析照片
  React.useEffect(() => {
    if (photos.length > 0) {
      setIsAnalyzing(true);
      analyzeMultiplePhotos(
        photos.map(p => ({
          data: p.data,
          category: p.category,
          description: p.description,
        }))
      )
        .then(result => {
          setPhotoAnalysis(result);
        })
        .finally(() => {
          setIsAnalyzing(false);
        });
    } else {
      setPhotoAnalysis(null);
    }
  }, [photos]);

  // 分析语音
  React.useEffect(() => {
    if (audioNotes.length > 0) {
      const latestNote = audioNotes[audioNotes.length - 1];
      if (latestNote.transcript) {
        const analysis = analyzeSentiment(latestNote.transcript);
        setVoiceAnalysis(analysis);
      }
    } else {
      setVoiceAnalysis(null);
    }
  }, [audioNotes]);

  // 计算数据完整度
  const dataCompleteness = React.useMemo(() => {
    let score = 0;
    const maxScore = 4;

    if (photos.length > 0) score += 1;
    if (audioNotes.length > 0 && audioNotes[0].transcript) score += 1;
    if (rating) score += 1.5;
    if (photos.length >= 3) score += 0.5; // 照片数量充足

    return Math.round((score / maxScore) * 100);
  }, [photos, audioNotes, rating]);

  // 生成建议
  const suggestions = React.useMemo(() => {
    const sug: string[] = [];

    if (dataCompleteness < 50) {
      sug.push('建议补充更多巡检数据以获得准确诊断');
    }

    if (photos.length === 0) {
      sug.push('建议拍摄现场照片记录');
    } else if (photos.length < 3) {
      sug.push('建议拍摄更多照片全面记录现场');
    }

    if (audioNotes.length === 0) {
      sug.push('建议录制语音笔记记录商户沟通');
    }

    if (!rating) {
      sug.push('建议完成快速评分');
    }

    if (photoAnalysis && photoAnalysis.criticalIssues > 0) {
      sug.push(`发现${photoAnalysis.criticalIssues}个严重问题，建议重点关注`);
    }

    if (voiceAnalysis && voiceAnalysis.issues.length > 0) {
      sug.push(`检测到${voiceAnalysis.issues.length}个潜在问题，建议创建帮扶任务`);
    }

    if (sug.length === 0) {
      sug.push('数据采集完整，可以保存巡检记录');
    }

    return sug;
  }, [dataCompleteness, photos.length, audioNotes.length, rating, photoAnalysis, voiceAnalysis]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-purple-500 shadow-2xl z-40">
      {/* 头部 - 可点击展开/收起 */}
      <div
        className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white cursor-pointer"
        onClick={onToggle}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Lightbulb size={22} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-sm">AI诊断助手</div>
              <div className="text-xs opacity-90">
                {photoAnalysis && photoAnalysis.totalIssues > 0
                  ? `发现 ${photoAnalysis.totalIssues} 个问题`
                  : '实时分析中...'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* 数据完整度 */}
            <div className="text-right">
              <div className="text-xs opacity-90">数据完整度</div>
              <div className="font-bold">{dataCompleteness}%</div>
            </div>
            {/* 展开/收起按钮 */}
            <button className="text-white">
              <i className={`fas fa-chevron-${isExpanded ? 'down' : 'up'} text-lg`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* 内容区 - 展开时显示 */}
      {isExpanded && (
        <div className="max-w-4xl mx-auto px-4 py-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 左侧：数据采集状态 */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Info size={18} className="text-blue-600" />
                数据采集状态
              </h3>

              {/* 照片 */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  photos.length > 0 ? 'bg-green-100' : 'bg-gray-200'
                }`}>
                  <Camera size={20} className={photos.length > 0 ? 'text-green-600' : 'text-gray-400'} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">照片记录</div>
                  <div className="text-xs text-gray-600">
                    {photos.length > 0 ? `已拍摄 ${photos.length} 张` : '未拍摄'}
                  </div>
                </div>
                {photos.length > 0 && (
                  <CheckCircle size={18} className="text-green-600" />
                )}
              </div>

              {/* 语音 */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  audioNotes.length > 0 ? 'bg-green-100' : 'bg-gray-200'
                }`}>
                  <Mic size={20} className={audioNotes.length > 0 ? 'text-green-600' : 'text-gray-400'} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">语音笔记</div>
                  <div className="text-xs text-gray-600">
                    {audioNotes.length > 0
                      ? `已录制 ${audioNotes.length} 条`
                      : '未录制'}
                  </div>
                </div>
                {audioNotes.length > 0 && (
                  <CheckCircle size={18} className="text-green-600" />
                )}
              </div>

              {/* 评分 */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  rating ? 'bg-green-100' : 'bg-gray-200'
                }`}>
                  <Star size={20} className={rating ? 'text-green-600' : 'text-gray-400'} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">快速评分</div>
                  <div className="text-xs text-gray-600">
                    {rating ? '已完成评分' : '未评分'}
                  </div>
                </div>
                {rating && (
                  <CheckCircle size={18} className="text-green-600" />
                )}
              </div>

              {/* 完整度进度条 */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>整体完整度</span>
                  <span className="font-semibold">{dataCompleteness}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      dataCompleteness >= 80
                        ? 'bg-green-500'
                        : dataCompleteness >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${dataCompleteness}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 右侧：AI洞察 */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-purple-600" />
                AI洞察
              </h3>

              {/* 发现的问题 */}
              {photoAnalysis && photoAnalysis.allIssues.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">发现的问题</div>
                  {photoAnalysis.allIssues.slice(0, 3).map((issue, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-lg text-sm ${
                        issue.severity === 'critical'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-orange-50 text-orange-700 border border-orange-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle
                          size={16}
                          className={`flex-shrink-0 mt-0.5 ${
                            issue.severity === 'critical' ? 'text-red-600' : 'text-orange-600'
                          }`}
                        />
                        <div>
                          <div className="font-medium">[{issue.category}] {issue.issue}</div>
                          <div className="text-xs opacity-80 mt-1">{issue.suggestion}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 语音洞察 */}
              {voiceAnalysis && voiceAnalysis.actionableInsights.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">语音洞察</div>
                  {voiceAnalysis.actionableInsights.slice(0, 2).map((insight, index) => (
                    <div
                      key={index}
                      className="p-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm flex items-start gap-2"
                    >
                      <Lightbulb size={16} className="flex-shrink-0 mt-0.5 text-blue-600" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 建议 */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">建议</div>
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-sm flex items-start gap-2"
                  >
                    <CheckCircle size={16} className="flex-shrink-0 mt-0.5 text-purple-600" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>

              {/* 分析中状态 */}
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-purple-600" />
                  <span>AI分析中...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
