import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  OnDestroy,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';

import { AccessArrangements } from '../access-arrangements';
import { AnswerService } from '../services/answer/answer.service';
import { AuditService } from '../services/audit/audit.service';
import { Config } from '../config.model';
import { AuditEntryFactory } from '../services/audit/auditEntry'
import { QuestionService } from '../services/question/question.service';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { SpeechService } from '../services/speech/speech.service';
import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';

export enum EventType {
  'mouse'= 'mouse',
  'pen' = 'pen',
  'touch' = 'touch',
  'keyboard' = 'keyboard',
  'unknown' = 'unknown'
}

@Component({
  selector: 'app-practice-question',
  templateUrl: '../question/question.component.html',
  styleUrls: ['../question/question.component.css']
})
export class PracticeQuestionComponent implements OnInit, AfterViewInit, OnDestroy {

  /**
   * The time in ms since the epoch when the answer will be automatically submitted.
   * Used to calculate the remaining time counter.
   */
  protected stopTime: number;

  /**
   * Flag to indicate that the answer has been submitted (either manually or on timeout)
   */
  protected submitted = false;

  /**
   * Store the return value of setTimeout used to submit the answer.  The setTimeout() is cancelled
   * if the user manually submits the answer.
   */
  protected timeout: number;

  /**
   * Store the return value of setInterval - so it can be cancelled
   */
  protected countdownInterval: number;

  /**
   * Experimental: Flag to indicate whether we want speech synthesis
   */
  protected hasQuestionReader = false;

  /**
   * Reference to global window object
   */
  protected window: any;

  /**
   * Array of functions to run as cleanup for the onDestroy
   */
  public cleanUpFunctions: Array<() => void> = [];

  /**
   * Set a reference to the config.
   * Contains access arrangements flags
   */
  public config: Config;

  /**
   * Set a reference to the access arrangements settings for a user.
   */
  protected accessArrangements: AccessArrangements;

  /**
   * The users answer made up of recorded numbers.
   * This is a string as the user may have leading zeros which we want to store.
   * Used in the template.
   */
  public answer = '';

  /**
   * Flag to indicate that there was an input to the question
   */
  protected startedAnswering = false;

  /**
   * The remaining time in seconds until the answer is automatically submitted
   * Used in the template.
   */
  public remainingTime: number;

  /**
   * Show 'practice' label on top left.
   */
  public isWarmUpQuestion: boolean;

  /**
   * Set to true after the audible alert has played to indicate the end of the question time is near.
   * @type {boolean}
   */
  private hasAudibleAlertPlayed = false;

  /**
   * Reference to the Sound component
   */
  @Input() public soundComponent: any;

  public shouldShowQuestion: boolean;

  @Input() public factor1 = 0;

  @Input() public factor2 = 0;

  /**
   * The practise question number
   * @type {number}
   */
  @Input() public sequenceNumber = 0;

  @Input() public questionTimeoutSecs: number;

  @Output() public manualSubmitEvent: EventEmitter<any> = new EventEmitter();

  @Output() public timeoutEvent: EventEmitter<any> = new EventEmitter();

  @Input() public familiarisationCheck = false;

  @ViewChild('kb0', { static: false }) button0: ElementRef;
  @ViewChild('kb1', { static: false }) button1: ElementRef;
  @ViewChild('kb2', { static: false }) button2: ElementRef;
  @ViewChild('kb3', { static: false }) button3: ElementRef;
  @ViewChild('kb4', { static: false }) button4: ElementRef;
  @ViewChild('kb5', { static: false }) button5: ElementRef;
  @ViewChild('kb6', { static: false }) button6: ElementRef;
  @ViewChild('kb7', { static: false }) button7: ElementRef;
  @ViewChild('kb8', { static: false }) button8: ElementRef;
  @ViewChild('kb9', { static: false }) button9: ElementRef;
  @ViewChild('kbEnter', { static: false }) buttonEnter: ElementRef;
  @ViewChild('kbBackspace', { static: false }) buttonBackspace: ElementRef;

  constructor (protected auditService: AuditService,
               protected windowRefService: WindowRefService,
               protected questionService: QuestionService,
               protected storageService: StorageService,
               protected speechService: SpeechService,
               protected answerService: AnswerService,
               protected registerInputService: RegisterInputService,
               protected renderer: Renderer2,
               protected auditEntryFactory: AuditEntryFactory) {
    this.window = windowRefService.nativeWindow;
    this.config = this.questionService.getConfig();
    const accessArrangementsData = storageService.getAccessArrangements();
    this.accessArrangements = new AccessArrangements;
    this.accessArrangements.fontSize = (accessArrangementsData && accessArrangementsData.fontSize) || 'regular';
    this.shouldShowQuestion = true;
  }

  ngOnInit () {
    this.remainingTime = this.questionTimeoutSecs;
    this.isWarmUpQuestion = true;
  }

  /**
   * Start the timer when the view is ready.
   */
  shouldSetupPointerEvents(): boolean {
    return 'onpointerup' in this.window;
  }

  ngAfterViewInit () {
    const data = {
      sequenceNumber: this.sequenceNumber,
      question: `${this.factor1}x${this.factor2}`,
      isWarmup: this.isWarmUpQuestion
    }
    this.auditService.addEntry(this.auditEntryFactory.createQuestionRendered(data));

    // Set up listening events depending on the browser's capability
    if (this.shouldSetupPointerEvents()) {
      this.setupKeypadEventListeners('pointerup');
    } else {
      this.setupKeypadEventListeners('click');
    }

    // Start the countdown and page timeout timers
    this.startTimer();
  }

  setupKeypadEventListeners (eventToListenTo: string) {


    // On-screen Keypad buttons 0-9
    [this.button0, this.button1, this.button2, this.button3, this.button4, this.button5, this.button6, this.button7, this.button8,
      this.button9].forEach(button => {
        // The keypad is not always rendered, e.g. due to the access arrangement that removes the keypad
        if (button === undefined) {
          return
        }
        const f = this.renderer.listen(button.nativeElement, eventToListenTo, (event) => {
          this.clickHandler(event)
        })
        this.cleanUpFunctions.push(f)
      }
    )

    // On-screen Keypad Enter button should submit the answer
    if (this.buttonEnter) {
      const removeEnterListenerFunc = this.renderer.listen(this.buttonEnter.nativeElement, eventToListenTo, (event) => {
        this.onClickSubmit(event);
      });
      this.cleanUpFunctions.push(removeEnterListenerFunc);
    }

    // On-screen Keypad Backspace button should delete a char
    if (this.buttonBackspace) {
      const removeBackspaceListenerFunc = this.renderer.listen(this.buttonBackspace.nativeElement, eventToListenTo, (event) => {
        this.onClickBackspace(event);
      });
      this.cleanUpFunctions.push(removeBackspaceListenerFunc);
    }
  }

  ngOnDestroy () {
    // clear both timeout and intervals
    if (this.countdownInterval !== undefined) {
      clearInterval( this.countdownInterval )
    }
    if (this.timeout !== undefined) {
      clearTimeout( this.timeout )
    }

    // remove all the event listeners
    if (this.cleanUpFunctions.length > 0) {
      this.cleanUpFunctions.forEach(f => f());
    }
  }

  /**
   * Hook that is called each time the countdown timer is called.  Roughly every 100 ms.
   * @param remainingTime
   */
  countdownIntervalHook (remainingTime: number) {
    if (remainingTime === 2 && !this.hasAudibleAlertPlayed) {
      this.soundComponent.playTimeRunningOutAlertSound();
      this.hasAudibleAlertPlayed = true;
    }
  }

  /**
   * Start the countdown timer on the page and set the time-out counter
   */
  startTimer () {
    const data = {
      sequenceNumber: this.sequenceNumber,
      question: `${this.factor1}x${this.factor2}`,
      isWarmup: this.isWarmUpQuestion
    }
    this.auditService.addEntry(this.auditEntryFactory.createQuestionTimerStarted(data));
    this.stopTime = (new Date().getTime() + (this.questionTimeoutSecs * 1000));

    // Set the amount of time the user can have on the question
    this.timeout = this.window.setTimeout(async () => {
      this.preSendTimeoutEvent();
      this.sendTimeoutEvent();
    }, this.questionTimeoutSecs * 1000);

    // Set the countdown timer on the page
    this.countdownInterval = this.window.setInterval(() => {
      let timeLeft = (this.stopTime - (new Date().getTime())) / 1000;
      if (timeLeft < 0) {
        clearInterval(this.countdownInterval);
        timeLeft = 0;
      }
      this.remainingTime = Math.ceil(timeLeft);
      this.countdownIntervalHook(this.remainingTime);
    }, 100);
  }

  /**
   * Check a manual submission to see if it is allowed.
   * @return {boolean}
   */
  hasAnswer () {
    return this.answer.length > 0;
  }

  /**
   * Check if there was an input to the question.
   * @return {boolean}
   */
  hasStartedAnswering () {
    return this.startedAnswering;
  }

  /**
   * Called by clicks or touches on the on-screen number pad
   * @param event
   * @param {Event} event
   */
  clickHandler(event: Event): void {
    if (this.submitted) return

    const target = event.target as HTMLElement
    const value = target.id === ''
      ? target.parentElement?.dataset.value
      : (target as HTMLElement & { dataset: DOMStringMap }).dataset.value

    if (!value) return

    this.addChar(value)

    if (!this.isWarmUpQuestion) {
      this.registerInputService.storeEntry(
        value,
        this.getEventType(event),
        this.sequenceNumber,
        `${this.factor1}x${this.factor2}`,
        event.timeStamp
      )
    }
  }

  /**
   * Called from clicking the backspace button on the virtual keyboard
   * @param {Object} event
   */
  onClickBackspace (event: Event) { // eslint-disable-line @typescript-eslint/no-unused-vars
    this.deleteChar()
  }

  /**
   * Called when the user clicks the enter button on the virtual keypad
   * @param {Object} event
   */
  onClickSubmit (event: Event) { // eslint-disable-line @typescript-eslint/no-unused-vars
    this.onSubmit()
  }

  /**
   * Called from pressing Enter on the virtual Keypad or pressing the enter key on the keyboard
   * @return {boolean}
   */
  onSubmit () {
    if (this.submitted) {
      // console.log('answer already submitted');
      return false;
    }
    if (!this.hasAnswer()) {
      // console.log('answer not provided');
      return false;
    }
    // Prevent the default timeout from firing later
    if (this.timeout) {
      // console.log(`Clearing timeout: ${this.timeout}`);
      clearTimeout(this.timeout);
      this.timeout = undefined;
    } else {
      // timeout didn't start so nothing to submit
      // console.log('timeout not available, returning false');
      return false;
    }

    // Clear the interval timer
    if (this.countdownInterval) {
      const data = {
        sequenceNumber: this.sequenceNumber,
        question: `${this.factor1}x${this.factor2}`,
        isWarmup: this.isWarmUpQuestion
      }
      this.auditService.addEntry(this.auditEntryFactory.createQuestionTimerCancelled(data));
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }

    this.addQuestionAnsweredEvent();
    this.submitted = true;
    if (this.config.questionReader) {
      this.speechService.waitForEndOfSpeech().then(() => {
        this.manualSubmitEvent.emit(this.answer);
      });
    } else {
      this.manualSubmitEvent.emit(this.answer);
    }
    return true;
  }

  addQuestionAnsweredEvent () {
    const data = {
        sequenceNumber: this.sequenceNumber,
        question: `${this.factor1}x${this.factor2}`,
        isWarmup: this.isWarmUpQuestion
    }
    this.auditService.addEntry(this.auditEntryFactory.createQuestionAnswered(data))
  }

  /**
   * Hook that runs before the timeout event (sent when the timer reaches 0 seconds)
   */
  async preSendTimeoutEvent () {
    if (!this.isWarmUpQuestion) {
      this.answerService.setAnswer(this.factor1, this.factor2, this.answer, this.sequenceNumber);
    }

    if (this.config.questionReader) {
      await this.speechService.waitForEndOfSpeech();
    }

    // This checks the config itself
    this.soundComponent.playEndOfQuestionSound();
  }

  /**
   * Send the collected answer back to the parent component when the timer has
   * timed out.  Send whatever answer has been collected so far.
   * @return {boolean}
   */
  async sendTimeoutEvent () {
    if (this.submitted) {
      return false;
    }
    const data = {
      sequenceNumber: this.sequenceNumber,
      question: `${this.factor1}x${this.factor2}`,
      isWarmup: this.isWarmUpQuestion
    }
    this.auditService.addEntry(this.auditEntryFactory.createQuestionTimerEnded(data));

    this.submitted = true;
    if (this.config.questionReader) {
      await this.speechService.waitForEndOfSpeech();

      if (this.config.audibleSounds) {
        // artificial 0.5s pause to allow the sound component time to play
        // otherwise it will overlap with the next section speech
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    this.timeoutEvent.emit(this.answer);
  }

  /**
   * Add a character to the answer - up to a max of 5 which is all we can show
   * @param {string} char
   */
  addChar (char: string) {
    if (this.submitted) {
      return;
    }
    this.startedAnswering = true;
    if (this.answer.length < 5) {
      if (this.config.questionReader) {
        // if user input interrupts the question being read out, start the timer
        if (!this.timeout) {
          this.startTimer();
          this.shouldShowQuestion = true;
        }
        this.speechService.speakQueued(char);
      }

      this.answer = this.answer.concat(char);
    }
  }

  /**
   * Delete a character from the end of the answer if there is one
   * Return early and do nothing if the timer is up
   */
  deleteChar () {
    if (this.submitted) {
      return;
    }

    if (this.answer.length > 0) {
      if (this.config.questionReader) {
        this.speechService.speakQueued('Delete ' + this.answer[this.answer.length - 1]);
      }
      this.answer = this.answer.substring(0, this.answer.length - 1);
    }
  }

  /**
   * Repeat the question for webspeech users when pressing tab
   * Return early and do nothing if the user already started answering
   * or the user doesn't have the speech flag on.
   */
  repeatQuestion () {
    if (this.hasStartedAnswering()) {
      return;
    }
    if (!this.config.questionReader) {
      return;
    }
    this.speechService.speakQuestion(this.factor1 + ' times ' + this.factor2, this.sequenceNumber);
  }

  /**
   * Handle key presses
   * @param {KeyboardEvent} event
   * @return {boolean}
   */
  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent (event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (this.submitted) {
      return false;
    }
    if (!this.isWarmUpQuestion) {
      this.registerInputService.storeEntry(event.key,
        this.getEventType(event),
        this.sequenceNumber,
        `${this.factor1}x${this.factor2}`,
        event.timeStamp
      );
    }
    const key = event.key;
    // register inputs
    switch (key) {
      case 'Backspace':
      case 'Delete':
      case 'Del':
        this.deleteChar();
        break;
      case 'Tab':
        this.repeatQuestion();
        break;
      case 'Enter':
        this.onSubmit();
        break;
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        this.addChar(key);
        break;
    }
    // IMPORTANT: prevent firefox, IE etc. from navigating back a page.
    return false;
  }

  whatClass (obj: any) {
    return obj.toString().match(/ (\w+)/)[1];
  }

  getEventType (event: Event | MouseEvent | TouchEvent | KeyboardEvent | PointerEvent): EventType {
    if ('pointerType' in event) {
      // event.pointerType will be: mouse, pen, touch, '' (if can't determine), or vendor prefixed
      // https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent
      switch (event.pointerType) {
        case 'mouse':
          return EventType.mouse;
        case 'touch':
          return EventType.touch;
        case 'pen':
          return EventType.pen;
        default:
          return EventType.unknown;
      }
    }

    // Not a Pointer Event - should be MouseEvent [or TouchEvent] but Safari (macOS) does not support TouchEvent
    if (event instanceof MouseEvent) {
      return EventType.mouse;
    } else if (event instanceof KeyboardEvent) {
      return EventType.keyboard;
    }

    // Detect TouchEvents without relying on the TouchEvent class being present (because of Safari)
    const eventClass = this.whatClass(event);
    if (eventClass === 'TouchEvent') {
      return EventType.touch;
    }

    // If we get here we just have an Event class - which almost certainly means an older browser
    // using a touch event, as mouse clicks in Angular (using the click event listener) generate MouseEvents,
    // but touch events generate plain Events rather than the usual TouchEvents.  This only happens in Angular, and not normal DOMs.
    // Android and Windows both support PointerEvents, and have for a long time. So this remaining section mainly applies to older iOS and
    // macOS devices and Kindle Fires.  macOS doesn't support TouchEvents at least up to 10.15, and iOS devices are much more likely to be
    // touch than not.
    if ('ontouchstart' in this.window) {
      return EventType.touch;
    }
    return EventType.mouse;
  }
}
