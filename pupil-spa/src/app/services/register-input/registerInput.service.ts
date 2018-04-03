import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { QuestionService } from '../question/question.service';


@Injectable()
export class RegisterInputService {
  public static readonly inputKey = 'inputs';

  constructor(protected storageService: StorageService, protected questionService: QuestionService) {}

  public initialise() {
    this.storageService.setItem(RegisterInputService.inputKey, []);
  }

  public addEntry(event, sequenceNumber: number) {
    let eventValue;
    if (event.type === 'mousedown') {
      eventValue = this.getMouseButton(event);
    }
    eventValue = eventValue || event.key || '';
    this.storeEntry(eventValue, event.type, sequenceNumber);
  }

  public storeEntry(eventValue, eventType, sequenceNumber) {
    let questionInputs = this.storageService.getItem(RegisterInputService.inputKey);
    if (!Array.isArray(questionInputs)) {
      questionInputs = [];
    }

    // Store the input
    questionInputs.push({
      input: eventValue,
      eventType: eventType,
      clientInputDate: new Date(),
      question: sequenceNumber
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
