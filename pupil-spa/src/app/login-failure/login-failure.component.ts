import { Component, OnInit, AfterViewInit } from '@angular/core';

import { LoginErrorService } from '../services/login-error/login-error.service';

@Component({
    selector: 'app-login-failure',
    templateUrl: './login-failure.component.html',
    styleUrls: ['./login-failure.component.scss'],
    standalone: false
})
export class LoginFailureComponent implements OnInit, AfterViewInit {

  public errorMessage: string;

  constructor(
    private loginErrorService: LoginErrorService,
    ) {}

  ngOnInit() {
    this.loginErrorService.currentErrorMessage.subscribe(message => this.errorMessage = message);
  }

  ngAfterViewInit() {
    (window as any).GOVUK.details.addDetailsPolyfill();
  }

}
