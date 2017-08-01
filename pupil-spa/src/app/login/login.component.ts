import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private submitted: boolean;

  constructor(private userService: UserService,  private router: Router) { }

  ngOnInit() {
    this.submitted = false;
  }

  /**
   * Handler for the login form submit action
   */
  onSubmit(schoolPin, pupilPin) {
    if (this.submitted === true) {
      return;
    }
    this.submitted = true;
    this.userService.login(schoolPin, pupilPin)
      .then(
        () => {
          this.router.navigate(['sign-in-success']);
        },
        () => {
          this.router.navigate(['sign-in-failure']);
        })
      .catch(() => {
        this.router.navigate(['sign-in-failure']);
      });
  }
}

