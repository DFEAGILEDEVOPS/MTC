import { Component, ViewChild, ElementRef } from '@angular/core';
import { QuestionService } from '../services/question/question.service';

@Component({
    selector: 'app-sound',
    templateUrl: './sound.component.html',
    styleUrls: ['./sound.component.scss'],
    standalone: false
})
export class SoundComponent {
  @ViewChild('endOfQuestionSound', { static: true }) public endOfQuestionSound: ElementRef;
  @ViewChild('timeRunningOutAlertSound', { static: true }) public timeRunningOutAlertSound: ElementRef;

  constructor(private questionService: QuestionService) {
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
