import { Component, OnInit, AfterViewInit } from '@angular/core';

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
    this.viewState = 'preload';
    this.questionNumber = 1;
    this.totalNumberOfQuestions = this.questionService.getNumberOfQuestions();
    this.question = this.questionService.getQuestion(this.questionNumber);
    this.config = this.questionService.getConfig();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      console.log('timeout called on preload');
      this.viewState = 'question';
    }, this.config.loadingTime * 1000);
  }
}
