import { TYPES } from '../../data-access/sql.service'
const sqlService = require('../../data-access/sql.service')
import { ServiceBusClient, ServiceBusSender } from '@azure/service-bus'
const config = require('../../../config')

export interface IUserInfoData {
  identifier: string
  displayName: string
}

export interface IExecPsReportRequest {
  requestedBy: string
  dateTimeRequested: moment.Moment
  jobUuid: string
}

export class PsReportExecDataService {
  private static sbClient: ServiceBusClient
  private static sbSender: ServiceBusSender

  public static async getUsersName (userId: number): Promise<IUserInfoData | undefined> {
    const sql = `
    SELECT TOP (1) [identifier],[displayName] FROM [mtc_admin].[user]
    WHERE id = @userId`
    const params = [
      {
        name: 'userId',
        type: TYPES.Int,
        value: userId
      }
    ]
    const data = await sqlService.readonlyQuery(sql, params)
    if (!Array.isArray(data)) {
      return
    }

    const record = data[0]
    return {
      identifier: record.identifier,
      displayName: record.displayName
    }
  }

  public static async sendPsReportExecMessage (message: IExecPsReportRequest): Promise<void> {
    if (this.sbClient === undefined || this.sbSender === undefined) {
      this.sbClient = new ServiceBusClient(config.ServiceBus.connectionString)
      this.sbSender = this.sbClient.createSender('ps-report-exec')
    }

    return this.sbSender.sendMessages({
      body: message
    })
  }
}
