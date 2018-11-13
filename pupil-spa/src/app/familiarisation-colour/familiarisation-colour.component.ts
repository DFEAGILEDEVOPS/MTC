import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  AccessArrangementsConfig,
  AccessArrangements,
  accessArrangementsDataKey
} from '../access-arrangements';
import { APP_CONFIG } from '../services/config/config.service';
import { StorageService } from '../services/storage/storage.service';
import { RouteService } from '../services/route/route.service';
import { PupilPrefsAPICalled, PupilPrefsAPICallFailed, PupilPrefsAPICallSucceeded } from '../services/audit/auditEntry';
import { queueNames } from '../services/azure-queue/queue-names';
import { TokenService } from '../services/token/token.service';
import { AzureQueueService } from '../services/azure-queue/azure-queue.service';
import { Pupil } from '../pupil';
import { AuditService } from '../services/audit/audit.service';

@Component({
  selector: 'app-familiarisation-colour',
  templateUrl: './familiarisation-colour.component.html',
  styleUrls: ['./familiarisation-colour.component.scss']
})
export class FamiliarisationColourComponent {
  accessArrangements;
  contrastSettings;
  featureUseHpa;
  pupil: Pupil;
  selectedContrast;
  pupilPrefsAPIErrorDelay;
  pupilPrefsAPIErrorMaxAttempts;

  constructor(
    private auditService: AuditService,
    private azureQueueService: AzureQueueService,
    private storageService: StorageService,
    private router: Router,
    private routeService: RouteService,
    private tokenService: TokenService,

  ) {
    const { featureUseHpa, pupilPrefsAPIErrorDelay, pupilPrefsAPIErrorMaxAttempts } = APP_CONFIG;
    this.accessArrangements = new AccessArrangements;
    this.featureUseHpa = featureUseHpa;
    this.contrastSettings = AccessArrangementsConfig.contrastSettings;
    this.pupilPrefsAPIErrorDelay = pupilPrefsAPIErrorDelay;
    this.pupilPrefsAPIErrorMaxAttempts = pupilPrefsAPIErrorMaxAttempts;
    const pupilData = storageService.getItem('pupil');
    this.pupil = new Pupil;
    this.pupil.checkCode = pupilData.checkCode;
    const config = this.storageService.getItem('config');
    const colourContrastSetting = this.contrastSettings.find(f => f.code === config.colourContrastCode);
    this.selectedContrast = (colourContrastSetting && colourContrastSetting.val) || 'bow';
    this.setColourContrast(this.selectedContrast);
  }

  setColourContrast(colourContrastValue) {
    this.accessArrangements.contrast = colourContrastValue;
    this.storageService.setItem(accessArrangementsDataKey, this.accessArrangements);
  }

  selectionChange(selectedContrast) {
    this.selectedContrast = selectedContrast;
  }

  async onClick() {
    this.setColourContrast(this.selectedContrast);
    const colourContrastSetting = this.contrastSettings.find(f => f.val === this.accessArrangements.contrast);
    const colourContrastCode = colourContrastSetting.code;
    await this.submitAzureQueueMessage(colourContrastCode);
    this.storageService.setItem(accessArrangementsDataKey, this.accessArrangements);
    if (this.routeService.getPreviousUrl() === '/access-settings') {
      this.router.navigate(['access-settings']);
    } else {
      this.router.navigate(['sign-in-success']);
    }
  }

  async submitAzureQueueMessage(colourContrastCode) {
    if (this.featureUseHpa === true) {
      const queueName = queueNames.pupilPreferences;
      const { url, token } = this.tokenService.getToken('pupilPreferences');
      const payload = {
        preferences: {
          colourContrastCode: colourContrastCode,
        },
        checkCode: this.pupil.checkCode
      };
      const retryConfig = {
        errorDelay: this.pupilPrefsAPIErrorDelay,
        errorMaxAttempts: this.pupilPrefsAPIErrorMaxAttempts
      };
      try {
        this.auditService.addEntry(new PupilPrefsAPICalled());
        await this.azureQueueService.addMessage(queueName, url, token, payload, retryConfig);
        this.auditService.addEntry(new PupilPrefsAPICallSucceeded());
      } catch (error) {
        this.auditService.addEntry(new PupilPrefsAPICallFailed(error));
      }
    }
  }
}
