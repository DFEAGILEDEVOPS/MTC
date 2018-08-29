import { Component, OnInit } from '@angular/core';
import { StorageService } from '../services/storage/storage.service';
import { Pupil } from '../pupil';
import { Router } from '@angular/router';

@Component({
  selector: 'app-familiarisation-area',
  templateUrl: './familiarisation-area.component.html',
  styleUrls: ['./familiarisation-area.component.scss']
})
export class FamiliarisationAreaComponent implements OnInit {
  private pupil: Pupil;
  private selectedSize;

  private fontSettings = [
    {label: 'Very small', val: 'xsmall'},
    {label: 'Small', val: 'small'},
    {label: 'Regular', val: 'regular'},
    {label: 'Large', val: 'large'},
    {label: 'Very large', val: 'xlarge'},
    {label: 'Largest', val: 'xxlarge'}
  ];

  constructor(private router: Router,
              private storageService: StorageService) {
    const pupilData = storageService.getItem('pupil');

    this.pupil = new Pupil;
    this.pupil.firstName =pupilData.firstName;
    this.pupil.lastName = pupilData.lastName;
  }

  ngOnInit() {
  }

  selectionChange(selectedFont) {
    this.selectedSize = selectedFont;
  }

  onClick() {
    this.router.navigate(['sign-in-success']);
  }

}
