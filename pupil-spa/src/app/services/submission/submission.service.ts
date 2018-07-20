import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG } from '../config/config.service';
import { StorageService } from '../storage/storage.service';
import { AuditService } from '../audit/audit.service';
import { AppUsageService } from '../app-usage/app-usage.service';
import { CheckStartedAPICallFailed, CheckSubmissionAPIFailed } from '../audit/auditEntry';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/concat';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SubmissionService {
  // check start api config
  checkStartAPIErrorDelay;
  checkStartAPIErrorMaxAttempts;
  // check submission api config
  checkSubmissionApiErrorDelay;
  checkSubmissionAPIErrorMaxAttempts;
  // URLs
  checkStartedURL;
  checkSubmissionURL;

  constructor(private http: HttpClient,
              private storageService: StorageService,
              private auditService: AuditService,
              private appUsageService: AppUsageService) {
    const {
      checkStartAPIErrorDelay,
      checkStartAPIErrorMaxAttempts,
      checkSubmissionApiErrorDelay,
      checkSubmissionAPIErrorMaxAttempts,
      checkStartedURL,
      checkSubmissionURL
    } = APP_CONFIG;

    this.checkStartAPIErrorDelay = checkStartAPIErrorDelay;
    this.checkStartAPIErrorMaxAttempts = checkStartAPIErrorMaxAttempts;
    this.checkSubmissionApiErrorDelay = checkSubmissionApiErrorDelay;
    this.checkSubmissionAPIErrorMaxAttempts = checkSubmissionAPIErrorMaxAttempts;
    this.checkStartedURL = checkStartedURL;
    this.checkSubmissionURL = checkSubmissionURL;
  }

  submitCheckStartData() {
    const {checkCode} = this.storageService.getItem('pupil');
    const accessToken = this.storageService.getItem('access_token');
    return this.http.post(`${this.checkStartedURL}`,
      // Explanation for response type text
      // https://github.com/angular/angular/issues/21211
      {checkCode, accessToken}, { responseType: 'text' })
      .retryWhen(errors => {
        return errors
          .flatMap((error: any) => {
            // Prevent retries for specific http code
            // if (error.status === 404) {
            //   return Observable.throw({error: 'No retry'});
            // }
            this.auditService.addEntry(new CheckStartedAPICallFailed({
              status: error.status,
              statusText: error.statusText
            }));
            return Observable.of(error.status).delay(this.checkStartAPIErrorDelay);
          })
          .take(this.checkStartAPIErrorMaxAttempts)
          .concat(Observable.throw(new Error(`Max ${this.checkStartAPIErrorMaxAttempts} retries reached`)));
      });
  }

  submitData() {
    const localStorageData = this.storageService.getAllItems();
    if (localStorageData.device) {
      localStorageData.device.appUsageCounter = this.appUsageService.getCounterValue();
    }
    return this.http.post(`${this.checkSubmissionURL}`,
      // Explanation for response type text
      // https://github.com/angular/angular/issues/21211
      {...localStorageData}, { responseType: 'text' })
      .retryWhen(errors => {
        return errors
          .flatMap((error: any) => {
            // Prevent retries for specific http code
            // if (error.status === 404) {
            //   return Observable.throw({error: 'No retry'});
            // }
            this.auditService.addEntry(new CheckSubmissionAPIFailed({
              status: error.status,
              statusText: error.statusText
            }));
            return Observable.of(error.status).delay(this.checkSubmissionApiErrorDelay);
          })
          .take(this.checkSubmissionAPIErrorMaxAttempts)
          .concat(Observable.throw(new Error(`Max ${this.checkSubmissionAPIErrorMaxAttempts} retries reached`)));
      });
  }
}
