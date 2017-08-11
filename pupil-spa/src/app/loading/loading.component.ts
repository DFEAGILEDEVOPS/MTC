import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})

export class LoadingComponent {

  @Input()
  private question = 0;
  @Input()
  private total = 0;

  constructor() {
  }
}
