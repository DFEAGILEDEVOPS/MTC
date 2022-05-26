import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { WindowRefService } from './services/window-ref/window-ref.service';
import { APP_CONFIG } from './services/config/config.service'
import { RouteService } from './services/route/route.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.scss'
  ]
})
export class AppComponent {
  protected window: any;

  constructor(
    protected windowRefService: WindowRefService,
    private routeService: RouteService,
    private router: Router,
  ) {
    this.window = windowRefService.nativeWindow;
    // start listening for route changes
    this.routeService.setup();

    if (APP_CONFIG && APP_CONFIG.websiteOffline) {
      this.router.navigate(['/service-unavailable']);
    }
  }
}
