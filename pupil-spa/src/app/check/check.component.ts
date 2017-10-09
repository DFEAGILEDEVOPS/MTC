import { Component, OnInit, HostListener } from '@angular/core';

import { QuestionService } from '../services/question/question.service';
import { WarmupQuestionService } from '../services/question/warmup-question.service';
import { AnswerService } from '../services/answer/answer.service';
import { SubmissionService } from '../services/submission/submission.service';
import { RegisterInputService} from '../services/register-input/registerInput.service';
import { AuditService } from '../services/audit/audit.service';
import { CheckComplete, RefreshDetected } from '../services/audit/auditEntry';
import { Question } from '../services/question/question.model';
import { Config } from '../config.model';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-check',
  templateUrl: './check.component.html',
  styleUrls: [ './check.component.scss' ]
})

export class CheckComponent implements OnInit {

  public config: Config;
  public isWarmUp: boolean;
  public question: Question;
  public state: number;
  public viewState: string;
  public allowedStates: Array<string> = [];
  private totalNumberOfQuestions: number;
  public static readonly checkStateKey = 'checkstate';

  constructor(private questionService: QuestionService,
              private answerService: AnswerService,
              private submissionService: SubmissionService,
              private warmupQuestionService: WarmupQuestionService,
              private registerInputService: RegisterInputService,
              private auditService: AuditService,
              private storageService: StorageService) {
  }

  /**
   * By default disable the keyboard during the check.
   * Prevents many issues, increases control.
   * NB:// This also disables <tab> used for keyboard navigation.
   * @param {KeyboardEvent} event
   * @return {boolean}
   */
  @HostListener('document:keydown', [ '$event' ])
  handleKeyboardEvent(event: KeyboardEvent) {
    // console.log('check.component: handleKeyboardEvent(): key: ' + event.key);
    switch (event.key) {
      case 'Tab':
      case 'Enter':
        // Allow keyboard navigation for the warmup-intro, warmup-complete, and complete page using
        // tab end enter to click on buttons.
        return true;
    }
    event.preventDefault();
    return false;
  }

  /**
   * Prevent double-tap on ipads from zooming in.
   * @return {boolean}
   */
  @HostListener('document:touchend', [ '$event' ])
  handleTouchEndEvent(event: TouchEvent) {
    event.preventDefault();
    event.target.dispatchEvent(new Event('click', { bubbles: true }));
    return false;
  }

  ngOnInit() {
    this.question = this.warmupQuestionService.getQuestion(1);
    this.config = this.warmupQuestionService.getConfig();
    this.initStates();

    // Prevent the user going back a page
    history.pushState(null, null, location.href);
    window.onpopstate = function (event) {
      history.go(1);
    };

    // set up the state
    if (this.storageService.getItem(CheckComponent.checkStateKey)) {
      // existing check state detected
      // assume we are reloading during a check
      this.state = this.storageService.getItem(CheckComponent.checkStateKey)
      this.isWarmUp = this.isWarmUpState();
      this.totalNumberOfQuestions = this.isWarmUp ? this.warmupQuestionService.getNumberOfQuestions() : this.questionService.getNumberOfQuestions();
      this.refreshDetected()
    } else {
      this.state = 0;
      this.isWarmUp = true;
      this.viewState = 'warmup-intro';
      this.totalNumberOfQuestions = this.warmupQuestionService.getNumberOfQuestions();
    }

  }

  /**
   * Change the state to the next allowed state.
   * As there is a linear sequence of events the next state is determined by the
   * current state. No args required.
   */
  private changeState() {
    // console.log(`check.component: changeState() called. Current state is ${this.state}`);

    this.state += 1; // increment state to next level - it's defined by an array
    this.storageService.setItem(CheckComponent.checkStateKey, this.state);

    const stateDesc = this.getStateDescription()
    // console.log(`check.component: changeState(): new state ${stateDesc}`);
    switch (true) {
      case(/^warmup-intro$/).test(stateDesc):
        // Show the warmup-intro screen
        this.isWarmUp = true;
        this.viewState = 'warmup-intro';
        break;
      case(/^LW(\d+)$/).test(stateDesc): {
        // Show the warmup-loading screen
        const matches = /^LW(\d+)$/.exec(stateDesc);
        this.question = this.warmupQuestionService.getQuestion(parseInt(matches[ 1 ], 10));
        this.isWarmUp = true;
        this.viewState = 'preload';
        break;
      }
      case(/^W(\d+)$/).test(stateDesc): {
        // Show the warmup question screen
        const matches = /^W(\d+)$/.exec(stateDesc);
        this.isWarmUp = true;
        // console.log(`state: ${stateDesc}: question is ${matches[ 1 ]}`);
        this.question = this.warmupQuestionService.getQuestion(parseInt(matches[ 1 ], 10));
        this.viewState = 'question';
        break;
      }
      case(/^warmup-complete$/).test(stateDesc):
        // Show the warmup complete screen
        this.isWarmUp = true;
        this.viewState = 'warmup-complete';
        this.totalNumberOfQuestions = this.questionService.getNumberOfQuestions();
        break;
      case(/^L(\d+)$/).test(stateDesc): {
        // Show the loading screen
        this.isWarmUp = false;
        const matches = /^L(\d+)$/.exec(stateDesc);
        this.question = this.questionService.getQuestion(parseInt(matches[ 1 ], 10));
        this.viewState = 'preload';
        break;
      }
      case(/^Q(\d+)$/).test(stateDesc): {
        // Show the question screen
        this.isWarmUp = false;
        const matches = /^Q(\d+)$/.exec(stateDesc);
        this.registerInputService.flush();
        this.question = this.questionService.getQuestion(parseInt(matches[ 1 ], 10));
        this.registerInputService.initialise();
        this.viewState = 'question';
        break;
      }
      case(/^complete$/).test(stateDesc):
        // Show the check complete screen
        this.registerInputService.flush();
        this.auditService.addEntry(new CheckComplete());
        this.submissionService.submitData().catch(error => new Error(error));
        this.isWarmUp = false;
        this.viewState = 'complete';
        break;
    }
  }

  /**
   * The user has submitted the answer before the timer has reached zero.  They have to provide an answer
   * to submit early.
   * @param {string} answer
   */
  manualSubmitHandler(answer: string) {
    // console.log(`check.component: manualSubmitHandler(): ${answer}`);
    if (!this.isWarmUp) {
      const answerSet = { factor1: this.question.factor1, factor2: this.question.factor2, answer };
      this.answerService.setAnswer(answerSet);
    }
    this.changeState();
  }

  /**
   * Handle the timeout caused by the the timer reaching zero.  We accept whatever answer is available.
   * @param {string} answer
   */
  questionTimeoutHandler(answer: string) {
    // console.log(`check.component: questionTimeoutHandler(): called with ${answer}`);
    if (!this.isWarmUp) {
      const answerSet = { factor1: this.question.factor1, factor2: this.question.factor2, answer };
      this.answerService.setAnswer(answerSet);
    }
    this.changeState();
  }

  /**
   * Handle the loading page timeout
   */
  loadingTimeoutHandler() {
    // console.log(`check.component: loadingTimeoutHandler() called`);
    this.changeState();
  }

  /**
   * Handle the click event from the Warm-up instruction page. This click starts the first
   * warmup question loading page.
   */
  warmupIntroClickHandler() {
    // console.log('check.component: warmupIntroClickHandler() called');
    this.changeState();
  }

  /**
   * Handle the click event from the warmup complete page. This click starts the first
   * real question loading page.
   */
  warmupCompleteClickHandler() {
    // console.log('check.component: warmupCompleteClickHandler() called');
    this.changeState();
  }

  /**
   * Initialise the allowedStates array.
   * This is dynamic as it takes into account every question, whether warmup or real. The only allowed state
   * is the next state.
   */
  initStates(): void {
    // Setup the Warmup
    this.allowedStates.push('warmup-intro');
    for (let i = 0; i < this.warmupQuestionService.getNumberOfQuestions(); i++) {
      this.allowedStates.push(`LW${i + 1}`);
      this.allowedStates.push(`W${i + 1}`);
    }
    this.allowedStates.push('warmup-complete');

    // Setup the Questions
    for (let i = 0; i < this.questionService.getNumberOfQuestions(); i++) {
      this.allowedStates.push(`L${i + 1}`);
      this.allowedStates.push(`Q${i + 1}`);
    }

    // Set up the final page
    this.allowedStates.push('complete');
    // console.log('check.component: initStates(): states set to: ', this.allowedStates);
  }

  refreshDetected() {
    const stateDesc = this.getStateDescription()
    console.log(`Refresh detected during state ${this.state} ${stateDesc}`)
    this.auditService.addEntry(new RefreshDetected())

    // Lets say that handling reloads during the check should always show the current screen
    // in which case handling the reload whilst a question was being shown is a special case.
    if (/^Q(\d+)$/.test(stateDesc)) {
      // the page was reloaded when a question was shown
      console.log('Reload happened during a question')
      // make sure we store an answer
      this.changeState()
    } else if (/^W(\d+)$/.test(stateDesc)) {
      console.log('Reload happened during a warmup question')
      this.changeState()
    } else {
      // trigger stateChange to move to the same state again
      this.state = this.getPreviousState()
      this.changeState()
    }
  }

  getStateDescription() {
    return this.allowedStates[ this.state ]
  }

  getPreviousState() {
    let newState = this.state - 1;
    if (newState < 0) {
      newState = 0;
    }
    return newState;
  }

  isWarmUpState() {
    const stateDesc = this.getStateDescription();
    let isWarmUp = false;
    switch (true) {
      case /^W(\d+)$/.test(stateDesc):
      case /^LW(\d+)$/.test(stateDesc):
      case /^warmup-intro$/.test(stateDesc):
      case /^warmup-complete$/.test(stateDesc):
        isWarmUp = true;
      default:
        isWarmUp = false;
    }
    return isWarmUp;
  }
}
