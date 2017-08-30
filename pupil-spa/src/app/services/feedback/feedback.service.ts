import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Http, RequestOptions, Headers } from '@angular/http';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class FeedbackService {

  constructor(private http: Http, private storageService: StorageService) {
    this.storageService.clear();
  }

  postFeedback(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      const requestArgs = new RequestOptions({ headers: headers });

      if (!this.storageService.getItem('feedback')) {
        console.log('No feedback in local storage');
        reject();
      }

      const storedFeedback = this.storageService.getItem('feedback');
      console.log('storedFeedback', storedFeedback);

      const inputType = storedFeedback.inputType.id;
      const satisfactionRating = storedFeedback.satisfactionRating.id;
      const comments = storedFeedback.comments;
      const sessionId = storedFeedback.sessionId;

      await this.http.post(`${environment.apiURL}/api/pupil-feedback`,
        { inputType, satisfactionRating, comments, sessionId },
        requestArgs)
        .toPromise()
        .then((response) => {
          if (response.status !== 201) {
            return reject(new Error('Feedback Error:' + response.status + ':' + response.statusText));
          }
          const data = response.json();
          console.log('RETURN FROM FEEDBACK API', data);
          resolve();
        },
        (err) => {
          reject(err);
        }).catch(error => reject(error));
    });
  }
}
