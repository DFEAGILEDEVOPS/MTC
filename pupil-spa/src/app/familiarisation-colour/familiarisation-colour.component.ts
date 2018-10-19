import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Pupil } from '../pupil';
import {
  AccessArrangementsConfig,
  AccessArrangements,
  accessArrangementsDataKey
} from '../access-arrangements';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-familiarisation-colour',
  templateUrl: './familiarisation-colour.component.html',
  styleUrls: ['./familiarisation-colour.component.scss']
})
export class FamiliarisationColourComponent {
  pupil: Pupil;
  selectedContrast;
  contrastSettings;

  constructor(
    private router: Router,
    private storageService: StorageService
  ) {
    this.contrastSettings = AccessArrangementsConfig.contrastSettings;
  }

  selectionChange(selectedContrast) {
    this.selectedContrast = selectedContrast;
  }

  onClick() {
    const accessArrangements = new AccessArrangements;
    accessArrangements.contrast = this.selectedContrast || 'bow';
    this.storageService.setItem(accessArrangementsDataKey, accessArrangements);

    this.router.navigate(['sign-in-success']);
  }
}
