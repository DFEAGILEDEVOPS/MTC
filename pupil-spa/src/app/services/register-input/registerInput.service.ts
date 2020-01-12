import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class RegisterInputService {
  public static readonly inputKey = 'inputs';

  constructor(protected storageService: StorageService) {}

  public initialise() {
    this.storageService.setItem(RegisterInputService.inputKey, []);
  }

  public addEntry(event, data) {
    let eventValue;
    if (event.type === 'mousedown') {
      eventValue = this.getMouseButton(event);
    }
    eventValue = eventValue || event.key || '';

    const questionNumber = data.questionNumber;
    const factor1 = data.factor1;
    const factor2 = data.factor2;
    const question = `${factor1}x${factor2}`;

    this.storeEntry(eventValue, event.type, questionNumber, question);
  }

  public storeEntry(eventValue: string, eventType: string, questionNumber: number, question: string) {
    let questionInputs = this.storageService.getItem(RegisterInputService.inputKey);
    if (!Array.isArray(questionInputs)) {
      questionInputs = [];
    }

    // Store the input
    questionInputs.push({
      input: eventValue,
      eventType: eventType,
      clientTimestamp: new Date(),
      question: question,
      sequenceNumber: questionNumber
    });

    this.storageService.setItem(RegisterInputService.inputKey, questionInputs);
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
