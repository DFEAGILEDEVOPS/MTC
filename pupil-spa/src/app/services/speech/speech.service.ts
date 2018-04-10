import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { AuditService } from '../audit/audit.service';
import { UtteranceStarted, UtteranceEnded } from '../audit/auditEntry';
import { WindowRefService } from '../window-ref/window-ref.service';

@Injectable()
export class SpeechService implements OnDestroy {
  public static readonly speechStarted = 'start';
  public static readonly speechEnded = 'end';
  public static readonly speechReset = 'clear';
  private speechStatusSource = new Subject<string>();
  protected synth;

  // Observable string stream
  speechStatus = this.speechStatusSource.asObservable();

  constructor(protected audit: AuditService, protected windowRefService: WindowRefService) {
    const _window = windowRefService.nativeWindow;
    if (_window.speechSynthesis) {
      console.log('Speech synthesis detected');
      this.synth = _window.speechSynthesis;
    } else {
      console.log('Speech synthesis API not supported');
    }
    this.announceSpeechReset();
  }

  protected announceSpeechStarted() {
    this.speechStatusSource.next(SpeechService.speechStarted);
  }

  protected announceSpeechEnded() {
    this.speechStatusSource.next(SpeechService.speechEnded);
  }

  protected announceSpeechReset() {
    this.speechStatusSource.next(SpeechService.speechReset);
  }

  isSupported(): boolean {
    return this.synth ? true : false;
  }

  /**
   * Add an utterance to the underlying webspeech api
   * @param utterance
   */
  speak(utterance: string): void {
    if (!this.isSupported()) {
      return;
    }
    this.cancel();
    const sayThis = new SpeechSynthesisUtterance(utterance);
    sayThis.onstart = (event) => {
      this.announceSpeechStarted();
      this.audit.addEntry(new UtteranceStarted({ utterance }));
    };
    sayThis.onend = (event) => {
      this.audit.addEntry(new UtteranceEnded({ utterance }));
      this.announceSpeechEnded();
      this.announceSpeechReset();
    };
    this.synth.speak(sayThis);
  }

  /**
   * Parse the source of a NativeElement and speak the text
   * @param nativeElement
   */
  speakElement(nativeElement): void {
    let speechText = '';

    // get all elements containing text from the current component
    let elements = nativeElement.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, p, button'
    );

    // add 'artificial' pauses to take visual newlines or spaces into account
    elements.forEach((elem) => (speechText += elem.textContent + ' , '));

    this.speak(speechText);
  }

  /**
   * Immediately stop speaking
   */
  cancel(): void {
    // console.log('SpeechAPI cancel() called');
    this.synth.cancel();
  }

  /**
   * Ensure that we don't carry on speaking if the app is unloaded
   */
  ngOnDestroy(): void {
    this.cancel();
  }
}
