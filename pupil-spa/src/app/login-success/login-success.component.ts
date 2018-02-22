import { Component, OnInit } from '@angular/core';
import { Pupil } from '../pupil';
import { School } from '../school';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import { DeviceService } from '../services/device/device.service';

@Component({
  selector: 'app-login-success',
  templateUrl: './login-success.component.html',
  styleUrls: ['./login-success.component.css']
})
export class LoginSuccessComponent implements OnInit {

  pupil: Pupil;
  school: School;

  constructor(private router: Router,
              private storageService: StorageService,
              private deviceService: DeviceService) {
    const pupilData = storageService.getItem('pupil');
    const schoolData = storageService.getItem('school');
    this.pupil = new Pupil;
    this.pupil.firstName = pupilData.firstName;
    this.pupil.lastName = pupilData.lastName;
    this.pupil.dob = pupilData.dob;
    this.school = new School;
    this.school.name = schoolData.name;
  }

  async ngOnInit() {
    // Store various browser props in localStorage to be sent back to the server at the end of the check.
    await this.deviceService.capture();
  }

  onClick() {
    this.router.navigate(['check-start']);
  }
}
