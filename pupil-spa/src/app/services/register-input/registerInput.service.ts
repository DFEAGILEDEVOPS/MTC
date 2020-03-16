import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class RegisterInputService {
  constructor(protected storageService: StorageService) {}

  public addEntry(event, questionData) {
    let eventValue;
    if (event.type === 'mousedown') {
      eventValue = this.getMouseButton(event);
    }
    eventValue = eventValue || event.key || '';

    const questionNumber = questionData.questionNumber;
    const factor1 = questionData.factor1;
    const factor2 = questionData.factor2;
    const question = `${factor1}x${factor2}`;

    this.storeEntry(eventValue, event.type, questionNumber, question, event.timeStamp);
  }

  public storeEntry(eventValue: string, eventType: string, questionNumber: number, question: string, eventTimeStamp: number = null) {
    const questionInput = {
      input: eventValue,
      eventType: eventType,
      clientTimestamp:  eventTimeStamp ? (new Date(eventTimeStamp)).toISOString() : (new Date()).toISOString(),
      question: question,
      sequenceNumber: questionNumber
    };
    this.storageService.setInput(questionInput);
  }

  private getMouseButton(event) {
    if (!event.which) {
      /* IE case */
      return (event.button < 2) ? 'left click' : ((event.button === 4) ? 'middle click' : 'right click');
    } else {
      /* All others */
      return (event.which < 2) ? 'left click' : ((event.which === 2) ? 'middle click' : 'right click');
    }
  }
}
