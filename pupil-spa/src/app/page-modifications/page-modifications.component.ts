import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import { AccessArrangements, accessArrangementsDataKey } from '../access-arrangements';
import { Config } from '../config.model';

@Component({
  selector: 'app-page-modifications',
  templateUrl: './page-modifications.component.html',
  styleUrls: ['./page-modifications.component.scss']
})
export class PageModificationsComponent {
  private accessArrangements: AccessArrangements;

  constructor(
    private router: Router,
    private storageService: StorageService
  ) {
    const accessArrangementsData = storageService.getItem(accessArrangementsDataKey);
    this.accessArrangements = new AccessArrangements;
    this.accessArrangements.fontSize = (accessArrangementsData && accessArrangementsData.fontSize) || 'default';
  }
}
