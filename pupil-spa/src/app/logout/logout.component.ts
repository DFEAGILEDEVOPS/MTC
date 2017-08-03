import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  template: ``
})
export class LogoutComponent implements OnInit {

  constructor(private userService: UserService,  private router: Router) {
    this.userService.logout();
    this.router.navigate(['sign-in']);
  }

  ngOnInit() {
  }

}
