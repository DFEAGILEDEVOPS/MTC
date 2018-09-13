import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';
import {
  CheckStartedApiCalled,
  CheckStartedAPICallSucceeded,
} from '../audit/auditEntry';
import { AzureQueueService } from '../azure-queue/azure-queue.service';
import { AuditService } from '../audit/audit.service';
import { SubmissionService } from '../submission/submission.service';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';

/**
 * Declaration of check start service
 */
@Injectable()
export class CheckStartService {

  constructor(private azureQueueService: AzureQueueService,
              private submissionService: SubmissionService,
              private storageService: StorageService,
              private tokenService: TokenService,
              private auditService: AuditService) {
  }

  /**
   * Check start submission
   * @returns {Promise.<void>}
   */
  public async submit(): Promise<void> {
    if (APP_CONFIG.featureUseHpa === true) {
      const queueName = 'check-started';
      const { url, token } = this.tokenService.getToken('checkStarted');
      // Create a model for the payload
      const payload = this.storageService.getItem('pupil');
      let message;
      try {
        message = await this.azureQueueService.addMessage(queueName, url, token, payload);
        if (message && message.messageId) {
          this.auditService.addEntry(new CheckStartedAPICallSucceeded());
          this.auditService.addEntry(new CheckStartedApiCalled());
        }
      } catch (error) {
        this.auditService.addEntry(new CheckStartedApiCalled());
        throw new Error(error);
      }
    } else {
      this.submissionService.submitCheckStartData().toPromise()
        .then(() => {
          this.auditService.addEntry(new CheckStartedAPICallSucceeded());
          this.auditService.addEntry(new CheckStartedApiCalled());
        })
        .catch((error) => {
          this.auditService.addEntry(new CheckStartedApiCalled());
        });
    }
  }
}
