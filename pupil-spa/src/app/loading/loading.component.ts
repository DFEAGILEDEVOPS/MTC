import { Component, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})

export class LoadingComponent {

  @Input()
  public question = 0;

  @Input()
  public total = 0;

  @Input()
  public loadingTimeout: number;

  @Output()
  timeoutEvent: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.sendTimeoutEvent()
    }, this.loadingTimeout * 1000);
  }

  sendTimeoutEvent() {
    this.timeoutEvent.emit(null);
  }
}
