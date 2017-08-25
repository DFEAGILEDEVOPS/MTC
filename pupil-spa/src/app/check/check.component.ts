import { Component, OnInit, HostListener } from '@angular/core';

import { QuestionService } from '../services/question/question.service';
import { AnswerService } from '../services/answer/answer.service';
import { SubmissionService } from '../services/submission/submission.service';
import { Question } from '../services/question/question.model';
import { Config } from '../config.model';

@Component({
  selector: 'app-check',
  templateUrl: './check.component.html',
  styleUrls: [ './check.component.scss' ]
})

export class CheckComponent implements OnInit {

  public viewState: string;
  public questionNumber: number;
  public totalNumberOfQuestions: number;
  public question: Question;
  public config: Config;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    console.log(`check-complete.component: handleKeyboardEvent() called: key: ${event.key} keyCode: ${event.keyCode}`);
    // IMPORTANT: return false here
    event.preventDefault();
    return false;
  }


  constructor(private questionService: QuestionService, private answerService: AnswerService, private submissionService: SubmissionService) {
    this.questionNumber = 1;
    this.totalNumberOfQuestions = this.questionService.getNumberOfQuestions();
    this.question = this.questionService.getQuestion(this.questionNumber);
    this.config = this.questionService.getConfig();
  }

  @HostListener('document:touchend', [ '$event' ])
  handleTouchEndEvent() {
    // IMPORTANT: Prevent double-tap zoom on Ipad
    event.preventDefault();
    event.target.dispatchEvent(new Event('click'));
    return false;
  }

  ngOnInit() {
    this.viewState = 'preload';
    // Prevent the user going back a page
    history.pushState(null, null, location.href);
    window.onpopstate = function(event) {
      history.go(1);
    };
  }

  manualSubmitHandler(answer: string) {
    // console.log(`check.component: manualSubmitHandler(): ${answer}`);
    const answerSet = { factor1: this.question.factor1, factor2: this.question.factor2, answer };
    this.answerService.setAnswer(answerSet);
    this.nextQuestion();
  }

  questionTimeoutHandler(answer: string) {
    // console.log(`check.component: questionTimeoutHandler(): called with ${answer}`);
    const answerSet = { factor1: this.question.factor1, factor2: this.question.factor2, answer };
    this.answerService.setAnswer(answerSet);
    this.nextQuestion();
  }

  loadingTimeoutHandler() {
    // console.log(`check.component: loadingTimeoutHandler() called`);
    this.viewState = 'question';
  }

  nextQuestion() {
    if (this.questionService.getNextQuestionNumber(this.questionNumber)) {
      this.questionNumber = this.questionService.getNextQuestionNumber(this.questionNumber);
      this.question = this.questionService.getQuestion(this.questionNumber);
      // console.log(`check.component: nextQuestion() `, this.question);
      this.viewState = 'preload';
    } else {
      // no more questions
      this.submissionService.submitData().catch(error => new Error(error));
      // console.log('check.component: nextQuestion(): setting viewState to complete');
      this.viewState = 'complete';
    }
  }
}
