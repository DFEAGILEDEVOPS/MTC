import { Injectable } from '@angular/core';

import { AuditService } from '../audit/audit.service';
import { UtteranceStarted, UtteranceEnded } from '../audit/auditEntry';

@Injectable()
export class SpeechService {
  protected synth;

  constructor(protected audit: AuditService) {
    if (window.speechSynthesis) {
      console.log('Speech synthesis detected');
      this.synth = window.speechSynthesis;
    } else {
      console.log('Speech synthesis API not supported');
    }
  }

  isSupported(): boolean {
    return this.synth ? true : false;
  }

  /**
   * Add an utterance to the underlying webspeech api
   * @param utterance
   */
  speak(utterance: string): void {
    const sayThis = new SpeechSynthesisUtterance(utterance);
    sayThis.onstart = (event) => {
      this.audit.addEntry(new UtteranceStarted({ utterance }));
    };
    sayThis.onend = (event) => {
      this.audit.addEntry(new UtteranceEnded({ utterance }));
    };
    this.synth.speak(sayThis);
  }
}
