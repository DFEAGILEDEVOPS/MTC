import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { QuestionService } from '../question/question.service';


@Injectable()
export class RegisterInputService {

  protected questionInputs;
  protected currentQuestion;

  constructor(protected storageService: StorageService, protected questionService: QuestionService) {
    // this.questionInputs = this.storageService.getItem('inputs') || [];
    // this.currentQuestion = this.questionService.getCurrentQuestionNumber();
    // this.questionInputs[this.currentQuestion] = this.questionInputs[this.currentQuestion] || [];
  }

  public initialise() {
    try {
      this.storageService.getItem('inputs');
    } catch (err) {
      this.storageService.setItem('inputs', []);
    }
    this.questionInputs = this.storageService.getItem('inputs');
    this.currentQuestion = this.questionService.getCurrentQuestionNumber();
    this.questionInputs[ this.currentQuestion ] = this.questionInputs[ this.currentQuestion ] || [];
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
    if (!this.questionInputs) { return false; }
    this.questionInputs[ this.currentQuestion ].push({
      input: eventValue,
      eventType: eventType,
      clientInputDate: new Date()
    });
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

  flush() {
    this.storageService.setItem('inputs', this.questionInputs);
  }
}
