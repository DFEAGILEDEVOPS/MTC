import { Component, OnInit } from '@angular/core';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-phase-banner',
  templateUrl: './phase-banner.component.html',
  styleUrls: ['./phase-banner.component.scss']
})
export class PhaseBannerComponent implements OnInit {

  showFeedback = false;
  constructor(private storageService: StorageService) {}

  ngOnInit() {
    const questions = this.storageService.getItem('questions');
    const answers = this.storageService.getItem('answers');
    if (answers && questions && questions.length === answers.length) {
      this.showFeedback = true;
    }
  }

}
