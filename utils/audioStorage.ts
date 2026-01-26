import { MediaAttachment } from '@/types';
import { blobToBase64 } from './compression';

/**
 * 音频存储服务
 */
class AudioStorageService {
  private static instance: AudioStorageService;

  // 配置
  private readonly MAX_DURATION = 120;         // 最大录音时长120秒
  private readonly MAX_FILE_SIZE = 1024 * 1024;  // 1MB per audio
  private readonly MAX_AUDIOS = 30;            // 最多存储30段录音

  // 存储键
  private readonly STORAGE_KEY = 'inspection_audio';

  private constructor() {}

  static getInstance(): AudioStorageService {
    if (!AudioStorageService.instance) {
      AudioStorageService.instance = new AudioStorageService();
    }
    return AudioStorageService.instance;
  }

  /**
   * 开始录音
   */
  async startRecording(): Promise<{
    recorder: MediaRecorder;
    stream: MediaStream;
  }> {
    try {
      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 检测支持的格式
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/ogg;codecs=opus';
          }
        }
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 32000, // 32kbps for voice
      });

      return { recorder, stream };
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('无法访问麦克风，请检查权限设置');
    }
  }

  /**
   * 停止录音并保存
   */
  async stopRecording(
    recorder: MediaRecorder,
    stream: MediaStream,
    geolocation?: GeolocationPosition,
    duration?: number
  ): Promise<MediaAttachment> {
    return new Promise((resolve, reject) => {
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // 停止所有音轨
        stream.getTracks().forEach(track => track.stop());

        // 合并音频数据
        const blob = new Blob(chunks, { type: recorder.mimeType });

        // 检查大小
        if (blob.size > this.MAX_FILE_SIZE) {
          reject(new Error(`录音文件过大（${(blob.size / 1024 / 1024).toFixed(2)}MB），请缩短录音时长`));
          return;
        }

        try {
          // 转Base64
          const base64 = await blobToBase64(blob);

          // 创建MediaAttachment对象
          const attachment: MediaAttachment = {
            id: `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'audio',
            data: base64,
            size: blob.size,
            mimeType: recorder.mimeType,
            createdAt: new Date().toISOString(),
            duration,
            geolocation: geolocation ? {
              latitude: geolocation.coords.latitude,
              longitude: geolocation.coords.longitude,
              accuracy: geolocation.coords.accuracy,
            } : undefined,
          };

          // 存储
          this.saveAudio(attachment);

          resolve(attachment);
        } catch (error) {
          reject(error);
        }
      };

      recorder.stop();
    });
  }

  /**
   * 保存音频到LocalStorage
   */
  private saveAudio(attachment: MediaAttachment): void {
    if (typeof window === 'undefined') return;
    const audios = this.getAllAudios();
    audios.push(attachment);

    // 限制数量
    if (audios.length > this.MAX_AUDIOS) {
      audios.shift(); // 删除最旧的
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(audios));
  }

  /**
   * 获取所有音频
   */
  getAllAudios(): MediaAttachment[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * 获取音频
   */
  getAudio(id: string): MediaAttachment | null {
    const audios = this.getAllAudios();
    return audios.find(audio => audio.id === id) || null;
  }

  /**
   * 删除音频
   */
  deleteAudio(id: string): void {
    if (typeof window === 'undefined') return;
    const audios = this.getAllAudios().filter(audio => audio.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(audios));
  }

  /**
   * 清理过期音频（保留最近7天）
   */
  cleanup(retentionDays: number = 7): number {
    if (typeof window === 'undefined') return 0;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const audios = this.getAllAudios();
    const filteredAudios = audios.filter(audio => {
      const createdDate = new Date(audio.createdAt);
      return createdDate > cutoffDate;
    });

    const deletedCount = audios.length - filteredAudios.length;

    if (deletedCount > 0) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredAudios));
    }

    return deletedCount;
  }
}

export const audioStorage = AudioStorageService.getInstance();
