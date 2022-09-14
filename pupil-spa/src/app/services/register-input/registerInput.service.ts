import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class RegisterInputService {
  constructor(protected storageService: StorageService) {}

  public storeEntry(eventValue: string, eventType: string, questionNumber: number, question: string, eventTimeStamp: number = null) {
    // event.timestamp is now being changed to be a DOMHiResTimestamp
    const eventDate = eventTimeStamp !== null ? new Date(eventTimeStamp) : new Date()
    const questionInput = {
      input: eventValue,
      eventType: eventType,
      clientTimestamp: eventDate.toISOString(),
      question: question,
      sequenceNumber: questionNumber
    };
    this.storageService.setInput(questionInput);
  }
}
