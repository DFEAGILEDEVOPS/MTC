import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';
import {
  CheckStartedApiCalled,
  CheckStartedAPICallFailed,
  CheckStartedAPICallSucceeded,
} from '../audit/auditEntry';
import { AzureQueueService } from '../azure-queue/azure-queue.service';
import { AuditService } from '../audit/audit.service';
import { SubmissionService } from '../submission/submission.service';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { queueNames } from '../azure-queue/queue-names';

/**
 * Declaration of check start service
 */
@Injectable()
export class CheckStartService {

  featureUseHpa;
  checkStartAPIErrorDelay;
  checkStartAPIErrorMaxAttempts;

  constructor(private azureQueueService: AzureQueueService,
              private submissionService: SubmissionService,
              private storageService: StorageService,
              private tokenService: TokenService,
              private auditService: AuditService) {
    const { featureUseHpa,
      checkStartAPIErrorDelay,
      checkStartAPIErrorMaxAttempts
    } = APP_CONFIG;
    this.featureUseHpa = featureUseHpa;
    this.checkStartAPIErrorDelay = checkStartAPIErrorDelay;
    this.checkStartAPIErrorMaxAttempts = checkStartAPIErrorMaxAttempts;
  }

  /**
   * Check start submission
   * @returns {Promise.<void>}
   */
  public async submit(): Promise<void> {
    if (this.featureUseHpa === true) {
      const queueName = queueNames.checkStarted;
      const { url, token } = this.tokenService.getToken('checkStarted');
      // Create a model for the payload
      const payload = this.storageService.getItem('pupil');
      const config = this.storageService.getItem('config');
      payload.clientCheckStartedAt = new Date();
      payload.practice = config.practice;
      const retryConfig = {
        errorDelay: this.checkStartAPIErrorDelay,
        errorMaxAttempts: this.checkStartAPIErrorMaxAttempts
      };
      try {
        this.auditService.addEntry(new CheckStartedApiCalled());
        await this.azureQueueService.addMessage(queueName, url, token, payload, retryConfig);
        this.auditService.addEntry(new CheckStartedAPICallSucceeded());
      } catch (error) {
        this.auditService.addEntry(new CheckStartedAPICallFailed(error));
      }
    } else {
      try {
        await this.submissionService.submitCheckStartData().toPromise();
        this.auditService.addEntry(new CheckStartedAPICallSucceeded());
        this.auditService.addEntry(new CheckStartedApiCalled());
      } catch (error) {
        this.auditService.addEntry(new CheckStartedApiCalled());
      }
    }
  }
}
