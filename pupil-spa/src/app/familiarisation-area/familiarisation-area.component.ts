import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { APP_CONFIG } from '../services/config/config.service';
import { AzureQueueSubmissionService } from '../services/azure-queue-submission/azure-queue-submission';
import { Pupil } from '../pupil';
import { QuestionService } from '../services/question/question.service';
import { StorageService } from '../services/storage/storage.service';
import {
  AccessArrangements,
  AccessArrangementsConfig,
  accessArrangementsDataKey
} from '../access-arrangements';
import { PupilPrefsAPICalled, PupilPrefsAPICallSucceeded, PupilPrefsAPICallFailed } from '../services/audit/auditEntry';

@Component({
  selector: 'app-familiarisation-area',
  templateUrl: './familiarisation-area.component.html',
  styleUrls: ['./familiarisation-area.component.scss']
})
export class FamiliarisationAreaComponent {
  accessArrangements;
  pupil: Pupil;
  selectedSize;
  fontSettings;
  pupilPrefsAPIErrorDelay;
  pupilPrefsAPIErrorMaxAttempts;

  constructor(
    private azureQueueSubmissionService: AzureQueueSubmissionService,
    private questionService: QuestionService,
    private router: Router,
    private storageService: StorageService,
) {
    const { pupilPrefsAPIErrorDelay, pupilPrefsAPIErrorMaxAttempts } = APP_CONFIG;
    this.accessArrangements = new AccessArrangements;
    this.fontSettings = AccessArrangementsConfig.fontSettings;
    this.pupilPrefsAPIErrorDelay = pupilPrefsAPIErrorDelay;
    this.pupilPrefsAPIErrorMaxAttempts = pupilPrefsAPIErrorMaxAttempts;
    const pupilData = storageService.getItem('pupil');
    this.pupil = new Pupil;
    this.pupil.firstName = pupilData.firstName;
    this.pupil.lastName = pupilData.lastName;
    this.pupil.checkCode = pupilData.checkCode;
    const config = this.storageService.getItem('config');
    const fontSetting = this.fontSettings.find(f => f.code === config.fontSizeCode);
    this.selectedSize = (fontSetting && fontSetting.val) || 'regular';
    this.setFontSize(this.selectedSize);
  }

  setFontSize(fontValue) {
    this.accessArrangements.fontSize = fontValue;
    this.storageService.setItem(accessArrangementsDataKey, this.accessArrangements);
  }

    selectionChange(selectedFont) {
    this.selectedSize = selectedFont;
  }

  async onClick() {
    this.setFontSize(this.selectedSize);
    const fontSetting = this.fontSettings.find(f => f.val === this.accessArrangements.fontSize);
    const fontCode = fontSetting.code;
    const payload = {
      preferences: {
        fontSizeCode: fontCode,
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
    if (this.questionService.getConfig().colourContrast) {
      this.router.navigate(['colour-choice']);
    } else {
      this.router.navigate(['access-settings']);
    }
  }
}
