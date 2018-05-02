import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StorageService } from '../storage/storage.service';
import { AuditService } from '../audit/audit.service';
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

const { checkStartAPIErrorDelay, checkStartAPIErrorMaxAttempts,
  checkSubmissionApiErrorDelay, checkSubmissionAPIErrorMaxAttempts,   } = environment;

@Injectable()
export class SubmissionService {
  // check start api config
  checkStartAPIErrorDelay = checkStartAPIErrorDelay;
  checkStartAPIErrorMaxAttempts = checkStartAPIErrorMaxAttempts;
  // check submission api config
  checkSubmissionApiErrorDelay = checkSubmissionApiErrorDelay;
  checkSubmissionAPIErrorMaxAttempts = checkSubmissionAPIErrorMaxAttempts;

  constructor(private http: HttpClient, private storageService: StorageService, private auditService: AuditService) {
  }

  submitCheckStartData() {
    const {checkCode} = this.storageService.getItem('pupil');
    const accessToken = this.storageService.getItem('access_token');
    return this.http.post(`${environment.checkStartedURL}`,
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
    return this.http.post(`${environment.apiURL}/api/completed-check`,
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
