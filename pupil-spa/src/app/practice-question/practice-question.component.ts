import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { AuditService } from '../services/audit/audit.service';
import { QuestionRendered, QuestionAnswered } from '../services/audit/auditEntry';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';

@Component({
  selector: 'app-practice-question',
  templateUrl: '../question/question.component.html',
  styleUrls: ['../question/question.component.css']
})
export class PracticeQuestionComponent implements OnInit, AfterViewInit {

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
  protected hasSpeechSynthesis = false;

  /**
   * Reference to global window object
   */
  protected window: any;

  /**
   * The users answer made up of recorded numbers.
   * This is a string as the user may have leading zeros which we want to store.
   * Used in the template.
   */
  public answer = '';

  /**
   * The remaining time in seconds until the answer is automatically submitted
   * Used in the template.
   */
  public remainingTime: number;

  /**
   * Show 'practice' label on top left.
   */
  public isWarmUpQuestion: boolean;

  @Input() public factor1 = 0;

  @Input() public factor2 = 0;

  /**
   * The practise question number
   * @type {number}
   */
  @Input() public sequenceNumber = 0;

  @Input() public questionTimeoutSecs;

  @Output() public manualSubmitEvent: EventEmitter<any> = new EventEmitter();

  @Output() public timeoutEvent: EventEmitter<any> = new EventEmitter();

  constructor(protected auditService: AuditService,
              protected windowRefService: WindowRefService,
              protected questionService: QuestionService,
              protected speechService: SpeechService) {
    this.window = windowRefService.nativeWindow;
  }

  ngOnInit() {
    this.remainingTime = this.questionTimeoutSecs;
    this.isWarmUpQuestion = true;
  }

  /**
   * Start the timer when the view is ready.
   */
  ngAfterViewInit() {
    this.auditService.addEntry(new QuestionRendered({
      practiseSequenceNumber: this.sequenceNumber,
      question: `${this.factor1}x${this.factor2}`
    }));
    // Start the countdown and page timeout timers
    this.startTimer();
  }

  /**
   * Start the countdown timer on the page and set the time-out counter
   */
  startTimer() {
    this.stopTime = (new Date().getTime() + (this.questionTimeoutSecs * 1000));

    // Set the amount of time the user can have on the question
    this.timeout = this.window.setTimeout(() => {
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
    }, 100);
  }

  /**
   * Check a manual submission to see if it is allowed.
   * @return {boolean}
   */
  hasAnswer() {
    return this.answer.length > 0;
  }

  /**
   * Called from clicking a number button on the virtual keypad
   * @param {number} number
   */
  onClickAnswer(number: number) {
    this.addChar(number.toString());
  }

  /**
   * Called from clicking the backspace button on the virtual keyboard
   */
  onClickBackspace() {
    this.deleteChar();
  }

  /**
   * Called when the user clicks the enter button on the virtual keypad
   */
  onClickSubmit() {
    this.onSubmit();
  }

  /**
   * Called from pressing Enter on the virtual Keypad or pressing the enter key on the keyboard
   * @return {boolean}
   */
  onSubmit() {
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
    }
    // Clear the interval timer
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    // console.log(`submitting answer ${this.answer}`);
    this.auditService.addEntry(new QuestionAnswered());
    this.manualSubmitEvent.emit(this.answer);
    this.submitted = true;
    return true;
  }

  /**
   * Send the collected answer back to the parent component when the timer has
   * timed out.  Send whatever answer has been collected so far.
   * @return {boolean}
   */
  sendTimeoutEvent() {
    // console.log('sendTimeoutEvent() called');
    if (this.submitted) {
      // console.log('sendTimeout(): answer already submitted');
      return false;
    }
    // console.log(`practice-question.component: sendTimeoutEvent(): ${this.answer}`);
    this.timeoutEvent.emit(this.answer);
    this.submitted = true;
  }

  /**
   * Add a character to the answer - up to a max of 5 which is all we can show
   * @param {string} char
   */
  addChar(char: string) {
    // console.log(`addChar() called with ${char}`);
    this.speechService.speak(char);

    if (this.answer.length < 5) {
      this.answer = this.answer.concat(char);
    }
  }

  /**
   * Delete a character from the end of the answer if there is one
   */
  deleteChar() {
    if (this.answer.length > 0) {
      this.answer = this.answer.substr(0, this.answer.length - 1);
    }
  }

  /**
   * Handle key presses
   * @param {KeyboardEvent} event
   * @return {boolean}
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // console.log('practice-question.component: handleKeyboardEvent(): event: ', event);
    const key = event.key;
    // register inputs
    switch (key) {
      case 'Backspace':
      case 'Delete':
      case 'Del':
        this.deleteChar();
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
}
