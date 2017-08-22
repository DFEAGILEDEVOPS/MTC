import { Injectable, OnDestroy } from '@angular/core';
import { StorageService } from './storage.service';
import { QuestionService} from './question.service';


@Injectable()
export class RegisterInputService implements OnDestroy {

  protected questionInputs = this.storageService.getItem('inputs') || [];
  protected currentQuestion = this.questionService.getCurrentQuestionNumber();
  constructor(protected storageService: StorageService, protected questionService: QuestionService) {
    this.questionInputs[this.currentQuestion] = this.questionInputs[this.currentQuestion] || [];
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
    this.questionInputs[this.currentQuestion].push({
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

  ngOnDestroy() {
    this.storageService.setItem('inputs', this.questionInputs);
  }
}
