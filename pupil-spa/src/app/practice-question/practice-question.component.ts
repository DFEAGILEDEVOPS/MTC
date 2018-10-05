import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, HostListener } from '@angular/core';

import { AuditService } from '../services/audit/audit.service';
import {
  QuestionRendered,
  QuestionAnswered,
  QuestionTimerStarted,
  QuestionTimerEnded,
  QuestionTimerCancelled
} from '../services/audit/auditEntry';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { SpeechService } from '../services/speech/speech.service';
import { StorageService } from '../services/storage/storage.service';
import { QuestionService } from '../services/question/question.service';
import { Config } from '../config.model';
import { AccessArrangements, accessArrangementsDataKey } from '../access-arrangements';

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
  @Input() public soundComponent;

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
              protected storageService: StorageService,
              protected speechService: SpeechService) {
    this.window = windowRefService.nativeWindow;
    this.config = this.questionService.getConfig();

    const accessArrangementsData = storageService.getItem(accessArrangementsDataKey);
    this.accessArrangements = new AccessArrangements;
    this.accessArrangements.fontSize = (accessArrangementsData && accessArrangementsData.fontSize) || 'default';
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
   * Hook that runs before the timeout event (sent when the timer reaches 0 seconds)
   */
  preSendTimeoutEvent() {
    this.soundComponent.playEndOfQuestionSound();
  }

  /**
   * Hook that is called each time the countdown timer is called.  Roughly every 100 ms.
   * @param remainingTime
   */
  countdownIntervalHook(remainingTime) {
    if (remainingTime === 2 && !this.hasAudibleAlertPlayed) {
      this.soundComponent.playTimeRunningOutAlertSound();
      this.hasAudibleAlertPlayed = true;
    }
  }

  /**
   * Start the countdown timer on the page and set the time-out counter
   */
  startTimer() {
    this.auditService.addEntry(new QuestionTimerStarted({
      sequenceNumber: this.sequenceNumber,
      question: `${this.factor1}x${this.factor2}`
    }));
    this.stopTime = (new Date().getTime() + (this.questionTimeoutSecs * 1000));

    // Set the amount of time the user can have on the question
    this.timeout = this.window.setTimeout(() => {
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
  hasAnswer() {
    return this.answer.length > 0;
  }

  /**
   * Check if there was an input to the question.
   * @return {boolean}
   */
  hasStartedAnswering() {
    return this.startedAnswering;
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
    } else {
      // timeout didn't start so nothing to submit
      return false;
    }

    // Clear the interval timer
    if (this.countdownInterval) {
      this.auditService.addEntry(new QuestionTimerCancelled({
        sequenceNumber: this.sequenceNumber,
        question: `${this.factor1}x${this.factor2}`
      }));
      clearInterval(this.countdownInterval);
    }

    this.addQuestionAnsweredEvent();
    this.submitted = true;
    if (this.config.speechSynthesis) {
      this.speechService.waitForEndOfSpeech().then(() => {
        this.manualSubmitEvent.emit(this.answer);
      });
    } else {
      this.manualSubmitEvent.emit(this.answer);
    }
    return true;
  }

  addQuestionAnsweredEvent() {
    this.auditService.addEntry(new QuestionAnswered({
      practiseSequenceNumber: this.sequenceNumber,
      question: `${this.factor1}x${this.factor2}`
    }));
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
    this.auditService.addEntry(new QuestionTimerEnded({
      sequenceNumber: this.sequenceNumber,
      question: `${this.factor1}x${this.factor2}`
    }));
    this.submitted = true;
    if (this.config.speechSynthesis) {
      this.speechService.waitForEndOfSpeech().then(() => {
        this.timeoutEvent.emit(this.answer);
      });
    } else {
      this.timeoutEvent.emit(this.answer);
    }
  }

  /**
   * Add a character to the answer - up to a max of 5 which is all we can show
   * @param {string} char
   */
  addChar(char: string) {
    if (this.submitted) {
        return;
    }
    this.startedAnswering = true;
    // console.log(`addChar() called with ${char}`);
    if (this.answer.length < 5) {
      if (this.config.speechSynthesis) {
        // if user input interrupts the question being read out, start the timer
        if (!this.timeout) {
          this.startTimer();
        }
        this.speechService.speakChar(char);
      }

      this.answer = this.answer.concat(char);
    }
  }

  /**
   * Delete a character from the end of the answer if there is one
   * Return early and do nothing if the timer is up
   */
  deleteChar() {
    if (this.submitted) {
      return;
    }

    if (this.answer.length > 0) {
      this.answer = this.answer.substr(0, this.answer.length - 1);
    }
  }

  /**
   * Repeat the question for webspeech users when pressing tab
   * Return early and do nothing if the user already started answering
   * or the user doesn't have the speech flag on.
   */
  repeatQuestion() {
    if (this.hasStartedAnswering()) {
      return;
    }
    if (!this.questionService.getConfig().speechSynthesis) {
      return;
    }

    this.speechService.speakQuestion(this.factor1 + ' times ' + this.factor2);
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
}
