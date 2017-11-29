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

  public addEntry(event) {
    let eventValue;
    if (event.type === 'mousedown') {
      eventValue = this.getMouseButton(event);
    }
    eventValue = eventValue || event.key || '';
    this.storeEntry(eventValue, event.type);
  }

  public storeEntry(eventValue, eventType) {
    const currentQuestion = this.questionService.getCurrentQuestionNumber();

    let questionInputs = this.storageService.getItem(RegisterInputService.inputKey);
    if (!Array.isArray(questionInputs)) {
      questionInputs = [];
    }

    // Generate the array index from the current question.  Q1 is stored in index 0, and so on.
    const idx = currentQuestion - 1;

    // Check we have an array to place the new object into
    if (!Array.isArray(questionInputs[idx])) {
      questionInputs[idx] = [];
    }

    // Store the input
    questionInputs[ currentQuestion - 1 ].push({
      input: eventValue,
      eventType: eventType,
      clientInputDate: new Date(),
      question: currentQuestion
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
