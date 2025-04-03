import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';
import {
  AuditEntryFactory,
} from '../audit/auditEntry'
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
              private auditService: AuditService,
              private auditEntryFactory: AuditEntryFactory) {
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
  public async submit(startButtonClickDateTime: Date): Promise<void> {
    const { url, token } = this.tokenService.getToken('checkStarted');
    // Create a model for the payload
    const payload = this.storageService.getPupil();
    payload.clientCheckStartedAt = startButtonClickDateTime;
    payload.version = 1;
    const retryConfig: QueueMessageRetryConfig = {
      DelayBetweenRetries: this.checkStartAPIErrorDelay,
      MaxAttempts: this.checkStartAPIErrorMaxAttempts
    };

    try {
      this.auditService.addEntry(this.auditEntryFactory.createCheckStartedApiCalled());
      await this.azureQueueService.addMessageToQueue(url, token, payload, retryConfig);
      this.auditService.addEntry(this.auditEntryFactory.createCheckStartedAPICallSucceeded());
    } catch (error) {
      this.auditService.addEntry(this.auditEntryFactory.createCheckStartedAPICallFailed());
    }
  }
}
