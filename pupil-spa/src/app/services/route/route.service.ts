import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { APP_CONFIG } from '../config/config.service';

@Injectable()
export class RouteService {
  private history: Array<string> = [];

  constructor(private router: Router) {
  }

  public setup(): void {
    if (APP_CONFIG.websiteOffline) {
      this.router.navigate(['/service-unavailable'])
      return
    }
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.history = [...this.history, event.url];
      }
    });
  }

  public getHistory(): Array<string> {
    return this.history;
  }

  public getPreviousUrl(): string {
    return this.history[this.history.length - 2] || undefined;
  }
}
