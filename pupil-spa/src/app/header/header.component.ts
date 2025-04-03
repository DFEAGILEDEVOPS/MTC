import { Component, Input, OnInit } from '@angular/core';
import { Config } from '../config.model';
import { QuestionService } from '../services/question/question.service';
import { UserService } from '../services/user/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: [
      './header.component.scss'
  ]
})
export class HeaderComponent implements OnInit {

  public shouldShowFamiliarisationBar: boolean;
  public isLoggedIn: boolean;

  @Input() public noFamiliarisationBar = false;

  config: Config;
  govukRoot = 'https://www.gov.uk';
  govukAssetPath = 'assets/govuk_template';
  appTitle = 'Multiplication Tables Check';
  globalHeaderText = 'GOV.UK';

  constructor(
    private questionService: QuestionService,
    private userService: UserService
  ) {
    this.config = this.questionService.getConfig();
    this.isLoggedIn = this.userService.isLoggedIn();
  }

  ngOnInit() {
    this.shouldShowFamiliarisationBar = !this.noFamiliarisationBar
      && this.isLoggedIn
      && this.config && this.config.practice;
  }

}
