import { WindowRefService } from './services/window-ref/window-ref.service'

export interface IMonotonicTimeDto {
  milliseconds: number, // milliseconds since Jan 1 1970. Float.
  legacyDate: Date,
  sequenceNumber: number // for disambiguation.  Number incremented on each call to the MonotonicTimeService.
}

export class MonotonicTime {
  private readonly window: any;
  private  timeOrigin: DOMHighResTimeStamp
  private  now: DOMHighResTimeStamp
  private  date: Date
  private  sequenceNumber: number

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

  public formatAsISOString (): string {
    if (this.timeOrigin !== undefined && this.now !== undefined)  {
      const dt = new Date(this.timeOrigin + this.now)
      return dt.toISOString()
    } else {
      return this.date.toISOString()
    }
  }

  /**
   * Warning: this will lose any decimal part of the milliseconds
   */
  public formatAsDate (): Date {
    return new Date(this.formatAsMilliseconds())
  }

  /**
   * Return a Data Transfer Object - for sending across the network
   */
  public getDto (): IMonotonicTimeDto {
    return {
      milliseconds: this.timeOrigin + this.now,
      legacyDate: this.date,
      sequenceNumber: this.sequenceNumber
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

  public set (date: string|Date, milliseconds: number, sequenceNumber: number): void {
    let newDate: Date

    if (typeof date === 'string') {
      newDate = new Date(date)
    }
    if (date instanceof Date) {
      newDate = date
    }
    if (!(newDate instanceof Date)) {
      throw new Error(`Invalid date: ${date?.toString()}`)
    }
    this.date = newDate
    this.timeOrigin = milliseconds
    this.now = 0 // date lost in conversion, but the sum will be the same.
    this.sequenceNumber = sequenceNumber
    // Note: the MonotonicTimeService, which stores the sequence number, will itself reinitialise the stored sequence number to 0, but
    // this is not likely to be an issue as the purpose of the sequence number is a secondary sort after the primary datetime sort.
  }

  public static comparator (a: MonotonicTime, b: MonotonicTime): number {
    if (a.date.valueOf() < b.date.valueOf()) {
      return -1
    } else if (a.date.valueOf() > b.date.valueOf()) {
      return 1
    } else if (a.date.valueOf() === b.date.valueOf()) {
      return a.sequenceNumber - b.sequenceNumber
    }
    return 0
  }
}
