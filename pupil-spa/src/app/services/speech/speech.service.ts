import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { AuditService } from '../audit/audit.service';
import { UtteranceStarted, UtteranceEnded, QuestionReadingStarted, QuestionReadingEnded } from '../audit/auditEntry';
import { WindowRefService } from '../window-ref/window-ref.service';

@Injectable()
export class SpeechService implements OnDestroy {
  public static readonly speechStarted = 'start';
  public static readonly speechEnded = 'end';
  public static readonly speechReset = 'clear';
  public static readonly questionSpeechStarted = 'questionstart';
  public static readonly questionSpeechEnded = 'questionend';
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

  protected announceQuestionSpeechStarted() {
    this.speechStatusSource.next(SpeechService.questionSpeechStarted);
  }

  protected announceQuestionSpeechEnded() {
    this.speechStatusSource.next(SpeechService.questionSpeechEnded);
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
   * Add an question utterance to the underlying webspeech api
   * @param utterance
   */
  speakQuestion(utterance: string): void {
    if (!this.isSupported()) {
      return;
    }
    this.cancel();
    const sayThis = new SpeechSynthesisUtterance(utterance);
    sayThis.onstart = (event) => {
      this.announceQuestionSpeechStarted();
      this.audit.addEntry(new QuestionReadingStarted({ utterance }));
    };
    sayThis.onend = (event) => {
      this.audit.addEntry(new QuestionReadingEnded({ utterance }));
      this.announceQuestionSpeechEnded();
      this.announceSpeechReset();
    };
    this.synth.speak(sayThis);
  }

  /**
   * Parse the source of a NativeElement and speak the text
   * @param nativeElement
   */
  speakElement(nativeElement): void {
    // clone the element in memory to make non-visible modifications
    const clonedElement = nativeElement.cloneNode(true);
    let speechText = '';

    // get all elements containing text from the current component
    const elements = clonedElement.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, p, li, button'
    );

    // add 'artificial' pauses to take visual newlines or spaces into account
    elements.forEach((elem) => {
      elem.textContent += ' , ';

      // fix for <buttons> inside <p> getting added twice
      if (elem.tagName !== 'BUTTON' || (elem.parentNode !== null && elem.parentNode.tagName !== 'P')) {
        speechText += elem.textContent;
      }
    });

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
