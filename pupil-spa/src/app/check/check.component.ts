import { Component, OnInit, DoCheck } from '@angular/core';

import { QuestionService } from '../question.service';
import { Question } from '../question.model';
import { Config } from '../config.model';

@Component({
  selector: 'app-check',
  templateUrl: './check.component.html',
  styleUrls: ['./check.component.scss']
})

export class CheckComponent implements OnInit {

  private viewState: String;
  private questionNumber: number;
  private totalNumberOfQuestions: number;
  private question: Question;
  private config: Config;

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
    switch(this.viewState) {
      case 'preload':
        setTimeout(() => {
          console.log('timeout called on preload');
          this.viewState = 'question';
        }, this.config.loadingTime * 1000);
      break;

      case 'question':
        setTimeout(() => {
          console.log('timeout called on question');
          this.nextQuestion();
        }, this.config.questionTime * 1000);
      break;
    }
  }

  nextQuestion() {
    if (this.questionService.getNextQuestionNumber(this.questionNumber)) {
      this.questionNumber = this.questionService.getNextQuestionNumber(this.questionNumber)
      this.question = this.questionService.getQuestion(this.questionNumber);
      this.viewState = 'preload';
    } else {
      // no more questions
     this.viewState = 'complete';
    }
  }
}
