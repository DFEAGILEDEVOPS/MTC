import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-force-user-interaction',
  templateUrl: './force-user-interaction.component.html',
  styleUrls: ['./force-user-interaction.component.scss']
})
export class ForceUserInteractionComponent {
  
  /**
   * Emit a click event when the user clicks the button
   * @type {EventEmitter<any>}
   */
  @Output()
  clickEvent: EventEmitter<any> = new EventEmitter();

  constructor(
  ) {
  }
  
  async onClick() {
    this.clickEvent.emit(null);
  }

}
