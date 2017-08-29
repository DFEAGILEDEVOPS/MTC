import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-warmup-complete',
  templateUrl: './warmup-complete.component.html',
  styles: []
})
export class WarmupCompleteComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @Output()
  clickEvent: EventEmitter<any> = new EventEmitter();

  onClick() {
    console.log(`warmup-complete(): onClick called()`);
    this.clickEvent.emit(null);
  }

}
