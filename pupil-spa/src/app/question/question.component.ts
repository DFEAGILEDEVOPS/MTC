import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit {

  // Initial the question
  // E.g.
  // <app-question [factor1]="4" [factor2]="5"></app-question>
  @Input()
  public factor1: number = 0;
  @Input()
  public factor2: number = 0;

  constructor() { }

  ngOnInit() {
  }

}
