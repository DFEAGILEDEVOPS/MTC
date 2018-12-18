import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';
import 'rxjs/add/operator/toPromise';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../storage/storage.service';
const questionsDataKey = 'questions';
const configDataKey = 'config';
const pupilDataKey = 'pupil';
const schoolDataKey = 'school';
const accessTokenKey = 'access_token';
const tokenKey = 'tokens';

@Injectable()
export class UserService {
  private loggedIn = false;
  data: any = {};

  constructor(private http: HttpClient, private storageService: StorageService) {
    this.loggedIn = !!this.storageService.getItem(accessTokenKey);
  }

  login(schoolPin, pupilPin): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const headers = {
        headers: new HttpHeaders( { 'Content-Type': 'application/json' })
      };

      await this.http.post(`${APP_CONFIG.authURL}`, { schoolPin, pupilPin }, headers)
        .toPromise()
        .then(data => {
          this.loggedIn = true;
          this.storageService.clear();
          this.storageService.setItem(questionsDataKey, data[questionsDataKey]);
          this.storageService.setItem(configDataKey, data[configDataKey]);
          this.storageService.setItem(pupilDataKey, data[pupilDataKey]);
          this.storageService.setItem(schoolDataKey, data[schoolDataKey]);
          if (APP_CONFIG.featureUseHpa === true) {
            this.storageService.setItem(accessTokenKey, data[tokenKey]['jwt']['token']);
            this.storageService.setItem(tokenKey, data[tokenKey]);
          } else {
            this.storageService.setItem(accessTokenKey, data[accessTokenKey]);
          }

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
