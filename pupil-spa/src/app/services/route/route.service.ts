import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Injectable()
export class RouteService {
  private history: Array<string> = [];

  constructor(private router: Router) {
  }

  public setup(): void {
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
