import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { Http } from '@angular/http';
import { StorageService } from './storage.service';
const sessionDataKey = 'session';
const questionsDataKey = 'questions';
const configDataKey = 'config';

@Injectable()
export class UserService {
  private loggedIn = false;
  //TODO: source from config set on deployment
  private apiURL = 'http://localhost:3001';
  data: any = {};

  constructor(private http: Http, private storageService: StorageService) {
    this.loggedIn = !!this.storageService.getItem(sessionDataKey);
  }

  login(schoolPin, pupilPin) : Promise<any> {
    return new Promise(async (resolve, reject) => {

      await this.http.post(`${this.apiURL}/api/questions`,
        { schoolPin, pupilPin },
        //TODO: incorrect
        { params: { 'Content-Type': 'application/json' } })
        .toPromise()
        .then((response) => {
          if (response.status !== 200) {
            return reject(new Error('Login Error:' + response.status + ':' + response.statusText));
          }
          const data = response.json();
          this.loggedIn = true;
          this.storageService.setItem(sessionDataKey, data[sessionDataKey]);
          this.storageService.setItem(questionsDataKey, data[questionsDataKey]);
          this.storageService.setItem(configDataKey, data[configDataKey]);
          resolve();
        },
        (err) => {
          reject(err);
        }).catch(error => reject(error));
    });
  }

  logout() {
    this.storageService.clear();
    this.loggedIn = false;
  }

  isLoggedIn() {
    return this.loggedIn;
  }
}
