import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';
import { AzureQueueService } from '../azure-queue/azure-queue.service';
import { Http, RequestOptions, Headers } from '@angular/http';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { queueNames } from '../azure-queue/queue-names';
import { accessArrangementsDataKey } from '../../access-arrangements';

@Injectable()
export class PupilPrefsService {

  featureUseHpa;
  pupilPrefsAPIErrorDelay;
  pupilPrefsAPIErrorMaxAttempts;

  constructor(private azureQueueService: AzureQueueService,
              private http: Http,
              private storageService: StorageService,
              private tokenService: TokenService) {
    const { featureUseHpa,
      pupilPrefsAPIErrorDelay,
      pupilPrefsAPIErrorMaxAttempts
    } = APP_CONFIG;
    this.featureUseHpa = featureUseHpa;
    this.pupilPrefsAPIErrorDelay = pupilPrefsAPIErrorDelay;
    this.pupilPrefsAPIErrorMaxAttempts = pupilPrefsAPIErrorMaxAttempts;
  }

  public async storePupilPrefs() {
    const payload = this.storageService.getItem(accessArrangementsDataKey);
    if (this.featureUseHpa === true) {
      const queueName = queueNames.pupilPrefs;
      const { url, token } = this.tokenService.getToken('pupilPreferences');
      const retryConfig = {
        errorDelay: this.pupilPrefsAPIErrorDelay,
        errorMaxAttempts: this.pupilPrefsAPIErrorMaxAttempts
      };
      await this.azureQueueService.addMessage(queueName, url, token, payload, retryConfig);
    } else {
      // Legacy api post functionality not implemented
    }
  }
}

