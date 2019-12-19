import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../storage/storage.service';
import {
  AccessArrangementsStorageKey, AccessTokenStorageKey,
  ConfigStorageKey,
  PupilStorageKey,
  QuestionsStorageKey,
  SchoolStorageKey, TokensStorageKey
} from '../storage/storageKey';

const configStorageKey = new ConfigStorageKey();
const pupilStorageKey = new PupilStorageKey();
const schoolStorageKey = new SchoolStorageKey();
const tokensStorageKey = new TokensStorageKey();

@Injectable()
export class UserService {
  private loggedIn = false;
  data: any = {};

  constructor(private http: HttpClient, private storageService: StorageService) {
    this.loggedIn = !!this.storageService.getItem(new AccessArrangementsStorageKey());
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
          const questions = data['questions'] ? data['questions'] : [];
          questions.forEach(q => {
            const questionsStorageKey = new QuestionsStorageKey();
            this.storageService.setItem(questionsStorageKey, q);
          });
          this.storageService.setItem(configStorageKey, data[configStorageKey.toString()]);
          this.storageService.setItem(pupilStorageKey, data[pupilStorageKey.toString()]);
          this.storageService.setItem(schoolStorageKey, data[schoolStorageKey.toString()]);
          this.storageService.setItem(new AccessTokenStorageKey(),
            data[tokensStorageKey.toString()] && data[tokensStorageKey.toString()]['jwt']
            && data[tokensStorageKey.toString()]['jwt']['token']);
          this.storageService.setItem(new TokensStorageKey(), data[tokensStorageKey.toString()]);

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
