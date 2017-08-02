import { Component, OnInit } from '@angular/core';
import { Pupil } from '../pupil';
import { School } from '../school';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-success',
  templateUrl: './login-success.component.html',
  styleUrls: ['./login-success.component.css']
})
export class LoginSuccessComponent implements OnInit {

  pupil: Pupil;
  school: School;

  constructor(private router: Router) {
    const data = JSON.parse(localStorage.getItem('data'));
    this.pupil = new Pupil;
    this.pupil.firstName = data['pupil'].firstName;
    this.pupil.lastName = data['pupil'].lastName;
    this.school = new School;
    this.school.name = data['school'].name;
  }

  ngOnInit() {
  }

  onClick() {
    this.router.navigate(['check-start']);
  }
}
