import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'ngChat';

  constructor(private router: Router, private userService: UserService) {}

  handleLogout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('login');
  }
  get username() {
    let user: any = atob(this.getToken().split('.')[1]);
    user = JSON.parse(user);
    return user['username'];
  }

  get loggedIn() {
    return this.userService.isLoggedIn();
  }

  getToken() {
    return localStorage.getItem('token') || '';
  }
}
