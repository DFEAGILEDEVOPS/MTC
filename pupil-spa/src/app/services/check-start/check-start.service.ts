import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';
import {
  CheckStartedApiCalled,
  CheckStartedAPICallFailed,
  CheckStartedAPICallSucceeded,
} from '../audit/auditEntry';
import { AzureQueueService, QueueMessageRetryConfig } from '../azure-queue/azure-queue.service';
import { AuditService } from '../audit/audit.service';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';

/**
 * Declaration of check start service
 */
@Injectable()
export class CheckStartService {

  checkStartAPIErrorDelay;
  checkStartAPIErrorMaxAttempts;

  constructor(private azureQueueService: AzureQueueService,
              private storageService: StorageService,
              private tokenService: TokenService,
              private auditService: AuditService) {
    const {
      checkStartAPIErrorDelay,
      checkStartAPIErrorMaxAttempts
    } = APP_CONFIG;
    this.checkStartAPIErrorDelay = checkStartAPIErrorDelay;
    this.checkStartAPIErrorMaxAttempts = checkStartAPIErrorMaxAttempts;
  }

  /**
   * Check start submission
   * @returns {Promise.<void>}
   */
  public async submit(): Promise<void> {
    const { queueName, url, token } = this.tokenService.getToken('checkStarted');
    // Create a model for the payload
    const payload = this.storageService.getPupil();
    payload.clientCheckStartedAt = new Date();
    payload.version = 1;
    const retryConfig: QueueMessageRetryConfig = {
      DelayBetweenRetries: this.checkStartAPIErrorDelay,
      MaxAttempts: this.checkStartAPIErrorMaxAttempts
    };

    try {
      this.auditService.addEntry(new CheckStartedApiCalled());
      await this.azureQueueService.addMessageToQueue(queueName, url, token, payload, retryConfig);
      this.auditService.addEntry(new CheckStartedAPICallSucceeded());
    } catch (error) {
      this.auditService.addEntry(new CheckStartedAPICallFailed(error));
    }
  }
}
