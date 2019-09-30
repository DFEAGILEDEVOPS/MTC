import { APP_CONFIG } from '../config/config.service';
import { AuditService } from '../audit/audit.service';
import { AzureQueueService } from '../azure-queue/azure-queue.service';
import {
  CheckSubmissionApiCalled,
  CheckSubmissionAPIFailed,
  CheckSubmissionAPICallSucceeded,
} from '../audit/auditEntry';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { queueNames } from '../azure-queue/queue-names';
import { AppUsageService } from '../app-usage/app-usage.service';
import { CompressorService } from '../compressor/compressor.service';

/**
 * Declaration of check start service
 */
@Injectable()
export class CheckCompleteService {
  public static readonly configStorageKey = 'config';
  checkSubmissionApiErrorDelay;
  checkSubmissionAPIErrorMaxAttempts;
  submissionPendingViewMinDisplay;

  constructor(private auditService: AuditService,
              private azureQueueService: AzureQueueService,
              private router: Router,
              private storageService: StorageService,
              private tokenService: TokenService,
              private appUsageService: AppUsageService) {
    const {
      checkSubmissionApiErrorDelay,
      checkSubmissionAPIErrorMaxAttempts,
      submissionPendingViewMinDisplay,
    } = APP_CONFIG;
    this.checkSubmissionApiErrorDelay = checkSubmissionApiErrorDelay;
    this.checkSubmissionAPIErrorMaxAttempts = checkSubmissionAPIErrorMaxAttempts;
    this.submissionPendingViewMinDisplay = submissionPendingViewMinDisplay;
  }

  /**
   * Sleep function (milliseconds) to provide minimal display time for submission pending screen
   * @param {Number} ms
   * @returns {Promise.<void>}
   */
  private sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check complete submission
   * @param {Number} startTime Date time in milliseconds on the exact moment before check submission is called
   * @returns {Promise.<void>}
   */
  public async submit(startTime): Promise<void> {
    this.appUsageService.store();
    let message;
    const config = this.storageService.getItem('config');
    if (config.practice) {
      return this.onSuccess(startTime);
    }
    const queueName = queueNames.checkComplete;
    const {url, token} = this.tokenService.getToken('checkComplete');
    const retryConfig = {
      errorDelay: this.checkSubmissionApiErrorDelay,
      errorMaxAttempts: this.checkSubmissionAPIErrorMaxAttempts
    };
    this.auditService.addEntry(new CheckSubmissionApiCalled());
    const payload = this.storageService.getAllItems();
    const excludedItems = ['access_token', 'checkstate', 'pending_submission', 'completed_submission'];
    excludedItems.forEach(i => delete payload[i]);
    payload.checkCode = payload && payload.pupil && payload.pupil.checkCode;
    payload.schoolUUID = payload && payload.school && payload.school.uuid
    const checkConfig = this.storageService.getItem(CheckCompleteService.configStorageKey);
    if (checkConfig.compressCompletedCheck) {
      message = {
        version: 2,
        checkCode: payload.checkCode,
        schoolUUID: payload.schoolUUID,
        archive: CompressorService.compress(JSON.stringify(payload))
      };
    } else {
      message = payload;
      message.version = 1;
    }
    try {
      await this.azureQueueService.addMessage(queueName, url, token, message, retryConfig);
      this.auditService.addEntry(new CheckSubmissionAPICallSucceeded());
      this.onSuccess(startTime);
    } catch (error) {
      this.auditService.addEntry(new CheckSubmissionAPIFailed(error));
      if (error.statusCode === 403
        && error.authenticationerrordetail.includes('Signature not valid in the specified time frame')) {
        this.router.navigate(['/session-expired']);
      } else {
        this.router.navigate(['/submission-failed']);
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
}
