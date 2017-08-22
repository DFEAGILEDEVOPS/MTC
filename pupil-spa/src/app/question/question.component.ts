import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { AuditService } from '../audit.service';
import { QuestionRendered, QuestionAnswered } from '../auditEntry';
import { RegisterInputService} from '../registerInput.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css'],
  providers: [RegisterInputService]

})
export class QuestionComponent implements OnInit, AfterViewInit {

  constructor(private auditService: AuditService, private registerInputService: RegisterInputService) {
  }

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
   * The user's answer made up of recorded numbers.  This is a string as the user may have leading zeros
   * which we want to store.
   * Used in the template.
   * @type {string}
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
   * @type {boolean}
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

  @HostListener('document:mousedown', [ '$event' ])
  handleMouseEvent(event: MouseEvent) {
    this.registerInputService.addEntry(event);
  }
  @HostListener('document:touchstart', [ '$event' ])
  handleTouchEvent(event: TouchEvent) {
    this.registerInputService.addEntry(event);
  }
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // console.log(`question.component: handleKeyboardEvent() called: key: ${event.key} keyCode: ${event.keyCode}`);
    const key = event.key;
    // register inputs
    this.registerInputService.addEntry(event);
    switch (event.keyCode) {
      case 8:  // backspace
      case 46: // delete
        this.deleteChar();
        break;
      case 13: // Enter
        this.onSubmit();
        break;
      case 48: // 0
      case 49: // 1
      case 50: // 2
      case 51: // 3
      case 52: // 4
      case 53: // 5
      case 54: // 6
      case 55: // 7
      case 56: // 8
      case 57: // 9
      case 96: // kp 0
      case 97: // kp 1
      case 98: // kp 2
      case 99: // kp 3
      case 100: // kp 4
      case 101: // kp 5
      case 102: // kp 6
      case 103: // kp 7
      case 104: // kp 8
      case 105: // kp 9
        this.addChar(key);
        break;
    }
    // IMPORTANT: prevent firefox, IE etc. from navigating back a page.
    return false;
  }

  ngOnInit() {
    this.stopTime = (new Date().getTime() + (this.questionTimeoutSecs * 1000));
    this.remainingTime = this.questionTimeoutSecs;
  }

  /**
   * Start the timer when the view is ready.
   */
  ngAfterViewInit() {
    this.auditService.addEntry(new QuestionRendered());
    this.timeout = window.setTimeout(() => {
      this.sendTimeoutEvent();
    }, this.questionTimeoutSecs * 1000);
    this.countdownInterval = window.setInterval(() => {
      let timeLeft = (this.stopTime - (new Date().getTime())) / 1000;
      if (timeLeft < 0 ) {
        clearInterval(this.countdownInterval);
        timeLeft = 0;
      }
      this.remainingTime = Math.ceil(timeLeft);
    }, 250);
  }

  /**
   * Check a manual submission to see if it is allowed.
   * @return {boolean}
   */
  answerIsLongEnoughToManuallySubmit() {
    if (this.answer.length > 0) {
      return true;
    }
    return false;
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
    // console.log(`submitting answer ${this.answer}`);
    this.registerInputService.storeEntry('enter', 'click');
    this.auditService.addEntry(new QuestionAnswered());
    this.manualSubmitEvent.emit(this.answer);
    this.submitted = true;
    return true;
  }

  sendTimeoutEvent() {
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
