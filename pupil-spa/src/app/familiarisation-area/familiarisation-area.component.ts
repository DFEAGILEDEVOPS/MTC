import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { APP_CONFIG } from '../services/config/config.service';
import { AuditService } from '../services/audit/audit.service';
import { AzureQueueService } from '../services/azure-queue/azure-queue.service';
import { Pupil } from '../pupil';
import { QuestionService } from '../services/question/question.service';
import { StorageService } from '../services/storage/storage.service';
import { TokenService } from '../services/token/token.service';
import {
  AccessArrangements,
  AccessArrangementsConfig,
  accessArrangementsDataKey
} from '../access-arrangements';
import { PupilPrefsAPICalled, PupilPrefsAPICallSucceeded, PupilPrefsAPICallFailed } from '../services/audit/auditEntry';
import { queueNames } from '../services/azure-queue/queue-names';

@Component({
  selector: 'app-familiarisation-area',
  templateUrl: './familiarisation-area.component.html',
  styleUrls: ['./familiarisation-area.component.scss']
})
export class FamiliarisationAreaComponent {
  featureUseHpa;
  pupil: Pupil;
  selectedSize;
  fontSettings;
  pupilPrefsAPIErrorDelay;
  pupilPrefsAPIErrorMaxAttempts;

  constructor(
    private auditService: AuditService,
    private azureQueueService: AzureQueueService,
    private questionService: QuestionService,
    private router: Router,
    private storageService: StorageService,
    private tokenService: TokenService,

) {
    const { featureUseHpa, pupilPrefsAPIErrorDelay, pupilPrefsAPIErrorMaxAttempts } = APP_CONFIG;
    this.featureUseHpa = featureUseHpa;
    this.fontSettings = AccessArrangementsConfig.fontSettings;
    this.pupilPrefsAPIErrorDelay = pupilPrefsAPIErrorDelay;
    this.pupilPrefsAPIErrorMaxAttempts = pupilPrefsAPIErrorMaxAttempts;
    const pupilData = storageService.getItem('pupil');
    this.pupil = new Pupil;
    this.pupil.firstName = pupilData.firstName;
    this.pupil.lastName = pupilData.lastName;
    this.pupil.checkCode = pupilData.checkCode;
  }

  selectionChange(selectedFont) {
    this.selectedSize = selectedFont;
  }

  async onClick() {
    const accessArrangements = new AccessArrangements;
    accessArrangements.fontSize = this.selectedSize || 'regular';
    if (this.featureUseHpa === true) {
      const queueName = queueNames.pupilPreferences;
      const { url, token } = this.tokenService.getToken('pupilPreferences');
      const payload = {
        fontSize: accessArrangements.fontSize,
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
    this.storageService.setItem(accessArrangementsDataKey, accessArrangements);
    if (this.questionService.getConfig().colourContrast) {
      this.router.navigate(['colour-choice']);
    } else {
      this.router.navigate(['access-settings']);
    }
  }

}
