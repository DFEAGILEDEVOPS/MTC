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
  private speaking = false;
  private cancelTimeout;
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
   *
   * @param utterance
   * @param cancelBeforeSpeaking
   */
  async speak(utterance: string, cancelBeforeSpeaking: boolean = true): Promise<void> {
    if (!this.isSupported()) {
      return;
    }
    if (cancelBeforeSpeaking) {
      await this.cancel();
    }
    const sayThis = new SpeechSynthesisUtterance(utterance);
    sayThis.onstart = (event) => {
      this.speaking = true;
      this.announceSpeechStarted();
      this.audit.addEntry(new UtteranceStarted({ utterance }));
    };
    sayThis.onend = (event) => {
      this.speaking = false;
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
  async speakQuestion(utterance: string): Promise<void> {
    if (!this.isSupported()) {
      return;
    }
    await this.cancel();
    const sayThis = new SpeechSynthesisUtterance(utterance);
    sayThis.onstart = (event) => {
      this.speaking = true;
      this.announceQuestionSpeechStarted();
      this.audit.addEntry(new QuestionReadingStarted({ utterance }));
    };
    sayThis.onend = (event) => {
      this.speaking = false;
      this.audit.addEntry(new QuestionReadingEnded({ utterance }));
      this.announceQuestionSpeechEnded();
      this.announceSpeechReset();
    };
    this.synth.speak(sayThis);
  }

  /**
   * Add an single character utterance to the underlying webspeech api
   * Don't cancel speech, let it queue inside synth
   * @param utterance
   */
  speakChar(utterance: string): void {
    this.speak(utterance, false);
  }

  /**
   * Parse the source of a NativeElement and speak the text
   * @param nativeElement
   */
  speakElement(nativeElement): void {
    const elementsToSpeak = 'h1, h2, h3, h4, h5, h6, p, li, button, a, span';

    // clone the element in memory to make non-visible modifications
    const clonedElement = nativeElement.cloneNode(true);
    let speechText = '';

    // get all elements containing text from the current component
    const elements = clonedElement.querySelectorAll(elementsToSpeak);

    // add 'artificial' pauses to take visual newlines or spaces into account
    elements.forEach((elem) => {
      // remove all links and buttons inside the element to be spoken,
      // in order to avoid duplication
      elem.querySelectorAll('a, button').forEach(k => k.parentNode.removeChild(k));

      // if there is no text to be spoken, return early
      if (/\S/.test(elem.textContent) === false) {
        return;
      }

      speechText += ' , ' + this.addTextBeforeSpeakingElement(elem) + elem.textContent;
    });

    this.speak(speechText.replace(/[\n\r]+/g, ' '));
  }

  /**
   * Speak a specific, focused element
   */
  speakFocusedElement(nativeElement): void {
    const speechText = this.addTextBeforeSpeakingElement(nativeElement) + nativeElement.textContent;

    this.speak(speechText);
  }

  /**
   * Speak text before specific elements, return null
   * if nothing to add.
   * @param nativeElement
   */
  addTextBeforeSpeakingElement(nativeElement): string {
    if (nativeElement.tagName === 'BUTTON' || nativeElement.classList.contains('button')) {
      return 'Button: ';
    } else if (nativeElement.tagName === 'A') {
      return 'Link: ';
    } else {
      return '';
    }
  }

  /**
   * Immediately stop speaking, then return a promise that
   * waits a safe delay for browsers which do cancel asynchronously
   * so they can start speaking immediately.
   *
   * Delete previous timeout to ensure previous speech doesn't
   * happen if it's being cancelled here.
   */
  cancel(): any {
    // console.log('SpeechAPI cancel() called');
    const _window = this.windowRefService.nativeWindow;
    _window.clearTimeout(this.cancelTimeout);

    return new Promise((resolve, reject) => {
      this.synth.cancel();
      this.speaking = false;

      this.cancelTimeout = _window.setTimeout(() => {
        resolve();
      }, 300);
    });
  }

  /**
   * Waits for the end of pupils' input speech queue.
   * The input will be read out completely when the speechEnded event
   * is triggered and nothing is currently being spoken - although
   * the speechSynthesis implementations appear to have a race condition
   * when getting the speaking status so a small artificial delay
   * has to be introduced
   *
   * timeout is a workaround for the unstability of webspeech,
   * it uses an emulated .speaking property because utterances
   * can get randomly cancelled when ending at the same time
   * with another utterance
   */
  waitForEndOfSpeech(): Promise<any> {
    const _window = this.windowRefService.nativeWindow;
    return new Promise(resolve => {
      if (!this.isSpeaking() && !this.isPending()) {
        // if there is nothing in the queue, resolve() immediately
        resolve();
      } else {
        // wait for the last speechEnded event to resolve()
        let subscription, timeout;

        subscription = this.speechStatus.subscribe(speechStatus => {
          if (speechStatus === SpeechService.speechEnded) {
            _window.setTimeout(() => {
              if (!this.isSpeaking() && !this.isPending()) {
                subscription.unsubscribe();
                clearTimeout(timeout);
                resolve();
              }
            }, 500);
          }
        });

        // check for deadlocks after a longer delay of 3sec
        // and use the emulated .speaking property if needed
        timeout = _window.setTimeout(() => {
          if (!this.speaking || !this.synth.speaking) {
            resolve();
            subscription.unsubscribe();
          }
        }, 3000);
      }
    });
  }


  /**
   * Check if synth is still speaking utterances
   */
  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  /**
   * Check if synth still has pending speaking utterances
   */
  isPending(): boolean {
    return this.synth.pending;
  }

  /**
   * Ensure that we don't carry on speaking if the app is unloaded
   */
  ngOnDestroy(): void {
    this.cancel();
  }
}
