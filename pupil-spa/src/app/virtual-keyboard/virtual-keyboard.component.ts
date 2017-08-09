import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-virtual-keyboard',
  templateUrl: './virtual-keyboard.component.html',
  styleUrls: ['./virtual-keyboard.component.scss']
})
export class VirtualKeyboardComponent implements OnInit {

  constructor() { }

  answer = '';
  questionNum = 1;
  factor1 = 7;
  factor2 = 2;
  total = 14;
  num = 2;

  onClickAnswer(number) {
    this.answer = number;
  }

  ngOnInit() {
  }

}
