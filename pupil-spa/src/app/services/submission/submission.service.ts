import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { environment } from '../../../environments/environment';
import { StorageService } from '../storage/storage.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/mergeMap';

@Injectable()
export class SubmissionService {
  constructor(private http: Http, private storageService: StorageService) {
  }

  async submitCheckStartData() {
    const { apiErrorDelay, apiErrorMaxAttempts } = environment;
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const requestArgs = new RequestOptions({headers: headers});
    const { checkCode } = this.storageService.getItem('pupil');
    const accessToken = this.storageService.getItem('access_token');
    await this.http.post(`${environment.apiURL}/api/check-started`,
      { checkCode, accessToken },
      requestArgs)
      .retryWhen((errors) => {
        return errors.mergeMap((error) =>
          (error.status !== 503 && error.status !== 504) ? Observable.throw(error) : Observable.of(error))
          .delay(apiErrorDelay).take(apiErrorMaxAttempts);
      })
      .toPromise()
      .then((response) => {
          if (response.status !== 201) {
            return new Error('Submit Error:' + response.status + ':' + response.statusText);
          }
        },
        (err) => { throw new Error(err); }
      );
  }

  async submitData() {
    const localStorageData = this.storageService.getAllItems();
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const requestArgs = new RequestOptions({headers: headers});
    await this.http.post(`${environment.apiURL}/api/completed-check`,
      { ...localStorageData },
      requestArgs)
      .toPromise()
      .then((response) => {
          if (response.status !== 201) {
            return new Error('Submit Error:' + response.status + ':' + response.statusText);
          }
        },
        (err) => { throw new Error(err); }
        ).catch((err) => { throw new Error(err); });
  }
}
