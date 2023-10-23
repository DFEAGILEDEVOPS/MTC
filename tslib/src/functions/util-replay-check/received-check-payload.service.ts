import { CompressionService, type ICompressionService } from '../../common/compression-service'
import { validate as validateUuid } from 'uuid'
import { type IReceivedCheckPayloadDataService, ReceivedCheckPayloadDataService } from './received-check-payload.data.service'
import { type SubmittedCheckMessageV2 } from '../../schemas/models'

export class ReceivedCheckPayloadService {
  private readonly compressionService: ICompressionService
  private readonly dataService: IReceivedCheckPayloadDataService

  constructor (compressionService?: ICompressionService, dataService?: IReceivedCheckPayloadDataService) {
    this.compressionService = compressionService ?? new CompressionService()
    this.dataService = dataService ?? new ReceivedCheckPayloadDataService()
  }

  async fetch (checkCodes: string[]): Promise<SubmittedCheckMessageV2[]> {
    if (checkCodes.length === 0) {
      throw new Error('at least 1 checkCode is required')
    }

    for (let index = 0; index < checkCodes.length; index++) {
      const checkCode = checkCodes[index]
      if (!validateUuid(checkCode)) {
        throw new Error(`checkCode '${checkCode}' is not a valid UUID`)
      }
    }

    const archives = await this.dataService.fetchCompressedArchives(checkCodes)
    console.log(`found ${archives.length} archives`)
    if (archives === undefined || archives.length === 0) return []
    const decompressedArchives = archives.map(a => this.compressionService.decompressFromUTF16(a))
    const payloads: SubmittedCheckMessageV2[] = []
    for (let index = 0; index < decompressedArchives.length; index++) {
      const da = decompressedArchives[index]
      const jsonData = JSON.parse(da)
      payloads.push({
        version: 2,
        checkCode: jsonData.checkCode,
        schoolUUID: jsonData.schoolUUID,
        archive: archives[index]
      })
    }
    return payloads
  }

  async fetchBySchool (schoolUuid: string): Promise<SubmittedCheckMessageV2[]> {
    if (schoolUuid === '') {
      throw new Error('schoolUuid is required')
    }
    if (!validateUuid(schoolUuid)) {
      throw new Error('schoolUuid is not a valid UUID')
    }
    const response = await this.dataService.fetchArchivesForSchool(schoolUuid)
    if (response.length === 0) return []
    const toReturn: SubmittedCheckMessageV2[] = response.map(item => {
      return {
        version: 2,
        checkCode: item.checkCode,
        schoolUUID: schoolUuid,
        archive: item.archive
      }
    })
    return toReturn
  }
}
