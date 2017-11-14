import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, HostListener, NgZone} from '@angular/core';
import { AuditService } from '../services/audit/audit.service';
import { QuestionRendered, QuestionAnswered } from '../services/audit/auditEntry';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { SpeechService } from '../services/speech/speech.service';
import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { StorageKey } from '../services/storage/storage.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit, AfterViewInit {

  configAccessKey: StorageKey = 'config';

  @Input()
  public factor1 = 0;

  @Input()
  public factor2 = 0;

  @Input()
  public questionTimeoutSecs;

  @Output()
  manualSubmitEvent: EventEmitter<any> = new EventEmitter();

  @Output()
  timeoutEvent: EventEmitter<any> = new EventEmitter();

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
   * The time in ms since the epoch when the answer will be automatically submitted.
   * Used to calculate the remaining time counter.
   */
  private stopTime: number;

  /**
   * Flag to indicate that the answer has been submitted (either manually or on timeout)
   */
  private submitted = false;

  /**
   * Store the return value of setTimeout used to submit the answer.  The setTimeout() is cancelled
   * if the user manually submits the answer.
   */
  private timeout: number;

  /**
   * Store the return value of setInterval - so it can be cancelled
   */
  private countdownInterval: number;

  /**
   * Experimental: Flag to indicate whether we want speech synthesis
   */
  private hasSpeechSynthesis = false;

  /**
   * Reference to global window object
   */
  private window: any;


  constructor(private auditService: AuditService,
              private registerInputService: RegisterInputService,
              private speechService: SpeechService,
              private storageService: StorageService,
              private windowRefService: WindowRefService,
              private zone: NgZone) {
    this.window = windowRefService.nativeWindow;
  }


  /**
   * Track all mouse click activity
   */
  @HostListener('document:mousedown', [ '$event' ])
  handleMouseEvent(event: MouseEvent) {
    this.registerInputService.addEntry(event);
  }

  /**
   * Track all taps (touch events)
   * @param {TouchEvent} event
   */
  @HostListener('document:touchstart', [ '$event' ])
  handleTouchEvent(event: TouchEvent) {
    this.registerInputService.addEntry(event);
  }

  /**
   * Handle key presses
   * @param {KeyboardEvent} event
   * @return {boolean}
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // console.log('question.component: handleKeyboardEvent(): event: ', event);
    const key = event.key;
    // register inputs
    this.registerInputService.addEntry(event);
    switch (key) {
      case 'Backspace':
      case 'Delete':
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

  ngOnInit() {
    this.remainingTime = this.questionTimeoutSecs;
    const config = this.storageService.getItem(this.configAccessKey);
    this.hasSpeechSynthesis = !!(config && config.speechSynthesis);

    if (this.hasSpeechSynthesis) {
      this.speechService.speechStatus.subscribe(speechStatus => {
        this.zone.run(() => {
          if (speechStatus === SpeechService.speechEnded) {
            this.startTimer();
          }
        });
      });
    }
  }

  /**
   * Start the timer when the view is ready.
   */
  ngAfterViewInit() {
    this.auditService.addEntry(new QuestionRendered());

    if (this.hasSpeechSynthesis) {
      // For speech synth users the countdown starts after the question has been asked
      this.speechService.speak(`${this.factor1} times ${this.factor2}?`);
    } else {
      // Start the countdown when not using speech
      this.startTimer();
    }
  }

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
  answerIsLongEnoughToManuallySubmit() {
    return this.answer.length > 0;
  }

  /**
   * Called from clicking a number button on the virtual keypad
   * @param {number} number
   */
  onClickAnswer(number: number) {
    this.registerInputService.storeEntry(number.toString(), 'click');
    this.addChar(number.toString());
  }

  /**
   * Called from clicking the backspace button on the virtual keyboard
   */
  onClickBackspace() {
    this.registerInputService.storeEntry('backspace', 'click');
    this.deleteChar();
  }

  /**
   * Called when the user clicks the enter button on the virtual keypad
   */
  onClickSubmit() {
    this.registerInputService.storeEntry('enter', 'click');
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
    if (!this.answerIsLongEnoughToManuallySubmit()) {
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
    // Stop any speech
    if (this.hasSpeechSynthesis) {
      this.speechService.cancel();
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
    // console.log('sending timeout event');
    if (this.submitted) {
      // console.log('sendTimeout(): answer already submitted');
      return false;
    }
    // console.log(`question.component: sendTimeoutEvent(): ${this.answer}`);
    this.timeoutEvent.emit(this.answer);
    this.submitted = true;
  }

  /**
   * Add a character to the answer - up to a max of 5 which is all we can show
   * @param {string} char
   */
  addChar(char: string) {
    // console.log(`addChar() called with ${char}`);
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

}
