import { Injectable } from '@angular/core';
import { MonotonicTime } from '../../monotonic-time'
import { WindowRefService } from '../window-ref/window-ref.service'

/**
 * A handy service class to handle dependency injection and to store an incrementing sequence number that
 * can be stored in the MonotonicTime class to aid sorting later, e.g. when 2 events happen on the same millisecond.
 */
@Injectable({
  providedIn: 'root' // singleton service
})
export class MonotonicTimeService {
  /**
   * Send a unique sequence number to MonotonicTime each time `getMonotonicTime()` is called to aid later event sequencing.
   * @private
   */
  private sequenceNumber = 0

  constructor(private windowRefService: WindowRefService) {
  }

  getMonotonicDateTime(): MonotonicTime {
    return new MonotonicTime(this.windowRefService, this.sequenceNumber++)
  }
}
