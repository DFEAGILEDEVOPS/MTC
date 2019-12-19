import { Component } from '@angular/core';
import { StorageService } from '../services/storage/storage.service';
import { AccessArrangements } from '../access-arrangements';
import { AccessArrangementsStorageKey } from '../services/storage/storageKey';

@Component({
  selector: 'app-page-modifications',
  templateUrl: './page-modifications.component.html',
  styleUrls: ['./page-modifications.component.scss']
})
export class PageModificationsComponent {
  accessArrangements;

  constructor(
    private storageService: StorageService,
  ) {
    this.accessArrangements = new AccessArrangements();
    const accessArrangementsData = this.storageService.getItem(new AccessArrangementsStorageKey());
    this.accessArrangements.fontSize = (accessArrangementsData && accessArrangementsData.fontSize);
    this.accessArrangements.contrast = (accessArrangementsData && accessArrangementsData.contrast);
  }
}
