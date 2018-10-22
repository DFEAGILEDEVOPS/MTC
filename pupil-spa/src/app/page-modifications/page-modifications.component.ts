import { Component } from '@angular/core';
import { StorageService } from '../services/storage/storage.service';
import { AccessArrangements, accessArrangementsDataKey } from '../access-arrangements';

@Component({
  selector: 'app-page-modifications',
  templateUrl: './page-modifications.component.html',
  styleUrls: ['./page-modifications.component.scss']
})
export class PageModificationsComponent {
  accessArrangements: AccessArrangements;

  constructor(
    private storageService: StorageService
  ) {
    const accessArrangementsData = this.storageService.getItem(accessArrangementsDataKey);
    this.accessArrangements = new AccessArrangements;
    this.accessArrangements.fontSize = (accessArrangementsData && accessArrangementsData.fontSize) || 'default';
    this.accessArrangements.contrast = (accessArrangementsData && accessArrangementsData.contrast) || 'bow';
  }
}
