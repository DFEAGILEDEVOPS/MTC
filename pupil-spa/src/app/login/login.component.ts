import { Component, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { LoginErrorService } from '../services/login-error/login-error.service';
import { UserService } from '../services/user/user.service';
import { QuestionService } from '../services/question/question.service';
import { WarmupQuestionService } from '../services/question/warmup-question.service';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { CheckStatusService } from '../services/check-status/check-status.service';
import { Login } from './login.model';
import { PupilPrefsService } from '../services/pupil-prefs/pupil-prefs.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {

  private submitted: boolean;
  public loginModel = new Login('', '');
  public loginSucceeded: boolean;
  public connectionFailed: boolean;
  private errorMessage: string;

  constructor(
    private loginErrorService: LoginErrorService,
    private userService: UserService,
    private router: Router,
    private questionService: QuestionService,
    private warmupQuestionService: WarmupQuestionService,
    private elRef: ElementRef,
    private registerInputService: RegisterInputService,
    private checkStatusService: CheckStatusService,
    private pupilPrefsService: PupilPrefsService
  ) { }

  ngOnInit() {
    const hasUnfinishedCheck = this.checkStatusService.hasUnfinishedCheck();
    if (hasUnfinishedCheck) {
      this.router.navigate(['check'], { queryParams: { unfinishedCheck: true } });
    }
    this.loginErrorService.currentErrorMessage.subscribe(message => this.errorMessage = message);
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
        this.connectionFailed = false;
        this.questionService.initialise();
        this.warmupQuestionService.initialise();
        this.registerInputService.initialise();

        const config = this.questionService.getConfig();
        this.pupilPrefsService.loadPupilPrefs();
        if (config.fontSize) {
          this.router.navigate(['font-choice']);
        } else if (config.colourContrast) {
          this.router.navigate(['colour-choice']);
        } else {
          this.router.navigate(['sign-in-success']);
        }
      },
      (err) => {
        this.submitted = false;
        this.loginErrorService.changeMessage(err.message);
        if (err.status === 401) {
          this.loginSucceeded = false;
          this.router.navigate(['sign-in']);
        } else {
          this.router.navigate(['sign-in-fail']);
        }
      })
      .catch(() => {
        this.loginSucceeded = false;
        this.submitted = false;
        this.router.navigate(['sign-in']);
      });
  }
}
