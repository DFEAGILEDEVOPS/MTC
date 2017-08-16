import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit {

  // Initialise the question
  // E.g: <app-question [factor1]="4" [factor2]="5"></app-question>
  @Input()
  public factor1 = 0;

  @Input()
  public factor2 = 0;

  public answer = '';

  constructor() { }

  ngOnInit() {
  }

  public onSubmit() {
  }

  onClickAnswer(number) {
    this.answer = `${this.answer}${number}`;
  }

  onClickBackspace() {
    if (this.answer.length > 0) {
      this.answer = this.answer.substr(0, this.answer.length - 1);
    }
  }

  onClickSubmit() {
    console.log('Submit form');
  }

}
