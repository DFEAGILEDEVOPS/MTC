import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import { QuestionService } from '../services/question/question.service';
import { Pupil } from '../pupil';
import { Config } from '../config.model';
import {
  AccessArrangements,
  AccessArrangementsConfig,
  accessArrangementsDataKey
} from '../access-arrangements';

@Component({
  selector: 'app-familiarisation-area',
  templateUrl: './familiarisation-area.component.html',
  styleUrls: ['./familiarisation-area.component.scss']
})
export class FamiliarisationAreaComponent {
  private pupil: Pupil;
  private selectedSize;
  private fontSettings;

  constructor(
    private router: Router,
    private questionService: QuestionService,
    private storageService: StorageService
  ) {
    this.fontSettings = AccessArrangementsConfig.fontSettings;

    const pupilData = storageService.getItem('pupil');
    this.pupil = new Pupil;
    this.pupil.firstName = pupilData.firstName;
    this.pupil.lastName = pupilData.lastName;
  }

  selectionChange(selectedFont) {
    this.selectedSize = selectedFont;
  }

  onClick() {
    const accessArrangements = new AccessArrangements;
    accessArrangements.fontSize = this.selectedSize || 'regular';
    this.storageService.setItem(accessArrangementsDataKey, accessArrangements);

    if (this.questionService.getConfig().colourContrast) {
      this.router.navigate(['colour-choice']);
    } else {
      this.router.navigate(['access-settings']);
    }
  }

}
