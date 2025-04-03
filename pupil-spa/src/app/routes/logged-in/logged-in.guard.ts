import { Injectable } from '@angular/core'
import { Router, CanActivate } from '@angular/router'

import { UserService } from '../../services/user/user.service'

@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor (private user: UserService, private router: Router) {
  }

  canActivate () {
    if (!this.user.isLoggedIn()) {
      this.router.navigate(['sign-in'])
    }
    return this.user.isLoggedIn()
  }
}
