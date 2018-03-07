import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../services/user/user.service';
import { QuestionService } from '../services/question/question.service';
import { WarmupQuestionService } from '../services/question/warmup-question.service';
import { RegisterInputService } from '../services/register-input/registerInput.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private submitted: boolean;

  constructor(
    private userService: UserService,
    private router: Router,
    private questionService: QuestionService,
    private warmupQuestionService: WarmupQuestionService,
    private registerInputService: RegisterInputService
  ) { }

  ngOnInit() {
    this.submitted = false;
  }

  /**
   * Handler for the login form submit action
   */
  onSubmit(schoolPin, pupilPin) {
    if (!schoolPin || !pupilPin) {
      return false;
    }
    if (this.submitted === true) {
      return;
    }
    this.submitted = true;
    this.userService.login(schoolPin, pupilPin)
      .then(
      () => {
        this.questionService.initialise();
        this.warmupQuestionService.initialise();
        this.registerInputService.initialise();
        this.router.navigate(['sign-in-success']);
      },
      () => {
        this.router.navigate(['sign-in-failure']);
      })
      .catch(() => {
        this.router.navigate(['sign-in-failure']);
      });
  }
}
