import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit, AfterViewInit {
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

  public answer = '';
  private submitted = false;
  private timeout;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    console.log(`question.component: handleKeyboardEvent() called: key: ${event.key} keyCode: ${event.keyCode}`);
    const key = event.key;

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
      default:
        break;
    }
    // IMPORTANT: prevent firefox, IE etc. from navigating back a page.
    return false;
  }

  constructor() { }

  ngOnInit() {
  }

  /**
   * Start the timer when the view is ready.
   */
  ngAfterViewInit() {
    this.timeout = setTimeout(() => {
      this.sendTimeoutEvent();
    }, this.questionTimeoutSecs * 1000);
  }

  /**
   * Check a manual submission to see if it is allowed.
   * @return {boolean}
   */
  answerIsLongEnoughToManuallySubmit() {
    if (this.answer.length > 0) { return true; }
    return false;
  }

  /**
   * Called from clicking a number button on the virtual keypad
   * @param {number} number
   */
  onClickAnswer(number: number) {
    if (this.answer.length < 5) {
      this.addChar(number.toString());
    }
  }

  /**
   * Called from clicking the backspace button on the virtual keyboard
   */
  onClickBackspace() {
    if (this.answer.length > 0) {
      this.deleteChar();
    }
  }

  /**
   * Called from pressing Enter on the virtual Keypad or pressing the enter key on the keyboard
   * @return {boolean}
   */
  onSubmit() {
    if (this.submitted) {
      console.log('answer already submitted');
      return false;
    }
    if (!this.answerIsLongEnoughToManuallySubmit()) {
      console.log('answer not provided');
      return false;
    }
    // Prevent the default timeout from firing later
    if (this.timeout) {
      console.log(`Clearing timeout: ${this.timeout}`);
      clearTimeout(this.timeout);
    }
    console.log(`submitting answer ${this.answer}`);
    this.manualSubmitEvent.emit(this.answer);
    this.submitted = true;
    return true;
  }

  sendTimeoutEvent() {
    if (this.submitted) {
      console.log('sendTimeout(): answer already submitted');
      return false;
    }
    console.log(`question.component: sendTimeoutEvent(): ${this.answer}`);
    this.timeoutEvent.emit(this.answer);
    this.submitted = true;
  }

  /**
   * Add a character to the answer
   * @param {string} char
   */
  addChar(char: string) {
    console.log(`addChar() called with ${char}`);
    this.answer = this.answer.concat(char);
  }

  /**
   * Delete a character from the end of the answer
   */
  deleteChar() {
    this.answer = this.answer.substr(0, this.answer.length - 1);
  }

}
