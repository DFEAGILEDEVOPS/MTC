import { Component, OnInit, HostListener } from '@angular/core';

import { AnswerService } from '../services/answer/answer.service';
import { AuditService } from '../services/audit/audit.service';
import { AuditEntryFactory } from '../services/audit/auditEntry'
import { Config } from '../config.model';
import { Question } from '../services/question/question.model';
import { QuestionService } from '../services/question/question.service';
import { StorageService } from '../services/storage/storage.service';
import { WarmupQuestionService } from '../services/question/warmup-question.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { TimerService } from '../services/timer/timer.service';
import { Router } from '@angular/router';
import { CanExit } from '../routes/can-exit/can-exit.guard';
import { ApplicationInsightsService } from '../services/app-insights/app-insights.service';

@Component({
  selector: 'app-check',
  templateUrl: './check.component.html',
  styleUrls: [ './check.component.scss' ]
})
export class CheckComponent implements OnInit, CanExit {
  private static warmupIntroRe = /^warmup-intro$/;
  private static warmupLoadingRe = /^LW(\d+)$/;
  private static warmupQuestionRe = /^W(\d+)$/;
  private static spokenWarmupQuestionRe = /^SW(\d+)$/;
  private static warmupCompleteRe = /^warmup-complete$/;
  private static questionIntroRe = /^questions-intro$/;
  private static questionRe = /^Q(\d+)$/;
  private static spokenQuestionRe = /^SQ(\d+)$/;
  private static loadingRe = /^L(\d+)$/;
  private static submissionPendingRe = /^submission-pending$/;

  public config: Config;
  public isWarmUp: boolean;
  public familiarisationCheck: boolean;
  public question: Question;
  public state: number;
  public viewState: string;
  public allowedStates: Array<string> = [];
  public totalNumberOfQuestions: number;
  protected window: any;

  constructor(private questionService: QuestionService,
              private answerService: AnswerService,
              private timerService: TimerService,
              private warmupQuestionService: WarmupQuestionService,
              private auditService: AuditService,
              private storageService: StorageService,
              protected windowRefService: WindowRefService,
              private appInsightsService: ApplicationInsightsService,
              private router: Router,
              private auditEntryFactory: AuditEntryFactory) {
    this.window = windowRefService.nativeWindow;
  }

  /**
   * By default, disable the keyboard during the check.
   * Prevents many issues, increases control.
   * NB This also disables <tab> used for keyboard navigation.
   * @param {KeyboardEvent} event
   * @return {boolean}
   */
  @HostListener('document:keyup', [ '$event' ])
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
  handleTouchEndEvent(event: any) {
    event.preventDefault();
    event.target.dispatchEvent(new Event('click', { bubbles: true }));
    return false;
  }

  ngOnInit() {
    // console.log('check.component: ngOnInit() called');
    this.config = this.warmupQuestionService.getConfig();
    this.timerService.emitter.subscribe(e => {
      this.storageService.setTimeout({
        numQuestions: this.questionService.getNumberOfQuestions(),
        numCompleted: this.questionService.getCurrentQuestionNumber()
      });
      // stop the check timer on sign out, so it's reset for the next log-in
      this.timerService.stopCheckTimer();
      this.router.navigate(['/out-of-time']);
  });

    this.familiarisationCheck = this.config && this.config.practice;
    this.initStates();

    // Prevent the user going back a page
    history.pushState(null, null, location.href);
    window.onpopstate = function (event: Event) {
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

  canDeactivate(): boolean {
    return this.viewState === 'warmup-intro' || this.viewState === 'submission-pending' ||
      this.viewState === 'preload' || this.viewState === 'warmup-complete';
  }

  private loadExistingState() {
    // assume we are reloading during a check
    const existingState = this.storageService.getCheckState();
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
    return this.storageService.getCheckState();
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
    this.storageService.setCheckState(this.state);

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
        this.appInsightsService.trackPageView(
          `Practice loading ${parseInt(matches[ 1 ], 10)}`,
          `/practice-preload/${parseInt(matches[ 1 ], 10)}`
        );
        break;
      }
      case CheckComponent.warmupQuestionRe.test(stateDesc): {
        // Show the warmup question screen
        const matches = CheckComponent.warmupQuestionRe.exec(stateDesc);
        this.isWarmUp = true;
        // console.log(`state: ${stateDesc}: question is ${matches[ 1 ]}`);
        this.question = this.warmupQuestionService.getQuestion(parseInt(matches[ 1 ], 10));
        this.viewState = 'practice-question';
        this.appInsightsService.trackPageView(
          `Practice question ${parseInt(matches[ 1 ], 10)}`,
          `/practice-question/${parseInt(matches[ 1 ], 10)}`
        );
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
      case CheckComponent.warmupCompleteRe.test(stateDesc): {
        // Show the warmup complete screen
        this.isWarmUp = true;
        this.viewState = 'warmup-complete';
        this.appInsightsService.trackPageView(
          'Practice complete',
          '/practice-complete'
        );
        break;
      }
      case CheckComponent.questionIntroRe.test(stateDesc): {
        // Show the question-intro screen
        this.isWarmUp = false;
        this.viewState = 'questions-intro';
        this.totalNumberOfQuestions = this.questionService.getNumberOfQuestions();
        this.appInsightsService.trackPageView(
          'Questions intro',
          '/questions-intro'
        );
        break;
      }
      case CheckComponent.loadingRe.test(stateDesc): {
        this.timerService.startCheckTimer();
        // Show the loading screen
        this.isWarmUp = false;
        const matches = CheckComponent.loadingRe.exec(stateDesc);
        this.question = this.questionService.getQuestion(parseInt(matches[ 1 ], 10));
        this.viewState = 'preload';
        this.appInsightsService.trackPageView(
          `Question loading ${parseInt(matches[ 1 ], 10)}`,
          `/preload/${parseInt(matches[ 1 ], 10)}`
        );
        break;
      }
      case CheckComponent.questionRe.test(stateDesc): {
        // Show the question screen
        this.isWarmUp = false;
        const matches = CheckComponent.questionRe.exec(stateDesc);
        this.question = this.questionService.getQuestion(parseInt(matches[ 1 ], 10));
        this.viewState = 'question';
        this.appInsightsService.trackPageView(
          `Question ${parseInt(matches[ 1 ], 10)}`,
          `/question/${parseInt(matches[ 1 ], 10)}`
        );
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
        // Stop the check timer
        this.timerService.stopCheckTimer();
        // Display pending screen
        this.auditService.addEntry(this.auditEntryFactory.createCheckSubmissionPending());
        this.storageService.setPendingSubmission(true);
        this.isWarmUp = false;
        this.viewState = 'submission-pending';
        this.appInsightsService.trackPageView(
          'Submission pending',
          '/submission-pending'
        );
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
    this.changeState();
  }

  /**
   * Handle the timeout caused by the timer reaching zero.  We accept whatever answer is available.
   * @param {string} answer
   */
  questionTimeoutHandler(answer: string) {
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

  questionsIntroClickHandler() {
    this.changeState();
  }

  /**
   * Initialise the allowedStates array.
   * This is dynamic as it takes into account every question, whether warmup or real. The only allowed state
   * is the next state.
   */
  initStates(): void {
    this.allowedStates = [];

    // Set up the Warmup
    this.allowedStates.push('warmup-intro');
    for (let i = 0; i < this.warmupQuestionService.getNumberOfQuestions(); i++) {
      this.allowedStates.push(`LW${i + 1}`);
      if (this.config.questionReader) {
        this.allowedStates.push(`SW${i + 1}`);
      } else {
        this.allowedStates.push(`W${i + 1}`);
      }
    }
    this.allowedStates.push('warmup-complete');
    this.allowedStates.push('questions-intro');

    // Set up the Questions
    for (let i = 0; i < this.questionService.getNumberOfQuestions(); i++) {
      this.allowedStates.push(`L${i + 1}`);
      if (this.config.questionReader) {
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
    this.auditService.addEntry(this.auditEntryFactory.createRefreshDetected());

    // Let's say that handling reloads during the check should always show the current screen
    // in which case handling the reload whilst a question was being shown is a special case
    // where the state is incremented.
    if (CheckComponent.questionRe.test(stateDesc)) {
      // the page was reloaded when a question was shown
      // Store the answer as the empty string (as there was no input)
      // we need to initialise the current question, with the one from the current state
      const matches = CheckComponent.questionRe.exec(stateDesc);
      const questionNum = parseInt(matches[ 1 ], 10);
      this.question = this.questionService.getQuestion(questionNum);
      this.answerService.setAnswer(this.question.factor1, this.question.factor2, '', this.question.sequenceNumber);
      // console.log('refreshDetected(): calling changeState()');
      this.changeState();
    } else if (CheckComponent.spokenQuestionRe.test(stateDesc)) {
      // the page was reloaded when a question was shown
      // Store the answer as the empty string (as there was no input)
      // we need to initialise the current question, with the one from the current state
      const matches = CheckComponent.spokenQuestionRe.exec(stateDesc);
      const questionNum = parseInt(matches[ 1 ], 10);
      this.question = this.questionService.getQuestion(questionNum);
      this.answerService.setAnswer(this.question.factor1, this.question.factor2, '', this.question.sequenceNumber);
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

  isValidState(state: any) {
    if (!this.allowedStates[ state ]) {
      return false;
    }
    return true;
  }
}
