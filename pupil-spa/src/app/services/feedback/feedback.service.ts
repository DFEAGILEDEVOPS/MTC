import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';
import { Http, RequestOptions, Headers } from '@angular/http';
import { StorageService } from '../storage/storage.service';
import { AzureQueueService } from '../azure-queue/azure-queue.service';

@Injectable()
export class FeedbackService {

  constructor(
    private http: Http,
    private storageService: StorageService,
    private azureService: AzureQueueService) {
  }

  async postFeedback() {
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      const requestArgs = new RequestOptions({ headers: headers });

      const storedFeedback = this.storageService.getItem('feedback');
      const accessToken = this.storageService.getItem('access_token');

      if (!storedFeedback || !accessToken) {
        return false;
      }

      const inputType = storedFeedback.inputType.id;
      const satisfactionRating = storedFeedback.satisfactionRating.id;
      const comments = storedFeedback.comments;
      const checkCode = storedFeedback.checkCode;

      await this.http.post(`${APP_CONFIG.apiURL}/api/pupil-feedback`,
        {
          inputType,
          satisfactionRating,
          comments,
          checkCode,
          accessToken
        },
        requestArgs)
        .toPromise()
        .then((response) => {
          if (response.status !== 201) {
            return new Error('Feedback Error:' + response.status + ':' + response.statusText);
          }
        }).catch(error => new Error(error));
  }

  postSurveyFeedback(feedbackData: object) {
    return new Promise((resolve, reject) => {
      const tableService = this.azureService.getTableService(APP_CONFIG.feedbackTableUrl, APP_CONFIG.feedbackSasToken);
      const generator = this.azureService.getGenerator();

      const entity = {
        PartitionKey: generator.String('partitionKey'), // partitionKey and rowKey has to be replaced
        RowKey: generator.String('4'), // guid?
        comment: generator.String('String'),
        firstName: generator.String('String'),
        lastName: generator.String('String'),
        contactNumber: generator.String('String'),
        emailAddress: generator.String('String'),
        schoolName: generator.String('String')
      }

      tableService.insertEntity(APP_CONFIG.feedbackTableName, entity, (error, result, response) => {
        if (error) {
          return reject();
        }
      });

      resolve();
    });
  }
}
