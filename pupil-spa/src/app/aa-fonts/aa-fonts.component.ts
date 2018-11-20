import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

import { Pupil } from '../pupil';
import { QuestionService } from '../services/question/question.service';
import { StorageService } from '../services/storage/storage.service';
import {
  AccessArrangementsConfig,
  accessArrangementsDataKey
} from '../access-arrangements';
import { RouteService } from '../services/route/route.service';
import { PupilPrefsService } from '../services/pupil-prefs/pupil-prefs.service';
import { PupilPrefsSyncService } from '../services/pupil-prefs-sync/pupil-prefs-sync.service';

@Component({
  selector: 'app-aa-fonts',
  templateUrl: './aa-fonts.component.html',
  styleUrls: ['./aa-fonts.component.scss']
})
export class AAFontsComponent {
  pupil: Pupil;
  validSelection = false;
  selectedSize;
  fontSettings;
  accessArrangements;

  constructor(
    private routeService: RouteService,
    private questionService: QuestionService,
    private router: Router,
    private storageService: StorageService,
    private pupilPrefsService: PupilPrefsService,
    private pupilPrefsSyncService: PupilPrefsSyncService,
) {
    this.fontSettings = AccessArrangementsConfig.fontSettings;
    this.pupilPrefsSyncService.sync();
    this.accessArrangements = this.storageService.getItem(accessArrangementsDataKey);
    this.selectedSize = this.accessArrangements.fontSize || 'regular';
    this.checkValidSelection();

    this.pupil = storageService.getItem('pupil') as Pupil;
  }

  selectionChange(selectedFont) {
    this.selectedSize = selectedFont;
    this.checkValidSelection();
  }

  async onClick() {
    this.accessArrangements.fontSize = this.selectedSize;
    this.storageService.setItem(accessArrangementsDataKey, this.accessArrangements);
    await this.pupilPrefsService.storePupilPrefs();

    if (this.routeService.getPreviousUrl() === '/access-settings') {
      this.router.navigate(['access-settings']);
    } else {
      if (this.questionService.getConfig().colourContrast) {
        this.router.navigate(['colour-choice']);
      } else {
        this.router.navigate(['sign-in-success']);
      }
    }
  }

  @HostListener('window:resize')
  checkValidSelection() {
    const width = window.innerWidth;
    if (width < 641 && (this.selectedSize === 'large' || this.selectedSize === 'xlarge' || this.selectedSize === 'xxlarge')) {
      this.validSelection = false;
    } else if (width < 720 && (this.selectedSize === 'xlarge' || this.selectedSize === 'xxlarge')) {
      this.validSelection = false;
    } else {
      this.validSelection = true;
    }
  }
}
