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
import { AppUsageService } from '../app-usage/app-usage.service';
import { CompressorService } from '../compressor/compressor.service';
import { CompletedSubmissionStorageKey, ConfigStorageKey, PendingSubmissionStorageKey, StorageKeyPrefix } from '../storage/storageKey';

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
      submissionPendingViewMinDisplay
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
    const checkConfig = this.storageService.getItem(new ConfigStorageKey());
    if (checkConfig.practice) {
      return this.onSuccess(startTime);
    }
    const {url, token, queueName} = this.tokenService.getToken('checkComplete');
    const retryConfig = {
      errorDelay: this.checkSubmissionApiErrorDelay,
      errorMaxAttempts: this.checkSubmissionAPIErrorMaxAttempts
    };
    this.auditService.addEntry(new CheckSubmissionApiCalled());
    const items = this.storageService.getAllItems();
    const payload = this.getPayload(items);
    if (checkConfig.compressCompletedCheck) {
      message = {
        version: 2,
        checkCode: payload['checkCode'],
        schoolUUID: payload['schoolUUID'],
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
   * Get all entries matching a key
   * @param {String} key
   * @param {Object} items
   * @returns {Array}
   */
  getAllEntriesByKey(key: string, items: object): any {
    const matchingKeys =
      Object.keys(items).filter(lsi => lsi.startsWith(key.toString()));
    const sortedMatchingKeys = matchingKeys.sort((a, b) =>
      new Date(items[a].clientTimestamp).getTime() - new Date(items[b].clientTimestamp).getTime()
    );
    const matchingItems = [];
    sortedMatchingKeys.forEach(s => {
      matchingItems.push(items[s]);
    });
    return matchingItems;
  }

  /**
   * Get check payload for submission
   * @param {Object} items
   * @returns {Object}
   */
  getPayload(items: object): object {
    const payload = {
      checkCode: undefined,
      schoolUUID: undefined,
    };
    const includedSingularItems = ['config', 'device', 'pupil', 'questions', 'school', 'tokens'];
    const includedMultipleItems = ['audit', 'inputs', 'answers'];
    includedSingularItems.forEach(i => {
      payload[i] = items[i];
    });
    includedMultipleItems.forEach(i => {
      payload[i] = this.getAllEntriesByKey(i, items);
    });
    payload.checkCode = items && items['pupil'] && items['pupil'].checkCode;
    payload.schoolUUID = items && items['school'] && items['school'].uuid;
    return payload;
  }

  /**
   * On success handler
   * @param {Number} startTime
   * @returns {Promise.<void>}
   */
  async onSuccess(startTime): Promise<void> {
    this.storageService.setItem(new PendingSubmissionStorageKey(), false);
    this.storageService.setItem(new CompletedSubmissionStorageKey(), true);
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
