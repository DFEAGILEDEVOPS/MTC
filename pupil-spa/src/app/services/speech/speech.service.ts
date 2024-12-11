import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { AuditService } from '../audit/audit.service';
import { AuditEntryFactory } from '../audit/auditEntry'
import { WindowRefService } from '../window-ref/window-ref.service';

@Injectable()
export class SpeechService implements OnDestroy {
  public static readonly speechStarted = 'start';
  public static readonly speechEnded = 'end';
  public static readonly speechReset = 'clear';
  public static readonly questionSpeechStarted = 'questionstart';
  public static readonly questionSpeechEnded = 'questionend';
  private speaking = false;
  private cancelTimeout: number;
  private speechStatusSource = new Subject<string>();
  protected synth: { speak: (arg0: SpeechSynthesisUtterance) => void; cancel: () => void; speaking: boolean; pending: boolean; };
  private userActionEvents = ['keydown', 'mousedown']; // touchstart should work as well in theory, doesn't in practice
  // Garbage Collector hack for Chrome implementations of the speech API..
  // See https://bugs.chromium.org/p/chromium/issues/detail?id=509488 for why this is necessary
  private utterancesGC = new Array<string>();
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

  constructor(protected audit: AuditService,
              protected windowRefService: WindowRefService,
              protected auditEntryFactory: AuditEntryFactory) {
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
      this.audit.addEntry(this.auditEntryFactory.createUtteranceStarted());
    };
    sayThis.onend = (event) => {
      this.speaking = false;
      this.audit.addEntry(this.auditEntryFactory.createUtteranceEnded());
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
  async speakQuestion(utterance: string, sequenceNumber: number): Promise<void> {
    if (!this.isSupported()) {
      return;
    }
    await this.cancel();
    const sayThis = new SpeechSynthesisUtterance(utterance);
    sayThis.onstart = (event) => {
      this.speaking = true;
      this.announceQuestionSpeechStarted();
      this.audit.addEntry(this.auditEntryFactory.createQuestionReadingStarted({ sequenceNumber }));
    };
    sayThis.onend = (event) => {
      this.speaking = false;
      this.audit.addEntry(this.auditEntryFactory.createQuestionReadingEnded({ sequenceNumber }));
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
  removeUnspokenElements(nativeElement: any): HTMLElement {
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
  speakElement(nativeElement: any): Promise<{}> {
    this.focusInterruptedPageSpeech = false;
    const elementsToSpeak = 'h1, h2, h3, h4, h5, h6, p, li, div > span, div > button, div > input[type="submit"], div > a, div > label'
      + ', *[speak="true"]';

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
        const textNode = document.createTextNode(this.addTextBeforeSpeakingElement(elem[j]) + elem[j].textContent);
        elem[j].parentNode.replaceChild(textNode, elem[j]);
      }

      speechText += '\n' + this.addTextBeforeSpeakingElement(elements[i]) + elements[i].textContent;
    }

    speechText = speechText
                // remove empty lines
                .replace(/^\s+$/gm, '')
                // remove ending newlines
                .replace(/[\n\r]+$/g, '')
                // replace newlines with commas
                .replace(/[\n\r]+/g, ' , ')
                // Remove first leading comma
                .replace(/^\s*,\s*/g, '');

    return this.speak(speechText);
  }

  /**
   * Speak a specific, focused element
   * @param nativeElement
   */
  speakFocusedElement(nativeElement: any): void {
    const { id, nodeName, parentNode } = nativeElement;

    let toSpeak = nativeElement.cloneNode(true);

    if (nodeName === 'INPUT' && id && parentNode) {
      // if there is a label for this input element
      toSpeak = parentNode.querySelector(`label[for="${id}"]`).cloneNode(true) || toSpeak;
    }

    const element = document.createElement('div');
    element.appendChild(toSpeak);
    this.speakElement(element);
  }

  /**
   * Focus this item after the page is being read out
   * @param nativeElement
   */
  focusEndOfSpeech(nativeElement: any): void {
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
  focusEventListenerHook(event: Event): void {
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
  addTextBeforeSpeakingElement(nativeElement: any): string {
    if (nativeElement.tagName === 'INPUT' && nativeElement.type === 'submit') {
      return 'Button: ' + nativeElement.value;
    } else if (nativeElement.tagName === 'BUTTON' || nativeElement.classList.contains('button')) {
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
  cancel(): Promise<void> {
    // console.log('SpeechAPI cancel() called');
    const _window = this.windowRefService.nativeWindow;
    _window.clearTimeout(this.cancelTimeout);

    return new Promise((resolve, reject) => {
      this.synth?.cancel();
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
  waitForEndOfSpeech(): Promise<void> {
    const _window = this.windowRefService.nativeWindow;
    return new Promise((resolve: (value?: any) => void, reject: (reason?: any) => void) => {
      if (!this.isSpeaking() && !this.isPending()) {
        // if there is nothing in the queue, resolve() immediately
        resolve();
      } else {
        // wait for the last speechEnded event to resolve()
        let subscription: any, timeout: number;

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
  async ngOnDestroy(): Promise<void> {
    await this.cancel();
  }
}
