import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
// import { environment } from '../../../environments/environment';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class SubmissionService {

  constructor(private http: Http, private storageService: StorageService) {
  }

  async submitData() {
    const localStorageData = this.storageService.getAllItems();
    console.log('all items are:', localStorageData);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const requestArgs = new RequestOptions({headers: headers});
    // TODO: build Check complete API call
  //   await this.http.post(`${environment.apiURL}/api/complete`,
  //     {localStorageData},
  //     requestArgs)
  //     .toPromise()
  //     .then((response) => {
  //         if (response.status !== 200) {
  //           return new Error('Login Error:' + response.status + ':' + response.statusText);
  //         }
  //       },
  //       () => {
  //       }).catch(error => new Error(error));
  }
}
