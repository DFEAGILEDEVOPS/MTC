import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';
import { AzureQueueService } from '../azure-queue/azure-queue.service';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { queueNames } from '../azure-queue/queue-names';
import { accessArrangementsDataKey, AccessArrangementsConfig } from '../../access-arrangements';
import { Pupil } from '../../pupil';
import { AuditService } from '../audit/audit.service';
import { PupilPrefsAPICalled, PupilPrefsAPICallSucceeded, PupilPrefsAPICallFailed } from '../audit/auditEntry';

@Injectable()
export class PupilPrefsSubmissionService {

  pupilPrefsAPIErrorDelay;
  pupilPrefsAPIErrorMaxAttempts;
  fontSettings;
  contrastSettings;

  constructor(private azureQueueService: AzureQueueService,
              private storageService: StorageService,
              private tokenService: TokenService,
              private auditService: AuditService) {
    const {
      pupilPrefsAPIErrorDelay,
      pupilPrefsAPIErrorMaxAttempts
    } = APP_CONFIG;
    this.pupilPrefsAPIErrorDelay = pupilPrefsAPIErrorDelay;
    this.pupilPrefsAPIErrorMaxAttempts = pupilPrefsAPIErrorMaxAttempts;
    this.fontSettings = AccessArrangementsConfig.fontSettings;
    this.contrastSettings = AccessArrangementsConfig.contrastSettings;
  }

  public async storePupilPrefs() {
    const accessArrangements = this.storageService.getItem(accessArrangementsDataKey);
    const fontSetting = this.fontSettings.find(f => f.val === accessArrangements.fontSize);
    const contrastSetting = this.contrastSettings.find(f => f.val === accessArrangements.contrast);
    const pupil = this.storageService.getItem('pupil') as Pupil;
    const queueName = queueNames.pupilPreferences;
    const {url, token} = this.tokenService.getToken('pupilPreferences');
    const retryConfig = {
      errorDelay: this.pupilPrefsAPIErrorDelay,
      errorMaxAttempts: this.pupilPrefsAPIErrorMaxAttempts
    };
    const payload = {
      preferences: {
        fontSizeCode: null,
        colourContrastCode: null
      },
      checkCode: pupil.checkCode,
      version: 1
    };
    if (fontSetting) {
      payload.preferences.fontSizeCode = fontSetting.code;
    }
    if (contrastSetting) {
      payload.preferences.colourContrastCode = contrastSetting.code;
    }
    try {
      this.auditService.addEntry(new PupilPrefsAPICalled());
      await this.azureQueueService.addMessage(queueName, url, token, payload, retryConfig);
      this.auditService.addEntry(new PupilPrefsAPICallSucceeded());
    } catch (error) {
      this.auditService.addEntry(new PupilPrefsAPICallFailed(error));
    }
  }
}
