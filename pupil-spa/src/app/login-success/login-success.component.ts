import { Component, OnInit } from '@angular/core';
import { Pupil } from '../pupil';
import { School } from '../school';
import { Router } from '@angular/router';
import { StorageService } from "../storage.service";

@Component({
  selector: 'app-login-success',
  templateUrl: './login-success.component.html',
  styleUrls: ['./login-success.component.css']
})
export class LoginSuccessComponent implements OnInit {

  pupil: Pupil;
  school: School;

  constructor(private router: Router, private storageService: StorageService) {
    const pupilData = storageService.getItem('pupil');
    const schoolData = storageService.getItem('school');
    this.pupil = new Pupil;
    this.pupil.firstName = pupilData.firstName;
    this.pupil.lastName = pupilData.lastName;
    this.school = new School;
    this.school.name = schoolData.name;
  }

  ngOnInit() {
  }

  onClick() {
    this.router.navigate(['check-start']);
  }
}
