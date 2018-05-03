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
   * Chrome has problems with speaking immediately after .cancel()
   * and an 'artificial delay' is needed
   */
  synthSpeak(sayThis: SpeechSynthesisUtterance) {
    const _window = this.windowRefService.nativeWindow;
    _window.setTimeout(() => {
      this.synth.speak(sayThis);
    }, 500);
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
    this.synthSpeak(sayThis);
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
    this.synthSpeak(sayThis);
  }

  /**
   * Add an single character utterance to the underlying webspeech api
   * Don't cancel speech, let it queue inside synth
   * @param utterance
   */
  speakChar(utterance: string): void {
    if (!this.isSupported()) {
      return;
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
    this.synthSpeak(sayThis);
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
      'h1, h2, h3, h4, h5, h6, p, li, button, a, span'
    );

    // add 'artificial' pauses to take visual newlines or spaces into account
    elements.forEach((elem) => {
      // remove all links and buttons inside the element to be spoken,
      // in order to avoid duplication
      elem.querySelectorAll('a, button').forEach(k => k.parentNode.removeChild(k));

      // if there is no text to be spoken, return early
      if (/\S/.test(elem.textContent) === false) {
        return;
      }

      if (elem.tagName === 'BUTTON' || elem.classList.contains('button')) {
        speechText += ' , Button: ';
      } else if (elem.tagName === 'A') {
        speechText += ' , Link: ';
      } else {
        speechText += ' , ';
      }

      speechText += elem.textContent;
    });

    this.speak(speechText.replace(/[\n\r]+/g, ' '));
  }

  /**
   * Immediately stop speaking
   */
  cancel(): void {
    // console.log('SpeechAPI cancel() called');
    this.synth.cancel();
    this.speaking = false;
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
      if (!this.isSpeaking()) {
        // if there is nothing in the queue, resolve() immediately
        resolve();
      } else {
        // wait for the last speechEnded event to resolve()
        let subscription, timeout;

        subscription = this.speechStatus.subscribe(speechStatus => {
          if (speechStatus === SpeechService.speechEnded) {
            _window.setTimeout(() => {
              if (!this.isSpeaking()) {
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
