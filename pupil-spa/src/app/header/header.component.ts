import { Component, OnInit } from '@angular/core';
import { Config } from '../config.model';
import { QuestionService } from '../services/question/question.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: [
      './header.component.scss'
  ]
})
export class HeaderComponent implements OnInit {

  public familiarisationCheck: boolean;

  config: Config;
  govukRoot = 'https://www.gov.uk';
  govukAssetPath = 'assets/govuk_template';
  appTitle = 'Multiplication Tables Check';
  globalHeaderText = 'GOV.UK';

  constructor(
    private questionService: QuestionService,
  ) {
    this.config = this.questionService.getConfig();
    this.familiarisationCheck = this.config && this.config.practice;
  }

  ngOnInit() {
  }

}
