import { Component, OnInit } from '@angular/core';

import { LoginErrorService } from '../services/login-error/login-error.service';

@Component({
  selector: 'app-login-failure',
  templateUrl: './login-failure.component.html',
  styleUrls: ['./login-failure.component.scss']
})
export class LoginFailureComponent implements OnInit {

  private errorMessage: string;

  constructor(
    private loginErrorService: LoginErrorService,
    ) {}

  ngOnInit() {
    this.loginErrorService.currentErrorMessage.subscribe(message => this.errorMessage = message);
  }

}
