import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import 'rxjs/add/operator/toPromise';
import { Http, RequestOptions, Headers } from '@angular/http';
import { StorageService } from '../storage/storage.service';
const questionsDataKey = 'questions';
const configDataKey = 'config';
const pupilDataKey = 'pupil';
const schoolDataKey = 'school';
const accessTokenKey = 'access_token';

@Injectable()
export class UserService {
  private loggedIn = false;
  data: any = {};

  constructor(private http: Http, private storageService: StorageService) {
    this.loggedIn = !!this.storageService.getItem(accessTokenKey);
  }

  login(schoolPin, pupilPin): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      const requestArgs = new RequestOptions({headers: headers});

      await this.http.post(`${environment.authURL}`,
        { schoolPin, pupilPin },
        requestArgs)
        .toPromise()
        .then((response) => {
          if (response.status !== 200) {
            return reject(new Error('Login Error:' + response.status + ':' + response.statusText));
          }
          const data = response.json();
          this.loggedIn = true;
          this.storageService.clear();
          this.storageService.setItem(questionsDataKey, data[questionsDataKey]);
          this.storageService.setItem(configDataKey, data[configDataKey]);
          this.storageService.setItem(pupilDataKey, data[pupilDataKey]);
          this.storageService.setItem(schoolDataKey, data[schoolDataKey]);
          this.storageService.setItem(accessTokenKey, data[accessTokenKey]);
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
