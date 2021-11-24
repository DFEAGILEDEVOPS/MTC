import { CompressionService, ICompressionService } from '../../common/compression-service'
import { validate as validateUuid } from 'uuid'
import { IReceivedCheckPayloadDataService, ReceivedCheckPayloadDataService } from './received-check-payload.data.service'

export class ReceivedCheckPayloadService {
  private readonly compressionService: ICompressionService
  private readonly dataService: IReceivedCheckPayloadDataService

  constructor (compressionService?: ICompressionService, dataService?: IReceivedCheckPayloadDataService) {
    this.compressionService = compressionService ?? new CompressionService()
    this.dataService = dataService ?? new ReceivedCheckPayloadDataService()
  }

  async fetch (checkCode: string): Promise<string> {
    if (checkCode === '') {
      throw new Error('checkCode is required')
    }
    if (!validateUuid(checkCode)) {
      throw new Error('checkCode is not a valid UUID')
    }
    const archive = await this.dataService.fetchCompressedArchive(checkCode)
    if (archive === undefined) return ''
    const decompressed = this.compressionService.decompress(archive)
    return decompressed
  }
}
