import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuestionService } from '../services/question/question.service';
import { AuditService } from '../services/audit/audit.service';
import { CheckStarted } from '../services/audit/auditEntry';

@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.css']
})
export class InstructionsComponent implements OnInit {

  public count: number;
  public loadingTime: number;
  public questionTime: number;

  constructor(
    private router: Router,
    private questionService: QuestionService,
    private auditService: AuditService) {
    this.count = this.questionService.getNumberOfQuestions();
    const config = this.questionService.getConfig();
    this.loadingTime = config.loadingTime;
    this.questionTime = config.questionTime;
  }

  ngOnInit() {
  }

  onClick() {
    this.auditService.addEntry(new CheckStarted());
    this.router.navigate(['check']);
  }

}
