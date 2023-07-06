import { PsLogSetGeneratorService } from './log-generator.service'
import { type IPsLogWriter, PsLogWriter } from './log-writer'
import { PsLogMessageParser } from './message-parser'
import { type IServiceBusMessageLike } from './service-bus-message-like'

export class LogService {
  private readonly generator: PsLogSetGeneratorService
  private readonly writer: IPsLogWriter
  private readonly parser: PsLogMessageParser

  constructor (logWriter?: IPsLogWriter) {
    this.generator = new PsLogSetGeneratorService()
    this.parser = new PsLogMessageParser()
    this.writer = logWriter ?? new PsLogWriter()
  }

  async create (setId: string, messages: IServiceBusMessageLike[]): Promise<void> {
    // setId must be created and owned by caller
    // create set container if not exists
    // create set files if not exists
    // append messages to set files
    const entries = this.parser.parse(messages)
    const set = this.generator.generate(setId, entries)
    await this.writer.writeToStorage(set)
  }
}
