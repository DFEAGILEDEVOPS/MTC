import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class LoginErrorService {

  private errorMessageSource = new BehaviorSubject('');
  public currentErrorMessage = this.errorMessageSource.asObservable();

  constructor() {}

  changeMessage(message: string) {
    this.errorMessageSource.next(message);
  }
}
