import { Injectable } from '@angular/core';
import * as responseMock from './login.response.mock.json';
const auth_token = 'auth_token';

@Injectable()
export class UserService {
  private loggedIn = false;

  constructor() {
    this.loggedIn = !!localStorage.getItem(auth_token);
  }

  login(schoolPin, pupilPin): Promise<any> {
    return new Promise((resolve, reject) => {
        if (schoolPin === 'abc12345' && pupilPin === '9999a') {
          this.loggedIn = true;
          localStorage.setItem(auth_token, responseMock['pupil'].sessionId);
          localStorage.setItem('data', JSON.stringify(responseMock));
          return resolve(responseMock);
        }
        reject({error: 'Login error'});
    });
  }

  logout() {
    localStorage.removeItem(auth_token);
    localStorage.removeItem('data');
    this.loggedIn = false;
  }

  isLoggedIn() {
    return this.loggedIn;
  }
}
