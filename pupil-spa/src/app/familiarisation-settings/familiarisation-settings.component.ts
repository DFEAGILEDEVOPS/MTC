import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { QuestionService } from '../services/question/question.service';
import { StorageService } from '../services/storage/storage.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { Config } from '../config.model';

@Component({
  selector: 'app-familiarisation-settings',
  templateUrl: './familiarisation-settings.component.html',
  styleUrls: ['./familiarisation-settings.component.scss']
})
export class FamiliarisationSettingsComponent {
  config: Config;
  public familiarisationSettingsForm: FormGroup;
  public userSubmittedForm = false;
  private validationPattern = '^[a-zA-Z0-9À-ÖØ-öø-ÿ’\'-]*$';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private questionService: QuestionService,
    private storageService: StorageService,
) {
    this.config = questionService.getConfig();
    this.familiarisationSettingsForm = this.formBuilder.group({
      inputAssistantFirstName: new FormControl('', Validators.compose([
        Validators.required,
        Validators.maxLength(128),
        Validators.pattern(this.validationPattern)
      ])),
      inputAssistantLastName: new FormControl('', Validators.compose([
        Validators.required,
        Validators.maxLength(128),
        Validators.pattern(this.validationPattern)
      ])),
    });
  }

  get inputAssistantFirstName() { return this.familiarisationSettingsForm.get('inputAssistantFirstName'); }
  get inputAssistantLastName() { return this.familiarisationSettingsForm.get('inputAssistantLastName'); }


  onClick() {
    this.router.navigate(['check-start']);
  }

  onSubmit(inputAssistantFirstName, inputAssistantLastName) {
    if (!this.familiarisationSettingsForm.valid) {
      this.userSubmittedForm = true;
      return;
    }
    const pupilData = this.storageService.getItem('pupil');
    pupilData.inputAssistant = {
      firstName: inputAssistantFirstName,
      lastName: inputAssistantLastName,
    };
    this.storageService.setItem('pupil', pupilData);
    this.router.navigate(['check-start']);
  }
}
