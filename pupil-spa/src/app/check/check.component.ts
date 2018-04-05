import { Component, OnInit, HostListener } from '@angular/core';

import { Answer } from '../services/answer/answer.model';
import { AnswerService } from '../services/answer/answer.service';
import { AuditService } from '../services/audit/audit.service';
import { CheckSubmissionPending, RefreshDetected } from '../services/audit/auditEntry';
import { Config } from '../config.model';
import { Question } from '../services/question/question.model';
import { QuestionService } from '../services/question/question.service';
import { StorageService } from '../services/storage/storage.service';
import { SubmissionService } from '../services/submission/submission.service';
import { WarmupQuestionService } from '../services/question/warmup-question.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';

@Component({
  selector: 'app-check',
  templateUrl: './check.component.html',
  styleUrls: [ './check.component.scss' ]
})

export class CheckComponent implements OnInit {
  public static readonly checkStateKey = 'checkstate';
  private static warmupIntroRe = /^warmup-intro$/;
  private static warmupLoadingRe = /^LW(\d+)$/;
  private static warmupQuestionRe = /^W(\d+)$/;
  private static spokenWarmupQuestionRe = /^SW(\d+)$/;
  private static warmupCompleteRe = /^warmup-complete$/;
  private static questionRe = /^Q(\d+)$/;
  private static spokenQuestionRe = /^SQ(\d+)$/;
  private static loadingRe = /^L(\d+)$/;
  private static submissionPendingRe = /^submission-pending$/;

  public config: Config;
  public isWarmUp: boolean;
  public question: Question;
  public state: number;
  public viewState: string;
  public allowedStates: Array<string> = [];
  public totalNumberOfQuestions: number;
  protected window: any;

  constructor(private questionService: QuestionService,
              private answerService: AnswerService,
              private submissionService: SubmissionService,
              private warmupQuestionService: WarmupQuestionService,
              private auditService: AuditService,
              private storageService: StorageService,
              protected windowRefService: WindowRefService) {
    this.window = windowRefService.nativeWindow;
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
   * Prevent double-tap on iPads from zooming in.
   * @return {boolean}
   */
  @HostListener('document:touchend', [ '$event' ])
  handleTouchEndEvent(event) {
    event.preventDefault();
    event.target.dispatchEvent(new Event('click', { bubbles: true }));
    return false;
  }

  ngOnInit() {
    // console.log('check.component: ngOnInit() called');
    this.config = this.warmupQuestionService.getConfig();

    this.initStates();

    // Prevent the user going back a page
    history.pushState(null, null, location.href);
    window.onpopstate = function (event) {
      history.go(1);
    };

    // set up the state
    if (this.hasExistingState()) {
      // console.log('Existing state detected: loading state')
      this.loadExistingState();
    } else {
      this.question = this.warmupQuestionService.getQuestion(1);
      this.state = 0;
      this.isWarmUp = true;
      this.viewState = 'warmup-intro';
      this.totalNumberOfQuestions = this.warmupQuestionService.getNumberOfQuestions();
    }
  }

  private loadExistingState() {
    // assume we are reloading during a check
    const existingState = this.storageService.getItem(CheckComponent.checkStateKey);
    // console.log(`loadExistingState: state is ${existingState}`)
    if (!this.isValidState(existingState)) {
      throw new Error(`Invalid state '${existingState}'`);
    }
    this.state = existingState;
    // console.log(`loadExistingState: state is ${this.state}`)
    this.isWarmUp = this.isWarmUpState();

    this.totalNumberOfQuestions = this.isWarmUp ?
      this.warmupQuestionService.getNumberOfQuestions() :
      this.questionService.getNumberOfQuestions();
    this.refreshDetected();
  }

  private hasExistingState() {
    return this.storageService.getItem(CheckComponent.checkStateKey);
  }

  /**
   * Change the state to the next allowed state.
   * As there is a linear sequence of events the next state is determined by the
   * current state. No args required.
   */
  private changeState() {
    // console.log(`check.component: changeState() called. Current state is ${this.state}`);
    this.state += 1; // increment state to next level - it's defined by an array
    // console.log(`changeState(): state is now set to ${this.state}`);
    this.storageService.setItem(CheckComponent.checkStateKey, this.state);

    const stateDesc = this.getStateDescription();
    // console.log(`check.component: changeState(): new state ${stateDesc}`);
    switch (true) {
      case CheckComponent.warmupIntroRe.test(stateDesc):
        // Show the warmup-intro screen
        this.isWarmUp = true;
        this.viewState = 'warmup-intro';
        break;
      case CheckComponent.warmupLoadingRe.test(stateDesc): {
        // Show the warmup-loading screen
        const matches = CheckComponent.warmupLoadingRe.exec(stateDesc);
        this.question = this.warmupQuestionService.getQuestion(parseInt(matches[ 1 ], 10));
        this.isWarmUp = true;
        this.viewState = 'warmup-preload';
        this.window.ga('send', {
          hitType: 'pageview',
          page: `/practice-preload/${parseInt(matches[ 1 ], 10)}`
        });
        break;
      }
      case CheckComponent.warmupQuestionRe.test(stateDesc): {
        // Show the warmup question screen
        const matches = CheckComponent.warmupQuestionRe.exec(stateDesc);
        this.isWarmUp = true;
        // console.log(`state: ${stateDesc}: question is ${matches[ 1 ]}`);
        this.question = this.warmupQuestionService.getQuestion(parseInt(matches[ 1 ], 10));
        this.viewState = 'practice-question';
        this.window.ga('send', {
          hitType: 'pageview',
          page: `/practice-question/${parseInt(matches[ 1 ], 10)}`
        });
        break;
      }
      case CheckComponent.spokenWarmupQuestionRe.test(stateDesc): {
        // Show the warmup question screen
        const matches = CheckComponent.spokenWarmupQuestionRe.exec(stateDesc);
        this.isWarmUp = true;
        // console.log(`state: ${stateDesc}: question is ${matches[ 1 ]}`);
        this.question = this.warmupQuestionService.getQuestion(parseInt(matches[ 1 ], 10));
        this.viewState = 'spoken-practice-question';
        break;
      }
      case CheckComponent.warmupCompleteRe.test(stateDesc):
        // Show the warmup complete screen
        this.isWarmUp = true;
        this.viewState = 'warmup-complete';
        this.totalNumberOfQuestions = this.questionService.getNumberOfQuestions();
        this.window.ga('send', {
          hitType: 'pageview',
          page: '/practice-complete'
        });
        break;
      case CheckComponent.loadingRe.test(stateDesc): {
        // Show the loading screen
        this.isWarmUp = false;
        const matches = CheckComponent.loadingRe.exec(stateDesc);
        this.question = this.questionService.getQuestion(parseInt(matches[ 1 ], 10));
        this.viewState = 'preload';
        this.window.ga('send', {
          hitType: 'pageview',
          page: `/preload/${parseInt(matches[ 1 ], 10)}`
        });
        break;
      }
      case CheckComponent.questionRe.test(stateDesc): {
        // Show the question screen
        this.isWarmUp = false;
        const matches = CheckComponent.questionRe.exec(stateDesc);
        this.question = this.questionService.getQuestion(parseInt(matches[ 1 ], 10));
        this.viewState = 'question';
        this.window.ga('send', {
          hitType: 'pageview',
          page: `/question/${parseInt(matches[ 1 ], 10)}`
        });
        break;
      }
      case CheckComponent.spokenQuestionRe.test(stateDesc): {
        // Show the question screen
        this.isWarmUp = false;
        const matches = CheckComponent.spokenQuestionRe.exec(stateDesc);
        this.question = this.questionService.getQuestion(parseInt(matches[ 1 ], 10));
        this.viewState = 'spoken-question';
        break;
      }
      case CheckComponent.submissionPendingRe.test(stateDesc): {
        // Display pending screen
        this.auditService.addEntry(new CheckSubmissionPending());
        this.storageService.setItem('pending_submission', true);
        this.isWarmUp = false;
        this.viewState = 'submission-pending';
        this.window.ga('send', {
          hitType: 'pageview',
          page: '/submission-pending'
        });
        break;
      }
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
    this.allowedStates = [];

    // Setup the Warmup
    this.allowedStates.push('warmup-intro');
    for (let i = 0; i < this.warmupQuestionService.getNumberOfQuestions(); i++) {
      this.allowedStates.push(`LW${i + 1}`);
      if (this.config.speechSynthesis) {
        this.allowedStates.push(`SW${i + 1}`);
      } else {
        this.allowedStates.push(`W${i + 1}`);
      }
    }
    this.allowedStates.push('warmup-complete');

    // Setup the Questions
    for (let i = 0; i < this.questionService.getNumberOfQuestions(); i++) {
      this.allowedStates.push(`L${i + 1}`);
      if (this.config.speechSynthesis) {
        this.allowedStates.push(`SQ${i + 1}`);
      } else {
        this.allowedStates.push(`Q${i + 1}`);
      }
    }

    // Set up the submission stage
    this.allowedStates.push('submission-pending');
    // console.log('check.component: initStates(): states set to: ', this.allowedStates);
  }

  /**
   * Handle a page refresh
   */
  refreshDetected() {
    const stateDesc = this.getStateDescription();
    console.log(`Refresh detected during state ${this.state} ${stateDesc}`);
    this.auditService.addEntry(new RefreshDetected());

    // Lets say that handling reloads during the check should always show the current screen
    // in which case handling the reload whilst a question was being shown is a special case
    // where the state is incremented.
    if (CheckComponent.questionRe.test(stateDesc)) {
      // the page was reloaded when a question was shown
      // Store the answer as the empty string (as there was no input)
      // we need to initialise the current question, with the one from the current state
      const matches = CheckComponent.questionRe.exec(stateDesc);
      const questionNum = parseInt(matches[ 1 ], 10);
      this.question = this.questionService.getQuestion(questionNum);
      const answer = new Answer(this.question.factor1, this.question.factor2, '');
      this.answerService.setAnswer(answer);
      // console.log('refreshDetected(): calling changeState()');
      this.changeState();
    } else if (CheckComponent.spokenQuestionRe.test(stateDesc)) {
      // the page was reloaded when a question was shown
      // Store the answer as the empty string (as there was no input)
      // we need to initialise the current question, with the one from the current state
      const matches = CheckComponent.spokenQuestionRe.exec(stateDesc);
      const questionNum = parseInt(matches[ 1 ], 10);
      this.question = this.questionService.getQuestion(questionNum);
      const answer = new Answer(this.question.factor1, this.question.factor2, '');
      this.answerService.setAnswer(answer);
      // console.log('refreshDetected(): calling changeState()');
      this.changeState();
    } else if (CheckComponent.warmupQuestionRe.test(stateDesc) || CheckComponent.spokenWarmupQuestionRe.test(stateDesc)) {
      this.changeState();
    } else {
      // trigger stateChange to move to the same state again
      this.state = this.getPreviousState();
      this.changeState();
    }
  }

  /**
   * Return a description of the current state
   * @return {string}
   */
  getStateDescription() {
    return this.allowedStates[ this.state ];
  }

  /**
   * Return the previous state to the current state
   * @return {number}
   */
  getPreviousState() {
    let newState = this.state - 1;
    if (newState < 0) {
      newState = 0;
    }
    return newState;
  }

  /**
   * Return true if the current state is in the warmup, false otherwise
   * @return {boolean}
   */
  isWarmUpState() {
    const stateDesc = this.getStateDescription();
    let isWarmUp = false;
    switch (true) {
      case CheckComponent.warmupQuestionRe.test(stateDesc):
      case CheckComponent.warmupLoadingRe.test(stateDesc):
      case CheckComponent.warmupIntroRe.test(stateDesc):
      case CheckComponent.warmupCompleteRe.test(stateDesc):
      case CheckComponent.spokenWarmupQuestionRe.test(stateDesc):
        isWarmUp = true;
        break;

      default:
        isWarmUp = false;
    }
    return isWarmUp;
  }

  isValidState(state) {
    if (!this.allowedStates[ state ]) {
      return false;
    }
    return true;
  }
}
