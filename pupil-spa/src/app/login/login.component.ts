import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private userService: UserService,  private router: Router) { }

  ngOnInit() {
  }

  onSubmit(schoolPin, pupilPin) {
    this.userService.login(schoolPin, pupilPin)
      .then((res) => {
          if (res.error) {
            this.router.navigate(['sign-in-failure']);
          } else {
            this.router.navigate(['sign-in-success']);
          }
        },
        (err) => {
          console.warn('Sign in failure: ', err);
          this.router.navigate(['sign-in-failure']);
        });
  }
}
