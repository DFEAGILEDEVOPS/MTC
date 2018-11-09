import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';
import { AzureQueueService } from '../azure-queue/azure-queue.service';
import { Http, RequestOptions, Headers } from '@angular/http';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { queueNames } from '../azure-queue/queue-names';
import { accessArrangementsDataKey, AccessArrangementsConfig } from '../../access-arrangements';
import { Pupil } from '../../pupil';
import { AuditService } from '../audit/audit.service';
import { PupilPrefsAPICalled, PupilPrefsAPICallSucceeded, PupilPrefsAPICallFailed } from '../audit/auditEntry';

@Injectable()
export class PupilPrefsService {

  featureUseHpa;
  pupilPrefsAPIErrorDelay;
  pupilPrefsAPIErrorMaxAttempts;
  fontSettings;

  constructor(private azureQueueService: AzureQueueService,
              private http: Http,
              private storageService: StorageService,
              private tokenService: TokenService,
              private auditService: AuditService) {
    const { featureUseHpa,
      pupilPrefsAPIErrorDelay,
      pupilPrefsAPIErrorMaxAttempts
    } = APP_CONFIG;
    this.featureUseHpa = featureUseHpa;
    this.pupilPrefsAPIErrorDelay = pupilPrefsAPIErrorDelay;
    this.pupilPrefsAPIErrorMaxAttempts = pupilPrefsAPIErrorMaxAttempts;
    this.fontSettings = AccessArrangementsConfig.fontSettings;
  }

  public async storePupilPrefs() {
    const accessArrangements = this.storageService.getItem(accessArrangementsDataKey);
    const fontSetting = this.fontSettings.find(f => f.val === accessArrangements.fontSize);
    const pupil = this.storageService.getItem('pupil') as Pupil;
    if (this.featureUseHpa === true) {
      const queueName = queueNames.pupilPreferences;
      const { url, token } = this.tokenService.getToken('pupilPreferences');
      const retryConfig = {
        errorDelay: this.pupilPrefsAPIErrorDelay,
        errorMaxAttempts: this.pupilPrefsAPIErrorMaxAttempts
      };
      const payload = {
        preferences: {
          fontSizeCode: fontSetting.code,
        },
        checkCode: pupil.checkCode
      };
      try {
        this.auditService.addEntry(new PupilPrefsAPICalled());
        await this.azureQueueService.addMessage(queueName, url, token, payload, retryConfig);
        this.auditService.addEntry(new PupilPrefsAPICallSucceeded());
      } catch (error) {
        this.auditService.addEntry(new PupilPrefsAPICallFailed(error));
      }
    } else {
      // Legacy api post functionality not implemented
    }
  }
}
