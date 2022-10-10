import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { MonotonicTimeService } from '../monotonic-time/monotonic-time.service'

@Injectable()
export class RegisterInputService {
  constructor(protected storageService: StorageService,
              protected monotonicTimeService: MonotonicTimeService) {}

  public storeEntry(eventValue: string, eventType: string, questionNumber: number, question: string, eventTimeStamp: number = null) {
    const monotonicTime = this.monotonicTimeService.getMonotonicDateTime()
    let eventDate: Date
    if (eventTimeStamp === null) {
      eventDate = monotonicTime.getLegacyDate()
    } else {
      // In theory, and AIUI, this ought to work.  It doesn't - it can be several hours out.
      // eventDate = new Date(Math.round(eventTimeStamp + performance.timeOrigin))
      // Here is the fix:
      eventDate = monotonicTime.getLegacyDate()
    }
    const questionInput = {
      input: eventValue,
      eventType: eventType,
      clientTimestamp: eventDate.toISOString(),
      question: question,
      sequenceNumber: questionNumber,
      monotonicTime: monotonicTime.getDto()
    };
    this.storageService.setInput(questionInput);
  }
}
