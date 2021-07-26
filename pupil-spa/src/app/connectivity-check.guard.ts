import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { APP_CONFIG } from './services/config/config.service';

@Injectable()
export class ConnectivityCheckGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate() {
    console.log('connectivityCheckGuard', APP_CONFIG)
    if (!APP_CONFIG.connectivityCheckEnabled) {
      this.router.navigate(['/sign-in']);
      return;
    }
    return true;
  }
}
