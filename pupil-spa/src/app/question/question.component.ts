import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { PracticeQuestionComponent } from '../practice-question/practice-question.component';
import { AuditService } from '../services/audit/audit.service';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent extends PracticeQuestionComponent implements OnInit, AfterViewInit {

  /**
   * Track all mouse click activity
   */
  @HostListener('document:mousedown', [ '$event' ])
  handleMouseEvent(event: MouseEvent) {
    this.registerInputService.addEntry(event);
  }

  /**
   * Track all taps (touch events)
   * @param {TouchEvent} event
   */
  @HostListener('document:touchstart', [ '$event' ])
  handleTouchEvent(event: TouchEvent) {
    this.registerInputService.addEntry(event);
  }

  /**
   * Handle key presses
   * @param {KeyboardEvent} event
   * @return {boolean}
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // console.log('practice-question.component: handleKeyboardEvent(): event: ', event);
    this.registerInputService.addEntry(event);
    const key = event.key;
    // register inputs
    switch (key) {
      case 'Backspace':
      case 'Delete':
        this.deleteChar();
        break;
      case 'Enter':
        this.onSubmit();
        break;
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        this.addChar(key);
        break;
    }
    // IMPORTANT: prevent firefox, IE etc. from navigating back a page.
    return false;
  }

  constructor(protected auditService: AuditService,
              protected windowRefService: WindowRefService,
              protected registerInputService: RegisterInputService) {
    super(auditService, windowRefService);
    this.window = windowRefService.nativeWindow;
  }
}
