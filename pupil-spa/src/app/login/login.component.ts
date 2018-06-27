import { Component, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../services/user/user.service';
import { QuestionService } from '../services/question/question.service';
import { WarmupQuestionService } from '../services/question/warmup-question.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { CheckStatusService } from '../services/check-status/check-status.service';
import { Login } from './login.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {

  private submitted: boolean;
  public loginModel = new Login('', '');
  public loginSucceeded: boolean;

  constructor(
    private userService: UserService,
    private router: Router,
    private questionService: QuestionService,
    private warmupQuestionService: WarmupQuestionService,
    private elRef: ElementRef,
    private registerInputService: RegisterInputService,
    private checkStatusService: CheckStatusService
  ) { }

  ngOnInit() {
    const hasUnfinishedCheck = this.checkStatusService.hasUnfinishedCheck();
    if (hasUnfinishedCheck) {
      this.router.navigate(['check'], { queryParams: { unfinishedCheck: true } });
    }
  }

  ngAfterViewInit() {
    // disable pin change when input is scrolled
    const input = this.elRef.nativeElement.querySelector('#pupilPin');
    input.addEventListener('mousewheel', function(e) { e.preventDefault(); });
    // firefox uses DOMMouseScroll instead of mousewheel
    input.addEventListener('DOMMouseScroll', function(e) { e.preventDefault(); });
    // prevent arrow up or down to change the input value
    input.addEventListener('keydown', function(e) {
      if (e.which === 38 || e.which === 40) {
        e.preventDefault();
      }
    });
  }

  /**
   * Handler for the login form submit action
   */
  onSubmit(schoolPin, pupilPin) {
    if (this.submitted === true) {
      return;
    }
    this.submitted = true;
    this.userService.login(schoolPin, pupilPin)
      .then(
      () => {
        this.loginSucceeded = true;
        this.questionService.initialise();
        this.warmupQuestionService.initialise();
        this.registerInputService.initialise();
        this.router.navigate(['sign-in-success']);
      },
      () => {
        this.loginSucceeded = false;
        this.submitted = false;
        this.router.navigate(['sign-in']);
      })
      .catch(() => {
        this.loginSucceeded = false;
        this.submitted = false;
        this.router.navigate(['sign-in']);
      });
  }
}
