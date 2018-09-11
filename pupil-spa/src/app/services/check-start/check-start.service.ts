import { Injectable } from '@angular/core';
import {
  CheckStartedApiCalled,
  CheckStartedAPICallSucceeded,
} from '../audit/auditEntry';
import { AzureQueueService } from '../azure-queue/azure-queue.service';
import { AuditService } from '../audit/audit.service';
import { SubmissionService } from '../submission/submission.service';
import { StorageService } from '../storage/storage.service';

/**
 * Declaration of check start service
 */
@Injectable()
export class CheckStartService {

  constructor(private azureQueueService: AzureQueueService,
              private submissionService: SubmissionService,
              private storageService: StorageService,
              private auditService: AuditService) {
  }

  /**
   * Check start submission
   * @returns {Promise.<void>}
   */
  public async submit(): Promise<void> {
    const payload  = this.storageService.getItem('pupil');
    await this.azureQueueService.addMessage('check-started', 'checkStarted', payload);
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
