import { APP_CONFIG } from '../config/config.service';
import { AuditService } from '../audit/audit.service';
import { AzureQueueService, QueueMessageRetryConfig } from '../azure-queue/azure-queue.service';
import { AuditEntryFactory } from '../audit/auditEntry'
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { AppUsageService } from '../app-usage/app-usage.service';
import { CompressorService } from '../compressor/compressor.service';
import { Meta } from '@angular/platform-browser';
import { ApplicationInsightsService } from '../app-insights/app-insights.service';

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
              private appUsageService: AppUsageService,
              private metaService: Meta,
              private auditEntryFactory: AuditEntryFactory,
              private appInsightsService: ApplicationInsightsService) {
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
  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check complete submission
   * @param {Number} startTime Date time in milliseconds on the exact moment before check submission is called
   * @returns {Promise.<void>}
   */
  public async submit(startTime: number): Promise<void> {
    this.appUsageService.store();
    let message: any;
    const checkConfig = this.storageService.getConfig();
    if (checkConfig.practice) {
      return this.onSuccess(startTime);
    }
    const {url, token} = this.tokenService.getToken('checkComplete');
    const retryConfig: QueueMessageRetryConfig = {
      DelayBetweenRetries: this.checkSubmissionApiErrorDelay,
      MaxAttempts: this.checkSubmissionAPIErrorMaxAttempts
    };
    this.auditService.addEntry(this.auditEntryFactory.createCheckSubmissionApiCalled());
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
      await this.azureQueueService.addMessageToQueue(url, token, message, retryConfig);
      this.auditService.addEntry(this.auditEntryFactory.createCheckSubmissionAPICallSucceeded());
      await this.onSuccess(startTime);
    } catch (error) {
      this.appInsightsService.trackException(error);
      this.auditService.addEntry(this.auditEntryFactory.createCheckSubmissionAPIFailed());
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
  getAllEntriesByKey(key: string, items: Record<any, any>): any {
    const matchingKeys =
      Object.keys(items).filter(lsi => lsi.startsWith(key.toString()));
    const sortedMatchingKeys = matchingKeys.sort((a, b) => {
      const diff = new Date(items[a].clientTimestamp).getTime() - new Date(items[b].clientTimestamp).getTime()
      if (diff === 0) {
        const aMonotonicTime = items[a].monotonicTime || items[a].data.monotonicTime
        const bMonotonicTime = items[b].monotonicTime || items[b].data.monotonicTime
        return aMonotonicTime.sequenceNumber - bMonotonicTime.sequenceNumber
      }
      return diff
    });
    const matchingItems = new Array<any>();
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
  getPayload(items: Record<any, any>): Record<string, any> {
    const payload: Record<string, any> = {
      checkCode: '',
      schoolUUID: '',
      buildVersion: ''
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
    payload.buildVersion = this.metaService.getTag('name="build:number"').content
    return payload;
  }

  /**
   * On success handler
   * @param {Number} startTime
   * @returns {Promise.<void>}
   */
  async onSuccess(startTime: number): Promise<void> {
    this.storageService.setPendingSubmission(false);
    this.storageService.setCompletedSubmission(true);
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
