import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CanExit {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class CanExitGuard implements CanDeactivate<CanExit> {
  canDeactivate(component: CanExit) {
    if (component.canDeactivate) {
      return component.canDeactivate();
    }
    return true;
  }
}
