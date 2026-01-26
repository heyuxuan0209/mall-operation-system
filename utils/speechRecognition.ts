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
      return;
    }

    this.transcript = '';
    this.recognition.lang = options.lang || 'zh-CN';
    this.recognition.continuous = options.continuous ?? true;
    this.recognition.interimResults = options.interimResults ?? true;

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        this.transcript += finalTranscript;
      }

      if (options.onResult) {
        options.onResult(
          finalTranscript || interimTranscript,
          !!finalTranscript
        );
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (options.onError) {
        options.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.isListening = true;
    this.recognition.start();
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
