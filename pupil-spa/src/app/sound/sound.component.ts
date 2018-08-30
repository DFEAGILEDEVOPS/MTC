import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { QuestionService } from '../services/question/question.service';

@Component({
  selector: 'app-sound',
  templateUrl: './sound.component.html',
  styleUrls: ['./sound.component.scss']
})
export class SoundComponent implements OnInit {
  @ViewChild('endOfQuestionSound') public endOfQuestionSound: ElementRef;
  @ViewChild('timeRunningOutAlertSound') public timeRunningOutAlertSound: ElementRef;

  constructor(private questionService: QuestionService) {
  }

  ngOnInit() {
  }

  playEndOfQuestionSound() {
    if (this.questionService.getConfig().audibleSounds) {
      this.endOfQuestionSound.nativeElement.play();
    }
  }

  playTimeRunningOutAlertSound() {
    if (this.questionService.getConfig().audibleSounds) {
      this.timeRunningOutAlertSound.nativeElement.play();
    }
  }

}
