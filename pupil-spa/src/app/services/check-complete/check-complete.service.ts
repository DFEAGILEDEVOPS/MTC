import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';
import {
  CheckSubmissionApiCalled,
  CheckSubmissionAPIFailed,
  CheckSubmissionAPICallSucceeded,
} from '../audit/auditEntry';
import { AzureQueueService } from '../azure-queue/azure-queue.service';
import { AuditService } from '../audit/audit.service';
import { SubmissionService } from '../submission/submission.service';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { Router } from '@angular/router';

/**
 * Declaration of check start service
 */
@Injectable()
export class CheckCompleteService {

  featureUseHpa;
  checkSubmissionApiErrorDelay;
  checkSubmissionAPIErrorMaxAttempts;
  submissionPendingViewMinDisplay;

  constructor(private azureQueueService: AzureQueueService,
              private submissionService: SubmissionService,
              private storageService: StorageService,
              private tokenService: TokenService,
              private auditService: AuditService,
              private router: Router) {
    const { featureUseHpa,
      checkSubmissionApiErrorDelay,
      checkSubmissionAPIErrorMaxAttempts,
      submissionPendingViewMinDisplay,
    } = APP_CONFIG;
    this.featureUseHpa = featureUseHpa;
    this.checkSubmissionApiErrorDelay = checkSubmissionApiErrorDelay;
    this.checkSubmissionAPIErrorMaxAttempts = checkSubmissionAPIErrorMaxAttempts;
    this.submissionPendingViewMinDisplay = submissionPendingViewMinDisplay;
  }

  private sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check complete submission
   * @param {Number} startTime
   * @returns {Promise.<void>}
   */
  public async submit(startTime): Promise<void> {
    if (this.featureUseHpa === true) {
      const queueName = 'check-complete';
      const { url, token } = this.tokenService.getToken('checkComplete');
      const payload = this.storageService.getAllItems();
      const retryConfig = {
        checkSubmissionApiErrorDelay: this.checkSubmissionApiErrorDelay,
        checkSubmissionAPIErrorMaxAttempts: this.checkSubmissionAPIErrorMaxAttempts
      };
      try {
        this.auditService.addEntry(new CheckSubmissionApiCalled());
        await this.azureQueueService.addMessage(queueName, url, token, payload, retryConfig);
        this.auditService.addEntry(new CheckSubmissionAPICallSucceeded());
        await this.onSuccess(startTime);
      } catch (error) {
        const auditEntry = new CheckSubmissionAPIFailed(error);
        await this.onError(auditEntry);
      }
    } else {
      try {
        await this.submissionService.submitData().toPromise();
        this.auditService.addEntry(new CheckSubmissionAPICallSucceeded());
        this.auditService.addEntry(new CheckSubmissionApiCalled());
        await this.onSuccess(startTime);
      } catch (error) {
        const auditEntry = new CheckSubmissionApiCalled();
        await this.onError(auditEntry);
      }
    }
  }

  /**
   * On success handler
   * @param {Number} startTime
   * @returns {Promise.<void>}
   */
  async onSuccess(startTime): Promise<void> {
    this.storageService.setItem('pending_submission', false);
    this.storageService.setItem('completed_submission', true);
    // Display pending screen for the minimum configurable time
    const endTime = Date.now();
    const duration = endTime - startTime;
    const minDisplay = this.submissionPendingViewMinDisplay;
    if (duration < minDisplay) {
      const displayTime = minDisplay - duration;
      await this.sleep(displayTime);
    }
    this.router.navigate(['/check-complete']);
  }

  /**
   * On error handler
   * @param {Object} auditEntry
   * @returns {Promise.<void>}
   */
  async onError(auditEntry): Promise<void> {
    this.auditService.addEntry(auditEntry);
    this.router.navigate(['/submission-failed']);
  }
}
