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
  private userActionEvents = ['keydown', 'mousedown']; // touchstart should work as well in theory, doesn't in practice
  // Garbage Collector hack for Chrome implementations of the speech API..
  // See https://bugs.chromium.org/p/chromium/issues/detail?id=509488 for why this is necessary
  private utterancesGC = [];
  private focusTriggeredByCode = false; // to disable reading out focused elements when focused through code
  private focusInterruptedPageSpeech = false; // to disable changing focus at the end of speech when interrupted

  // Observable string stream
  speechStatus = this.speechStatusSource.asObservable();

  // Written like this instead of adding (this) binding to handle
  // inside the added eventlisteners
  private removeAutoplayRestrictions = () => {
    const _window = this.windowRefService.nativeWindow;

    // speak an empty string on the first useraction to remove 'restrictions'
    // on autoplay in the future, speech and audio
    this.speak('');

    for (let i = 0; i < this.userActionEvents.length; i++) {
      _window.removeEventListener(this.userActionEvents[i], this.removeAutoplayRestrictions);
    }
  }

  constructor(protected audit: AuditService, protected windowRefService: WindowRefService) {
    const _window = windowRefService.nativeWindow;
    if (_window.speechSynthesis) {
      console.log('Speech synthesis detected');
      this.synth = _window.speechSynthesis;

      // create events that speak a null string on the first user action
      // to avoid autoplay limitations on different devices
      for (let i = 0; i < this.userActionEvents.length; i++) {
        _window.addEventListener(this.userActionEvents[i], this.removeAutoplayRestrictions);
      }
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
  async speak(utterance: string, cancelBeforeSpeaking: boolean = true): Promise<{}> {
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

    this.utterancesGC.push(utterance);
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

    this.utterancesGC.push(utterance);
    this.synth.speak(sayThis);
  }

  /**
   * Add a utterance to the underlying webspeech api
   * Don't cancel speech, let it queue inside synth
   * @param utterance
   */
  speakQueued(utterance: string): void {
    this.speak(utterance, false);
  }

  /**
   * Removes aria-hidden child elements
   * @param nativeElement
   * @returns {clonedElement}
   */
  removeUnspokenElements(nativeElement): HTMLElement {
    // clone the element in memory to make non-visible modifications
    const clonedElement = nativeElement.cloneNode(true);

    // remove all elements that have the aria-hidden attribute completely before speaking
    const elementsToRemove = clonedElement.querySelectorAll('[aria-hidden="true"]');
    for (let i = 0; i < elementsToRemove.length; i++) {
      elementsToRemove[i].parentNode.removeChild(elementsToRemove[i]);
    }
    return clonedElement;
  }

  /**
   * Parse the source of a NativeElement and speak the text
   * @param nativeElement
   */
  speakElement(nativeElement): Promise<{}> {
    this.focusInterruptedPageSpeech = false;
    const elementsToSpeak = 'h1, h2, h3, h4, h5, h6, p, li, button, a, span, fieldset';

    const clonedElement = this.removeUnspokenElements(nativeElement);

    let speechText = '';

    // get all elements containing text from the current component
    const elements = clonedElement.querySelectorAll(elementsToSpeak);

    // add 'artificial' pauses to take visual newlines or spaces into account
    for (let i = 0; i < elements.length; i++) {
      // remove all links and buttons inside the element to be spoken,
      // in order to avoid duplication
      const elem = elements[i].querySelectorAll('a, button');
      for (let j = 0; j < elem.length; j++) {
        elem[j].parentNode.removeChild(elem[j]);
      }

      // if there is no text to be spoken, skip this element
      if (/\S/.test(elements[i].textContent) === false) {
        continue;
      }

      speechText += '\n' + this.addTextBeforeSpeakingElement(elements[i]) + elements[i].textContent;
    }

    return this.speak(speechText
                // remove empty lines
                .replace(/^\s+$/gm, '')
                // replace newlines with commas
                .replace(/[\n\r]+/g, ' , ')
                // Remove first leading comma
                .replace(/^\s*,\s*/g, ''));
  }

  /**
   * Speak a specific, focused element
   * @param nativeElement
   */
  speakFocusedElement(nativeElement): void {
    const { id, nodeName, parentNode } = nativeElement;

    let toSpeak = nativeElement.cloneNode(true);

    if (nodeName === 'INPUT' && id && parentNode) {
      // if there is a label for this input element
      toSpeak = parentNode.querySelector(`label[for="${id}"]`) || toSpeak;
    }

    const element = document.createElement('div');
    element.appendChild(toSpeak);
    this.speakElement(element);
  }

  /**
   * Focus this item after the page is being read out
   * @param nativeElement
   */
  focusEndOfSpeech(nativeElement): void {
    this.waitForEndOfSpeech().then(() => {
      if (this.focusInterruptedPageSpeech) {
        return;
      }
      this.focusTriggeredByCode = true;
      nativeElement.setAttribute('tabindex', '-1');
      nativeElement.focus();
      nativeElement.setAttribute('tabindex', '0');
      this.focusTriggeredByCode = false;
    });
  }

  /**
   * Call this function when an element is focused on the page
   * @param event
   */
  focusEventListenerHook(event): void {
    if (!this.focusTriggeredByCode) {
      this.speakFocusedElement(event.target);
      this.focusInterruptedPageSpeech = true;
    }
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
    } else if (nativeElement.tagName === 'LI') {
      const parent = nativeElement.parentNode;
      if (parent.tagName === 'OL') {
        const index = Array.prototype.indexOf.call(parent.children, nativeElement);
        return `${index + 1}: `;
      } else {
        return '';
      }
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
