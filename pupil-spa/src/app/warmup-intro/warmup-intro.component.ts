import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-warmup-intro',
  templateUrl: './warmup-intro.component.html',
  styleUrls: ['./warmup-intro.component.css']
})
export class WarmupIntroComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @Output()
  clickEvent: EventEmitter<any> = new EventEmitter();

  onClick() {
    this.clickEvent.emit(null);
  }

}
