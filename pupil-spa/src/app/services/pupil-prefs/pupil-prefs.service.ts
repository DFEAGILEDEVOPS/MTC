import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';
import { AzureQueueService, QueueMessageRetryConfig } from '../azure-queue/azure-queue.service';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { AccessArrangementsConfig, AccessArrangements } from '../../access-arrangements';
import { Pupil } from '../../pupil';
import { AuditService } from '../audit/audit.service';
import { AuditEntryFactory } from '../audit/auditEntry';

@Injectable()
export class PupilPrefsService {

  pupilPrefsAPIErrorDelay;
  pupilPrefsAPIErrorMaxAttempts;
  accessArrangements: AccessArrangements;
  fontSettings;
  contrastSettings;

  constructor(private azureQueueService: AzureQueueService,
              private storageService: StorageService,
              private tokenService: TokenService,
              private auditService: AuditService,
              private auditEntryFactory: AuditEntryFactory) {
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
    const accessArrangements = this.storageService.getAccessArrangements();
    const fontSetting = this.fontSettings.find(f => f.val === accessArrangements.fontSize);
    const contrastSetting = this.contrastSettings.find(f => f.val === accessArrangements.contrast);
    const pupil = this.storageService.getPupil() as Pupil;
    const inputAssistant = pupil.inputAssistant;
    const {url, token} = this.tokenService.getToken('pupilPreferences');
    const retryConfig: QueueMessageRetryConfig = {
      DelayBetweenRetries: this.pupilPrefsAPIErrorDelay,
      MaxAttempts: this.pupilPrefsAPIErrorMaxAttempts
    };
    const payload = {
      preferences: {
        fontSizeCode: '',
        colourContrastCode: ''
      },
      inputAssistant: {},
      version: 2,
      checkCode: pupil.checkCode
    };
    if (fontSetting) {
      payload.preferences.fontSizeCode = fontSetting.code;
    }
    if (contrastSetting) {
      payload.preferences.colourContrastCode = contrastSetting.code;
    }
    if (inputAssistant) {
      payload.inputAssistant = inputAssistant;
    }
    else {
      payload.inputAssistant = undefined
    }
    try {
      this.auditService.addEntry(this.auditEntryFactory.createPupilPrefsAPICalled());
      await this.azureQueueService.addMessageToQueue(url, token, payload, retryConfig);
      this.auditService.addEntry(this.auditEntryFactory.createPupilPrefsAPICallSucceeded());
    } catch {
      this.auditService.addEntry(this.auditEntryFactory.createPupilPrefsAPICallFailed());
    }
  }

  public loadPupilPrefs() {
    this.accessArrangements = new AccessArrangements();
    const appliedAccessArrangements = this.storageService.getAccessArrangements();
    // Fetch prefs from current session stored within local storage
    this.accessArrangements.fontSize = appliedAccessArrangements && appliedAccessArrangements.fontSize;
    this.accessArrangements.contrast = appliedAccessArrangements && appliedAccessArrangements.contrast;
    if (this.accessArrangements.fontSize && this.accessArrangements.contrast) {
      return;
    }
    // Fetch prefs from check config or assign default values
    const config = this.storageService.getConfig();
    if (!this.accessArrangements.contrast) {
      this.contrastSettings = AccessArrangementsConfig.contrastSettings;
      const contrastSetting = config && this.contrastSettings.find(f => f.code === config.colourContrastCode);
      this.accessArrangements.contrast = (contrastSetting && contrastSetting.val) || 'bow';
    }
    if (!this.accessArrangements?.fontSize) {
      this.fontSettings = AccessArrangementsConfig.fontSettings;
      const fontSetting = config && this.fontSettings.find(f => f.code === config.fontSizeCode);
      this.accessArrangements.fontSize = (fontSetting && fontSetting.val) || 'regular';
    }
    this.storageService.setAccessArrangements(this.accessArrangements);
  }
}
