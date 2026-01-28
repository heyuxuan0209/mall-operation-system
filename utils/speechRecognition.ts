/**
 * 语音识别服务（Web Speech API封装）
 */
class SpeechRecognitionService {
  private static instance: SpeechRecognitionService;
  private recognition: any = null;
  private isListening = false;
  private transcript = '';

  private constructor() {
    if (this.isSupported()) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
    }
  }

  static getInstance(): SpeechRecognitionService {
    if (!SpeechRecognitionService.instance) {
      SpeechRecognitionService.instance = new SpeechRecognitionService();
    }
    return SpeechRecognitionService.instance;
  }

  /**
   * 检查浏览器支持
   */
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    );
  }

  /**
   * 开始语音识别
   */
  async startRecognition(options: {
    lang?: string;           // 默认 'zh-CN'
    continuous?: boolean;    // 连续识别
    interimResults?: boolean; // 临时结果
    onResult?: (transcript: string, isFinal: boolean) => void;
    onError?: (error: any) => void;
  } = {}): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('浏览器不支持语音识别');
    }

    if (this.isListening) {
      console.log('[SpeechRecognition] Already listening, skipping start');
      return;
    }

    console.log('[SpeechRecognition] Starting recognition with options:', options);
    this.transcript = '';
    this.recognition.lang = options.lang || 'zh-CN';
    this.recognition.continuous = options.continuous ?? true;
    this.recognition.interimResults = options.interimResults ?? true;

    this.recognition.onresult = (event: any) => {
      console.log('[SpeechRecognition] Got result event:', event);
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        console.log(`[SpeechRecognition] Result ${i}: "${transcript}", isFinal: ${event.results[i].isFinal}`);
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        this.transcript += finalTranscript;
        console.log('[SpeechRecognition] Final transcript updated:', this.transcript);
      }

      if (options.onResult) {
        options.onResult(
          finalTranscript || interimTranscript,
          !!finalTranscript
        );
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('[SpeechRecognition] Error:', event.error, event);
      if (options.onError) {
        options.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      console.log('[SpeechRecognition] Recognition ended');
      this.isListening = false;
    };

    this.recognition.onstart = () => {
      console.log('[SpeechRecognition] Recognition started successfully');
    };

    this.recognition.onaudiostart = () => {
      console.log('[SpeechRecognition] Audio capturing started');
    };

    this.recognition.onsoundstart = () => {
      console.log('[SpeechRecognition] Sound detected');
    };

    this.recognition.onspeechstart = () => {
      console.log('[SpeechRecognition] Speech detected');
    };

    this.recognition.onspeechend = () => {
      console.log('[SpeechRecognition] Speech ended');
    };

    this.recognition.onsoundend = () => {
      console.log('[SpeechRecognition] Sound ended');
    };

    this.recognition.onaudioend = () => {
      console.log('[SpeechRecognition] Audio capturing ended');
    };

    this.isListening = true;
    try {
      this.recognition.start();
      console.log('[SpeechRecognition] Start command issued');
    } catch (err) {
      console.error('[SpeechRecognition] Failed to start:', err);
      this.isListening = false;
      throw err;
    }
  }

  /**
   * 停止识别
   */
  stopRecognition(): string {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
    return this.transcript;
  }

  /**
   * 获取当前识别文本
   */
  getTranscript(): string {
    return this.transcript;
  }

  /**
   * 清空识别文本
   */
  clearTranscript(): void {
    this.transcript = '';
  }
}

// Lazy singleton - only created when first accessed
export function getSpeechRecognition(): SpeechRecognitionService {
  return SpeechRecognitionService.getInstance();
}
