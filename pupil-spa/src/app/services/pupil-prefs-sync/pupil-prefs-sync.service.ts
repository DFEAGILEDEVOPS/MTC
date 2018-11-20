import { Injectable } from '@angular/core';

import { AccessArrangements, AccessArrangementsConfig, accessArrangementsDataKey } from '../../access-arrangements';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class PupilPrefsSyncService {
  accessArrangements;
  fontSettings;
  contrastSettings;

  constructor(
    private storageService: StorageService,
  ) {}
  /*
  // Fetch pref values by first at access_arrangements key and then at config key
  // If both are not supplied provide default prefs
   */
  public sync() {
    this.accessArrangements = new AccessArrangements();
    const appliedAccessArrangements = this.storageService.getItem(accessArrangementsDataKey);
    // Fetch prefs from current session stored within local storage
    this.accessArrangements.fontSize = appliedAccessArrangements && appliedAccessArrangements.fontSize;
    this.accessArrangements.contrast = appliedAccessArrangements && appliedAccessArrangements.contrast;
    if (this.accessArrangements.fontSize && this.accessArrangements.contrast) {
      return;
    }
    // Fetch prefs from check config or assign default values
    const config = this.storageService.getItem('config');
    if (!this.accessArrangements.contrast) {
      this.contrastSettings = AccessArrangementsConfig.contrastSettings;
      const contrastSetting = config && this.contrastSettings.find(f => f.code === config.colourContrastCode);
      this.accessArrangements.contrast = (contrastSetting && contrastSetting.val) || 'bow';
    }
    if (!this.accessArrangements.fontSize) {
      this.fontSettings = AccessArrangementsConfig.fontSettings;
      const fontSetting = config && this.fontSettings.find(f => f.code === config.fontSizeCode);
      this.accessArrangements.fontSize = (fontSetting && fontSetting.val) || 'regular';
    }
    this.storageService.setItem(accessArrangementsDataKey, this.accessArrangements);
  }
}
