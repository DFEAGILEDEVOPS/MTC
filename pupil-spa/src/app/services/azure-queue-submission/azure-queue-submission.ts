import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';
import { AuditService } from '../audit/audit.service';
import { AzureQueueService } from '../azure-queue/azure-queue.service';
import { queueNames } from '../azure-queue/queue-names';
import { TokenService } from '../token/token.service';

@Injectable()
export class AzureQueueSubmissionService {
  featureUseHpa;

  constructor(
    private auditService: AuditService,
    private azureQueueService: AzureQueueService,
    private tokenService: TokenService,
  ) {
    const { featureUseHpa } = APP_CONFIG;
    this.featureUseHpa = featureUseHpa;
  }

  async submitAzureQueueMessage(payload, retryConfig, messageType, auditMessages) {
    if (!this.featureUseHpa === true) {
      return;
    }
    const { APICalled, APICallSucceeded, APICallFailed } = auditMessages;
    const queueName = queueNames.pupilPreferences;
    const { url, token } = this.tokenService.getToken(messageType);
    try {
      this.auditService.addEntry(new APICalled());
      await this.azureQueueService.addMessage(queueName, url, token, payload, retryConfig);
      this.auditService.addEntry(new APICallSucceeded());
    } catch (error) {
      this.auditService.addEntry(new APICallFailed(error));
    }
  }
}
