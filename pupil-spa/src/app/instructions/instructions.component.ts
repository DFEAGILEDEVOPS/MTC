import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { QuestionService } from '../question.service';

@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.css']
})
export class InstructionsComponent implements OnInit {

  public count: number;
  public loadingTime: number;
  public questionTime: number;

  constructor(private router: Router, private questionService: QuestionService) {
    this.count = this.questionService.getNumberOfQuestions();
    const config = this.questionService.getConfig();
    this.loadingTime = config.loadingTime;
    this.questionTime = config.questionTime;
  }

  ngOnInit() {
  }

  onClick() {
    this.router.navigate(['check']);
  }

}
