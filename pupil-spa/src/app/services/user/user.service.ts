import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../storage/storage.service';
import {
  ConfigStorageKey,
  PupilStorageKey,
  QuestionsStorageKey,
  SchoolStorageKey, TokensStorageKey
} from '../storage/storageKey';

const questionsStorageKey = new QuestionsStorageKey();
const configStorageKey = new ConfigStorageKey();
const pupilStorageKey = new PupilStorageKey();
const schoolStorageKey = new SchoolStorageKey();
const tokensStorageKey = new TokensStorageKey();

@Injectable()
export class UserService {
  private loggedIn = false;
  data: any = {};

  constructor(private http: HttpClient, private storageService: StorageService) {
    this.loggedIn = !!this.storageService.getAccessArrangements();
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
          this.storageService.setQuestions(data[questionsStorageKey.toString()]);
          this.storageService.setConfig(data[configStorageKey.toString()]);
          this.storageService.setPupil(data[pupilStorageKey.toString()]);
          this.storageService.setSchool(data[schoolStorageKey.toString()]);
          this.storageService.setAccessToken(
            data[tokensStorageKey.toString()] && data[tokensStorageKey.toString()]['jwt']
            && data[tokensStorageKey.toString()]['jwt']['token']);
          this.storageService.setToken(data[tokensStorageKey.toString()]);
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
