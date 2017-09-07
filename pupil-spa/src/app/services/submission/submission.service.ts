import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { environment } from '../../../environments/environment';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class SubmissionService {

  constructor(private http: Http, private storageService: StorageService) {
  }

  async submitData() {
    const localStorageData = this.storageService.getAllItems();
    const { audit, inputs, answers, access_token } = localStorageData;
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const requestArgs = new RequestOptions({headers: headers});
    await this.http.post(`${environment.apiURL}/api/completed-check`,
      { audit, inputs, answers, access_token },
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
