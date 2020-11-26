import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class RegisterInputService {
  constructor(protected storageService: StorageService) {}

  public storeEntry(eventValue: string, eventType: string, questionNumber: number, question: string, eventTimeStamp: number = null) {
    // event.timestamp is now being changed to be a DOMHiResTimestamp
    const questionInput = {
      input: eventValue,
      eventType: eventType,
      clientTimestamp: (new Date()).toISOString(),
      question: question,
      sequenceNumber: questionNumber
    };
    this.storageService.setInput(questionInput);
  }
}
