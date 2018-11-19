import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AccessArrangementsConfig,
  accessArrangementsDataKey
} from '../access-arrangements';
import { StorageService } from '../services/storage/storage.service';
import { RouteService } from '../services/route/route.service';
import { PupilPrefsService } from '../services/pupil-prefs/pupil-prefs.service';
import { SyncAccessArrangementsService } from '../services/sync-access-arrangements/sync-access-arrangements.service';

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
    private pupilPrefsService: PupilPrefsService,
    private syncAccessArrangementsService: SyncAccessArrangementsService
  ) {
    this.contrastSettings = AccessArrangementsConfig.contrastSettings;
    this.syncAccessArrangementsService.sync();
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
    await this.pupilPrefsService.storePupilPrefs();

    if (this.routeService.getPreviousUrl() === '/access-settings') {
      this.router.navigate(['access-settings']);
    } else {
      this.router.navigate(['sign-in-success']);
    }
  }
}
