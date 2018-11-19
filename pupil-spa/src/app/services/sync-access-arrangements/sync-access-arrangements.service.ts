import { Injectable } from '@angular/core';

import { AccessArrangements, AccessArrangementsConfig, accessArrangementsDataKey } from '../../access-arrangements';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class SyncAccessArrangementsService {
  accessArrangements;
  fontSettings;
  contrastSettings;

  constructor(
    private storageService: StorageService,
  ) {}

  public sync() {
    this.accessArrangements = new AccessArrangements();
    const config = this.storageService.getItem('config');
    const appliedAccessArrangements = this.storageService.getItem(accessArrangementsDataKey);
    // Fetch prefs from current session stored within local storage
    this.accessArrangements.fontSize = appliedAccessArrangements && appliedAccessArrangements.fontSize;
    this.accessArrangements.contrast = appliedAccessArrangements && appliedAccessArrangements.contrast;
    if (this.accessArrangements.fontSize && this.accessArrangements.contrast) {
      return;
    }
    // Fetch prefs from check config or assign default values
    if (!this.accessArrangements.contrast) {
      this.contrastSettings = AccessArrangementsConfig.contrastSettings;
      const contrastSetting = this.contrastSettings.find(f => f.code === config.colourContrastCode);
      this.accessArrangements.contrast = contrastSetting.val || 'bow';
    }
    if (!this.accessArrangements.fontSize) {
      this.fontSettings = AccessArrangementsConfig.fontSettings;
      const fontSetting = this.fontSettings.find(f => f.code === config.fontSizeCode);
      this.accessArrangements.fontSize = fontSetting.val || 'regular';
    }
    this.storageService.setItem(accessArrangementsDataKey, this.accessArrangements);
  }
}
