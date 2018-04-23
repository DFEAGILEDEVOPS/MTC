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

    let question = '0x0';
    let questionNumber = 0;

    if (event.type === 'mousedown' || event.type === 'touchstart') {
      // We can determine the question being asked and the sequence number from the data-* attributes on the
      // virtual keyboard.  This means we do not have to ask the question service which question is it now
      // showing - a technique that is prone to race conditions.
      questionNumber = parseInt(event.target.attributes['data-sequence-number'].value, 10);
      const factor1 = event.target.attributes['data-factor1'].value;
      const factor2 = event.target.attributes['data-factor2'].value;
      question = `${factor1}x${factor2}`;
    } else {
      // Key presses have a target attribute of <body> so we cannot use the `target`
      // element to pick up the question... so they must be passed in as context from the
      // question component.
      questionNumber = data.sequenceNumber;
      question = data.question;
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
    const idx = questionNumber - 1;

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
