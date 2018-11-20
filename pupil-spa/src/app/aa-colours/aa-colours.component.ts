import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AccessArrangementsConfig,
  accessArrangementsDataKey
} from '../access-arrangements';
import { StorageService } from '../services/storage/storage.service';
import { RouteService } from '../services/route/route.service';
import { PupilPrefsSubmissionService } from '../services/pupil-prefs-submission/pupil-prefs-submission.service';
import { PupilPrefsSyncService } from '../services/pupil-prefs-sync/pupil-prefs-sync.service';

@Component({
  selector: 'app-aa-colours',
  templateUrl: './aa-colours.component.html',
  styleUrls: ['./aa-colours.component.scss']
})
export class AAColoursComponent implements OnInit {
  selectedContrast;
  contrastSettings;
  accessArrangements;
  backLinkUrl;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private routeService: RouteService,
    private pupilPrefsSubmissionService: PupilPrefsSubmissionService,
    private pupilPrefsSyncService: PupilPrefsSyncService
  ) {
    this.contrastSettings = AccessArrangementsConfig.contrastSettings;
    this.pupilPrefsSyncService.sync();
    this.accessArrangements = this.storageService.getItem(accessArrangementsDataKey);
    this.selectedContrast = this.accessArrangements.contrast || 'bow';
  }

  ngOnInit() {
    const validBackLinks = ['/access-settings', '/font-choice'];
    if (validBackLinks.indexOf(this.routeService.getPreviousUrl()) !== -1) {
      this.backLinkUrl = this.routeService.getPreviousUrl();
    }
  }


  selectionChange(selectedContrast) {
    this.selectedContrast = selectedContrast;
  }

  async onClick() {
    this.accessArrangements.contrast = this.selectedContrast;
    this.storageService.setItem(accessArrangementsDataKey, this.accessArrangements);
    await this.pupilPrefsSubmissionService.storePupilPrefs();

    if (this.routeService.getPreviousUrl() === '/access-settings') {
      this.router.navigate(['access-settings']);
    } else {
      this.router.navigate(['sign-in-success']);
    }
  }
}
