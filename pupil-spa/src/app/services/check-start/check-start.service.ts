import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';
import {
  AuditEntryFactory,
} from '../audit/auditEntry'
import { AzureQueueService, QueueMessageRetryConfig } from '../azure-queue/azure-queue.service';
import { AuditService } from '../audit/audit.service';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { HttpHeaders } from '@angular/common/http';
import { HttpService } from '../http/http.service';

/**
 * Declaration of check start service
 */
@Injectable()
export class CheckStartService {

  checkStartAPIErrorDelay;
  checkStartAPIErrorMaxAttempts;

  constructor(private azureQueueService: AzureQueueService,
              private httpService: HttpService,
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

  public async acknowledge(attemptId: string): Promise<void> {
    this.storageService.setCheckStartAttemptId(attemptId);
    if (this.storageService.getCheckStartAttemptId() !== attemptId) {
      throw new Error('Unable to save check start attempt');
    }
    const { token } = this.tokenService.getToken('checkSubmission');
    await this.httpService.post(`${APP_CONFIG.apiBaseUrl}/check-start`, {
      checkCode: this.storageService.getPupil().checkCode,
      attemptId
    }, new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`), this.checkStartAPIErrorMaxAttempts);
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
    } catch {
      this.auditService.addEntry(this.auditEntryFactory.createCheckStartedAPICallFailed());
    }
  }
}
