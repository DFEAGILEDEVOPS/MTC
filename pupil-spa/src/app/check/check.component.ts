import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-check',
  templateUrl: './check.component.html',
  styleUrls: ['./check.component.scss']
})

export class CheckComponent implements OnInit {

  private viewState: String;
  private questionNumber: Number;
  private totalNumberOfQuestions: Number;
  private factor1: Number;
  private factor2: Number;

  constructor() {
    this.viewState = 'preload';
    this.questionNumber = 1;
    this.totalNumberOfQuestions = 10;
    this.factor1 = 8;
    this.factor2 = 9;
  }

  ngOnInit() {
  }

}
