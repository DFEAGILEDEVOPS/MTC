import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { MonotonicTimeService } from '../monotonic-time/monotonic-time.service'

@Injectable()
export class RegisterInputService {
  constructor(protected storageService: StorageService,
              protected monotonicTimeService: MonotonicTimeService) {}

  public storeEntry(eventValue: string, eventType: string, questionNumber: number, question: string, eventTimeStamp: number = null) {
    // event.timestamp is now being changed to be a DOMHiResTimestamp
    const monotonicTime = this.monotonicTimeService.getMonotonicDateTime()
    let eventDate: Date
    if (eventTimeStamp === null) {
      eventDate = monotonicTime.getLegacyDate()
    } else {
      eventDate = new Date(eventTimeStamp)
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
