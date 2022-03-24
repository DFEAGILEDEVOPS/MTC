import { PsLogGeneratorService } from './log-generator.service'
import { IPsLogWriter, PsLogWriter } from './log-writer'
import { PsLogMessageParser } from './message-parser'

export interface IServiceBusMessageLike {
  body: any
}

export class LogService {
  private readonly generator: PsLogGeneratorService
  private readonly writer: IPsLogWriter
  private readonly parser: PsLogMessageParser

  constructor (logWriter?: IPsLogWriter) {
    this.generator = new PsLogGeneratorService()
    this.parser = new PsLogMessageParser()
    this.writer = logWriter ?? new PsLogWriter()
  }

  async create (messages: IServiceBusMessageLike[]): Promise<void> {
    const entries = this.parser.parse(messages)
    const set = this.generator.generate(entries)
    await this.writer.writeToStorage(set)
  }
}
