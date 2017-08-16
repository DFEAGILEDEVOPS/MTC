import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit {
  @Input()
  public factor1 = 0;

  @Input()
  public factor2 = 0;

  @Input()
  public questionTimeoutSecs;

  @Output()
  manualSubmitEvent: EventEmitter<any> = new EventEmitter();

  @Output()
  timeoutEvent: EventEmitter<any> = new EventEmitter();

  public answer = '';
  private submitted = false;
  private timeout;

  constructor() { }

  ngOnInit(){
  }

  ngAfterViewInit() {
    this.timeout = setTimeout(() => {
      this.sendTimeoutEvent()
    }, this.questionTimeoutSecs * 1000);
  }

  public onSubmit() {
    console.log('onSubmit() called');
    return false;
  }

  answerIsLongEnoughToManuallySubmit() {
    if (this.answer.length > 0) return true;
    return false;
  }

  onClickAnswer(number) {
    if (this.answer.length < 5) {
      this.answer = `${this.answer}${number}`;
    }
  }

  onClickBackspace() {
    if (this.answer.length > 0) {
      this.answer = this.answer.substr(0, this.answer.length - 1);
    }
  }

  onClickSubmit() {
    if (this.submitted) {
      console.log('answer already submitted');
      return false;
    }
    if (!this.answerIsLongEnoughToManuallySubmit()) {
      console.log('answer not provided');
      return false;
    }
    // Prevent the default timeout from firing later
    if (this.timeout) {
      console.log(`Clearing timeout: ${this.timeout}`);
      clearTimeout(this.timeout)
    }
    console.log(`submitting answer ${this.answer}`);
    this.manualSubmitEvent.emit(this.answer);
    this.submitted = true;
  }

  sendTimeoutEvent() {
    if (this.submitted) {
      console.log('sendTimeout(): answer already submitted');
      return false;
    }
    console.log(`question.component: sendTimeoutEvent(): ${this.answer}`);
    this.timeoutEvent.emit(this.answer);
    this.submitted = true;
  }

}
