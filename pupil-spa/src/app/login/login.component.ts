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

  submit(schoolPin, pupilPin) {
    this.userService.login(schoolPin, pupilPin)
      .then((res) => {
          if (res.error) {
            this.router.navigate(['sign-in-failure']);
          } else {
            console.warn("logged in response: ", res);

            this.router.navigate(['sign-in-success']);
          }
        },
        (err) => {
          console.warn('Sign in failure: ', err);
          this.router.navigate(['sign-in-failure']);
        });
  }
}
