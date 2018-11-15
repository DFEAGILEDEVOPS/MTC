import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  AccessArrangementsConfig,
  AccessArrangements,
  accessArrangementsDataKey
} from '../access-arrangements';
import { APP_CONFIG } from '../services/config/config.service';
import { AzureQueueSubmissionService } from '../services/azure-queue-submission/azure-queue-submission';
import { Pupil } from '../pupil';
import { PupilPrefsAPICalled, PupilPrefsAPICallFailed, PupilPrefsAPICallSucceeded } from '../services/audit/auditEntry';
import { RouteService } from '../services/route/route.service';
import { StorageService } from '../services/storage/storage.service';

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
    private azureQueueSubmissionService: AzureQueueSubmissionService,
    private storageService: StorageService,
    private router: Router,
    private routeService: RouteService,
  ) {
    const { pupilPrefsAPIErrorDelay, pupilPrefsAPIErrorMaxAttempts } = APP_CONFIG;
    this.accessArrangements = new AccessArrangements;
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
    const auditMessages = {
      APICalled: PupilPrefsAPICalled,
      APICallSucceeded: PupilPrefsAPICallSucceeded,
      APICallFailed: PupilPrefsAPICallFailed
    };
    await this.azureQueueSubmissionService.submitAzureQueueMessage(payload, retryConfig, 'pupilPreferences', auditMessages);
    this.storageService.setItem(accessArrangementsDataKey, this.accessArrangements);
    if (this.routeService.getPreviousUrl() === '/access-settings') {
      this.router.navigate(['access-settings']);
    } else {
      this.router.navigate(['sign-in-success']);
    }
  }
}
