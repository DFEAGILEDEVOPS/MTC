import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { environment } from '../../../environments/environment';
import { StorageService } from '../storage/storage.service';
import { AuditService } from '../audit/audit.service';
import { CheckStartedAPICallFailed, CheckSubmissionAPIFailed } from '../audit/auditEntry';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/scan';

@Injectable()
export class SubmissionService {
  constructor(private http: Http, private storageService: StorageService, private auditService: AuditService) {
  }

  async submitCheckStartData() {
    const { checkStartAPIErrorDelay, checkStartAPIErrorMaxAttempts } = environment;
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const requestArgs = new RequestOptions({headers: headers});
    const { checkCode } = this.storageService.getItem('pupil');
    const accessToken = this.storageService.getItem('access_token');
    await this.http.post(`${environment.apiURL}/api/check-started`,
      { checkCode, accessToken },
      requestArgs)
      .retryWhen(errors =>
        errors
          .delay(checkStartAPIErrorDelay)
          .scan((acc, error) => {
            if (acc === checkStartAPIErrorMaxAttempts) {
              // throw the response error to audit log the last attempt
              throw error;
            }
            this.auditService.addEntry(new CheckStartedAPICallFailed({ status: error.status, statusText: error.statusText }));
            return acc + 1;
          }, 1)
        .take(checkStartAPIErrorMaxAttempts)
      )
      .toPromise();
  }

  async submitData() {
    const { checkSubmissionApiErrorDelay, checkSubmissionAPIErrorMaxAttempts } = environment;
    const localStorageData = this.storageService.getAllItems();
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const requestArgs = new RequestOptions({headers: headers});
    await this.http.post(`${environment.apiURL}/api/completed-check1`,
      { ...localStorageData },
      requestArgs)
      .retryWhen(errors =>
        errors
          .delay(checkSubmissionApiErrorDelay)
          .scan((acc, error) => {
            if (acc === checkSubmissionAPIErrorMaxAttempts) {
              throw error;
            }
            this.auditService.addEntry(new CheckSubmissionAPIFailed({ status: error.status, statusText: error.statusText }));
            return acc + 1;
          }, 1)
          .take(checkSubmissionAPIErrorMaxAttempts)
      )
      .toPromise();
  }
}
