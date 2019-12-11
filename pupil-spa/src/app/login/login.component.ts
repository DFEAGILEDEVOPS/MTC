import { Component, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { LoginErrorService } from '../services/login-error/login-error.service';
import { LoginErrorDiagnosticsService } from '../services/login-error-diagnostics/login-error-diagnostics.service';
import { CheckStatusService } from '../services/check-status/check-status.service';
import { Login } from './login.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {
  public loginModel = new Login('', '');
  public loginSucceeded: boolean;
  private errorMessage: string;

  constructor(
    private loginErrorService: LoginErrorService,
    private loginErrorDiagnosticsService: LoginErrorDiagnosticsService,
    private router: Router,
    private route: ActivatedRoute,
    private elRef: ElementRef,
    private checkStatusService: CheckStatusService
  ) { }

  ngOnInit() {
    const hasUnfinishedCheck = this.checkStatusService.hasUnfinishedCheck();
    if (hasUnfinishedCheck) {
      this.router.navigate(['check'], { queryParams: { unfinishedCheck: true } });
    }
    this.loginErrorService.currentErrorMessage.subscribe(message => this.errorMessage = message);
    const queryParams = this.route.snapshot.queryParams;
    this.loginSucceeded = queryParams && queryParams.loginSucceeded && JSON.parse(queryParams.loginSucceeded);
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
    this.router.navigate(['sign-in-pending'], { queryParams: { schoolPin, pupilPin } });
  }
}
