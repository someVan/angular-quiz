import { Injectable, assertPlatform } from '@angular/core';
import { assert, castExists } from '../utils';

interface pattern {
  [key: string]: string;
}

const SPEACH_DELAY = 800;
const NEXT_SPEACH_DELAY = 500;

@Injectable({ providedIn: 'root' })
export class VoiceService {
  private speech!: SpeechSynthesisUtterance;
  private replacements: { [key: string]: string } = {
    '_+': 'bla bla',
  };
  isVoiceOverOn = true;
  isVoiceOverMessagesOn = true;

  constructor() {
    this.speech = castExists<SpeechSynthesisUtterance>(
      new SpeechSynthesisUtterance(),
      'No speechSynthesis found'
    );
    this.initVoice();
  }

  private initVoice(speed = 1.2, voiceName = 'Samantha') {
    const voices = window.speechSynthesis.getVoices();
    assert(voices, 'No voices found');
    const voice = voices.find((voice) => voice.name === voiceName);
    this.speech.rate = speed;
    this.speech.voice = voice!;
    this.speech.volume = 1.0;
    this.speech.lang = 'en-US';
  }

  private cleanSpeech(text: string) {
    let newText = text;
    for (const pattern in this.replacements) {
      if (this.replacements.hasOwnProperty(pattern)) {
        const replacement = this.replacements[pattern];
        const regexp = new RegExp(pattern, 'gi');
        newText = newText.replace(regexp, replacement);
      }
    }
    return newText;
  }

  updateSettigns(isVoiceOverOn: boolean, isVoiceOverMessagesOn: boolean) {
    if (!(isVoiceOverOn || isVoiceOverMessagesOn)) {
      this.voiceOver('Voice off', 0);
    }
    this.isVoiceOverOn = isVoiceOverOn;
    this.isVoiceOverMessagesOn = isVoiceOverMessagesOn;
    if (isVoiceOverMessagesOn && isVoiceOverOn) {
      this.voiceOver('Voice on', 0);
    }
  }

  stop() {
    window.speechSynthesis.cancel();
  }

  voiceOver(text: string, delay = SPEACH_DELAY) {
    if (!this.isVoiceOverOn) return;

    this.initVoice();
    window.speechSynthesis.cancel();
    this.speech.text = this.cleanSpeech(text);
    setTimeout(() => {
      window.speechSynthesis.speak(this.speech);
    }, delay);
  }

  voiceOverMessages(messages: string[]) {
    if (!this.isVoiceOverMessagesOn) return;

    this.initVoice();
    this.stop();
    // Create a new SpeechSynthesisUtterance object for each message
    const speachs = messages.map((message) => {
      const utterance = new SpeechSynthesisUtterance();
      utterance.text = message;
      return utterance;
    });

    // Speak each message with a delay between them
    let currentIndex = 0;
    const speakNextUtterance = () => {
      if (messages.length === 0) return;

      this.speech.text = messages.shift() || '';
      this.speech.onend = () => {
        speakNextUtterance();
      };
      setTimeout(() => {
        window.speechSynthesis.speak(this.speech);
      }, NEXT_SPEACH_DELAY);
    };
    speakNextUtterance();
  }
}
