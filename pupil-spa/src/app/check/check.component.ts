import { Component, OnInit, DoCheck } from '@angular/core';

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

  ngDoCheck() {
    switch (this.viewState) {
      case 'preload':
        setTimeout(() => {
          console.log('timeout called on preload');
          this.viewState = 'question';
        }, this.config.loadingTime * 1000);
        break;

      case 'question':
        // setTimeout(() => {
        //   console.log('timeout called on question');
        //   this.nextQuestion();
        // }, this.config.questionTime * 1000);
        break;
    }
  }

  manualQuestionSubmitHandler(answer: string) {
    console.log(`check component got the answer: ${answer}`);
    this.question.answer = answer;
    // TODO: record answer
    this.nextQuestion();
  }

  questionTimeoutHandler(answer: string) {
    console.log(`check component got the answer from question timeout: ${answer}`);
    this.question.answer = answer;
    // TODO: record answer
    this.nextQuestion();
  }

  nextQuestion() {
    if (this.questionService.getNextQuestionNumber(this.questionNumber)) {
      this.questionNumber = this.questionService.getNextQuestionNumber(this.questionNumber);
      this.question = this.questionService.getQuestion(this.questionNumber);
      console.log(`got next question: `, this.question);
      this.viewState = 'preload';
    } else {
      // no more questions
      console.log('check complete');
      this.viewState = 'complete';
    }
  }
}
