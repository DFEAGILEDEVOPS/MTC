import { Component, OnInit } from '@angular/core';

import { QuestionService } from '../question.service';
import { Question } from '../question.model';
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

  constructor(private questionService: QuestionService) {
    this.questionNumber = 1;
    this.totalNumberOfQuestions = this.questionService.getNumberOfQuestions();
    this.question = this.questionService.getQuestion(this.questionNumber);
    this.config = this.questionService.getConfig();
  }

  ngOnInit() {
    this.viewState = 'preload';
  }

  manualSubmitHandler(answer: string)  {
          // console.log(`check.component: manualSubmitHandler(): ${answer}`);
          this.setAnswer(answer);
         this.nextQuestion();
      }

      questionTimeoutHandler(answer: string)  {
          // console.log(`check.component: questionTimeoutHandler(): called with ${answer}`);
          this.setAnswer(answer);
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
     // console.log('check.component: nextQuestion(): setting viewState to complete');
     this.viewState = 'complete';
    }
  }

  setAnswer(answer) {
    this.question.answer = answer;
  }
}
