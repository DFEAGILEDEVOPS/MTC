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

  public addEntry(event, data = null) {
    let eventValue;
    if (event.type === 'mousedown') {
      eventValue = this.getMouseButton(event);
    }
    eventValue = eventValue || event.key || '';

    const document = <Element>event.currentTarget;

    let body;
    let questionNumber = -1;
    let question = '-1x-1';

    if (document) {
      body = document.querySelector('body');
      questionNumber = parseInt((body.getAttribute('data-sequence-number') || '-1'), 10);
      const factor1 = body.getAttribute('data-factor1') || '-1';
      const factor2 = body.getAttribute('data-factor2') || '-1';
      question = `${factor1}x${factor2}`;
    }

    this.storeEntry(eventValue, event.type, questionNumber, question);
  }

  public storeEntry(eventValue: string, eventType: string, questionNumber: number, question: string) {
    // const currentQuestion = this.questionService.getCurrentQuestionNumber();

    let questionInputs = this.storageService.getItem(RegisterInputService.inputKey);
    if (!Array.isArray(questionInputs)) {
      questionInputs = [];
    }

    // Generate the array index from the current question.  Q1 is stored in index 0, and so on.
    let idx = questionNumber - 1;

    // TODO: remove the need for this hack, by removing the requirement to store events in a sub-array
    if (idx < 0) {
      idx = 100; // make it nice and easy to see that the context is wrong.
    }

    // Check we have an array to place the new object into
    if (!Array.isArray(questionInputs[ idx ])) {
      questionInputs[ idx ] = [];
    }

    // Store the input
    questionInputs[ idx ].push({
      input: eventValue,
      eventType: eventType,
      clientInputDate: new Date(),
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
