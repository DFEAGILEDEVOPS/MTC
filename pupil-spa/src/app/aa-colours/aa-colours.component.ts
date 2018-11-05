import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AccessArrangementsConfig,
  AccessArrangements,
  accessArrangementsDataKey
} from '../access-arrangements';
import { StorageService } from '../services/storage/storage.service';
import { RouteService } from '../services/route/route.service';

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
    private routeService: RouteService
  ) {
    this.contrastSettings = AccessArrangementsConfig.contrastSettings;
    this.accessArrangements = this.storageService.getItem(accessArrangementsDataKey) || new AccessArrangements;
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

  onClick() {
    const accessArrangements = new AccessArrangements;
    accessArrangements.contrast = this.selectedContrast || 'bow';
    this.storageService.setItem(accessArrangementsDataKey, accessArrangements);
    if (this.routeService.getPreviousUrl() === '/access-settings') {
      this.router.navigate(['access-settings']);
    } else {
      this.router.navigate(['sign-in-success']);
    }
  }
}
