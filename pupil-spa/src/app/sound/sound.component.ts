import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-sound',
  templateUrl: './sound.component.html',
  styleUrls: ['./sound.component.scss']
})
export class SoundComponent implements OnInit {
  @ViewChild('endOfQuestionSound') public endOfQuestionSound: ElementRef;
  @ViewChild('timeRunningOutAlertSound') public timeRunningOutAlertSound: ElementRef;

  constructor() {
  }

  ngOnInit() {
  }

  playEndOfQuestionSound() {
    this.endOfQuestionSound.nativeElement.play();
  }

  playTimeRunningOutAlertSound() {
    this.timeRunningOutAlertSound.nativeElement.play();
  }

}
