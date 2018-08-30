import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import { QuestionService } from '../services/question/question.service';
import { Pupil } from '../pupil';
import { AccessArrangements, accessArrangementsDataKey } from '../access-arrangements';
import { Config } from '../config.model';

@Component({
  selector: 'app-familiarisation-area',
  templateUrl: './familiarisation-area.component.html',
  styleUrls: ['./familiarisation-area.component.scss']
})
export class FamiliarisationAreaComponent {
  private pupil: Pupil;
  private selectedSize;

  private fontSettings = [
    { label: 'Very small', val: 'xsmall' },
    { label: 'Small', val: 'small' },
    { label: 'Regular', val: 'regular' },
    { label: 'Large', val: 'large' },
    { label: 'Very large', val: 'xlarge' },
    { label: 'Largest', val: 'xxlarge' }
  ];

  constructor(
    private router: Router,
    private questionService: QuestionService,
    private storageService: StorageService
  ) {
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
