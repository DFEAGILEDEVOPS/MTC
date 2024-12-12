
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CanExit {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class CanExitGuard  {
  canDeactivate(component: CanExit) {
    if (component.canDeactivate) {
      return component.canDeactivate();
    }
    return true;
  }
}
