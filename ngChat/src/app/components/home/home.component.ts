import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { UserObj } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  users: UserObj[] = [];
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.allUsers().subscribe((users: any) => {
      this.users = users;
    });
  }
}
