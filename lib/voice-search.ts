// Voice search functionality
export class VoiceSearch {
  private recognition: any = null
  private isSupported: boolean = false

  constructor() {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.lang = 'ru-RU'
      this.isSupported = true
    }
  }

  start(onResult: (text: string) => void, onError?: (error: string) => void) {
    if (!this.isSupported || !this.recognition) {
      onError?.('Голосовой поиск не поддерживается в вашем браузере')
      return false
    }

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
    }

    this.recognition.onerror = (event: any) => {
      let errorMessage = 'Ошибка распознавания речи'
      if (event.error === 'no-speech') {
        errorMessage = 'Речь не распознана'
      } else if (event.error === 'audio-capture') {
        errorMessage = 'Микрофон не найден'
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Доступ к микрофону запрещен'
      }
      onError?.(errorMessage)
    }

    this.recognition.start()
    return true
  }

  stop() {
    if (this.recognition) {
      this.recognition.stop()
    }
  }

  isAvailable(): boolean {
    return this.isSupported
  }
}

