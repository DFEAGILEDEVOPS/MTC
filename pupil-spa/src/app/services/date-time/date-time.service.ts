import { Injectable } from '@angular/core';
import { WindowRefService } from '../window-ref/window-ref.service'
import { MonotonicTime } from '../../monotonic-time'

@Injectable({
  providedIn: 'root'
})
export class DateTimeService {
  protected window: any;
  private sequenceNumber: number = 0

  constructor(private windowRefService: WindowRefService) {
    this.window = windowRefService.nativeWindow
  }

  public getCurrentMonotonicDateTime (): MonotonicTime {
    this.sequenceNumber += 1
    return new MonotonicTime(this.window, this.sequenceNumber)
  }
}
