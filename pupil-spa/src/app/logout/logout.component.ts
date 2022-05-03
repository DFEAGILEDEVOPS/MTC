import { Component } from '@angular/core';
import { UserService } from '../services/user/user.service';
import { Router } from '@angular/router';
import { QuestionService } from '../services/question/question.service';
import { WarmupQuestionService } from '../services/question/warmup-question.service';

@Component({
  selector: 'app-logout',
  template: ``
})
export class LogoutComponent {

  constructor(
    private userService: UserService,
    private router: Router,
    private questionService: QuestionService,
    private warmupQuestionService: WarmupQuestionService
  ) {
    this.userService.logout();
    this.questionService.reset();
    this.warmupQuestionService.reset();
    this.router.navigate([ '' ]);
  }
}
