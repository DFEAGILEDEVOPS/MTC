import { Component, OnInit, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { PracticeQuestionComponent } from '../practice-question/practice-question.component';
import { AuditService } from '../services/audit/audit.service';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { QuestionRendered } from '../services/audit/auditEntry';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent extends PracticeQuestionComponent implements OnInit, AfterViewInit, OnDestroy {

  /**
   * Do not show 'practice' label on top left.
   */
  public isWarmUpQuestion = false;

  constructor(protected auditService: AuditService,
              protected windowRefService: WindowRefService,
              protected registerInputService: RegisterInputService,
              protected questionService: QuestionService,
              protected speechService: SpeechService) {
    super(auditService, windowRefService, questionService, speechService);
    this.window = windowRefService.nativeWindow;
  }

  ngOnInit() {
    this.remainingTime = this.questionTimeoutSecs;

    // Add attributes to the <body> tag to reflect the current question
    const bodyTag = <Element>window.document[ 'body' ];
    bodyTag.setAttribute('data-sequence-number', this.sequenceNumber.toString());
    bodyTag.setAttribute('data-factor1', this.factor1.toString());
    bodyTag.setAttribute('data-factor2', this.factor2.toString());
  }

  /**
   * Start the timer when the view is ready.
   */
  ngAfterViewInit() {
    this.auditService.addEntry(new QuestionRendered({
      sequenceNumber: this.sequenceNumber,
      question: `${this.factor1}x${this.factor2}`
    }));
    // Start the countdown and page timeout timers
    this.startTimer();
  }

  ngOnDestroy() {
    // Remove attributes from the <body> tag to reflect the current lack of a question
    const bodyTag = <Element>window.document[ 'body' ];
    bodyTag.removeAttribute('data-sequence-number');
    bodyTag.removeAttribute('data-factor1');
    bodyTag.removeAttribute('data-factor2');
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
  handleTouchEvent(event) {
    this.registerInputService.addEntry(event);
  }

  /**
   * Handle key presses
   * @param {KeyboardEvent} event
   * @return {boolean}
   */
  @HostListener('document:keydown', [ '$event' ])
  handleKeyboardEvent(event: KeyboardEvent) {
    // console.log('practice-question.component: handleKeyboardEvent(): event: ', event);
    this.registerInputService.addEntry(event);
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

  /**
   * Called from clicking a number button on the virtual keypad
   * @param {number} number
   */
  onClickAnswer(number: number) {
    this.registerInputService.storeEntry(number.toString(), 'click', this.sequenceNumber, `${this.factor1}x${this.factor2}`);
    this.addChar(number.toString());
  }

  /**
   * Called from clicking the backspace button on the virtual keyboard
   */
  onClickBackspace() {
    this.registerInputService.storeEntry('Backspace', 'click', this.sequenceNumber, `${this.factor1}x${this.factor2}`);
    this.deleteChar();
  }

  /**
   * Called when the user clicks the enter button on the virtual keypad
   */
  onClickSubmit() {
    this.registerInputService.storeEntry('Enter', 'click', this.sequenceNumber, `${this.factor1}x${this.factor2}`);
    this.onSubmit();
  }
}
