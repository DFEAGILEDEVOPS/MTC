import * as azure from 'azure-storage'
import moment = require('moment')

const addPermissions = azure.QueueUtilities.SharedAccessPermissions.ADD

export interface IQueueService {
  generateSharedAccessSignature (queueName: string, sharedAccessPolicy: azure.common.SharedAccessPolicy): string
  getUrl (queue: string, sasToken?: string | undefined, primary?: boolean | undefined): string
}

export class SasToken {
  constructor (token: string, url: string) {
    this.token = token
    this.url = url
  }
  token: string
  url: string
}

export class SasTokenService {
  private qService: IQueueService
  constructor (queueService?: IQueueService) {
    if (!queueService) {
      this.qService = azure.createQueueService()
    } else {
      this.qService = queueService
    }
  }

  generateSasToken (queueName: string, expiryDate: moment.Moment): SasToken {
    if (!moment.isMoment(expiryDate) || !expiryDate.isValid()) {
      throw new Error('Invalid expiryDate')
    }

    // Create a SAS token that expires in an hour
    // Set start time to five minutes ago to avoid clock skew.
    const startDate = new Date()
    startDate.setMinutes(startDate.getMinutes() - 5)

    const sharedAccessPolicy = {
      AccessPolicy: {
        Permissions: addPermissions,
        Start: startDate,
        Expiry: expiryDate.toDate()
      }
    }
    const sasToken = this.qService.generateSharedAccessSignature(queueName, sharedAccessPolicy)
    const url = this.qService.getUrl(queueName)

    return new SasToken(sasToken, url)
  }
}
