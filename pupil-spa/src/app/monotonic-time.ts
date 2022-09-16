import { WindowRefService } from './services/window-ref/window-ref.service'

export class MonotonicTime {
  private window: any;
  private readonly timeOrigin: DOMHighResTimeStamp
  private readonly now: DOMHighResTimeStamp
  private readonly date: Date
  private readonly sequenceNumber: number

  constructor (private windowRefService: WindowRefService, sequenceNumber: number) {
    this.window = this.windowRefService.nativeWindow

    // capture current datetime as well.  We will send this back in payload as well as the monotonic time.
    this.date = new Date()

    // a unique sequence number for this date call.  Called from MonotonicDateService (a singleton) - this allows ordering of timestamps
    // on the same millisecond, which is the best that JS can do as timestamps are blunted. (TODO add ref and explain)
    this.sequenceNumber = sequenceNumber

    // Get the monotonic time components if the API is available
    if (this.window.performance && this.window.performance.now && this.window.performance.timeOrigin) {
      this.now = this.window.performance.now()
      this.timeOrigin = this.window.performance.timeOrigin
    }
  }

  public formatAsMilliseconds (): number {
    if (this.timeOrigin !== undefined && this.now !== undefined)  {
      return this.timeOrigin + this.now
    } else {
      return this.date.valueOf()
    }
  }

  public getSequenceNumber (): number {
    return this.sequenceNumber
  }

  public getLegacyDate (): Date {
    return this.date
  }

  public toJSON (): string {
    return JSON.stringify({
      class: this.constructor.name,
      timeOrigin: this.timeOrigin,
      now: this.now,
      legacyDate: this.date.toISOString(),
      sequenceNumber: this.sequenceNumber
    })
  }

  public toString (): string {
    return this.toJSON()
  }
}
