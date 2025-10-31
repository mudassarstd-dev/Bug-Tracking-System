import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-on-board',
  templateUrl: './on-board.component.html',
  styleUrls: ['./on-board.component.scss']
})
export class OnBoardComponent implements OnInit {

  constructor(private router: Router) { }

  cards = [
    {
      icon: 'group',
      title: 'Manager',
      description: 'Signup as a manager to manage the tasks and bugs',
      hover: false,
    },
    {
      icon: 'check_circle',
      title: 'Developer',
      description: 'Signup as a Developer to assign the relevant task to QA.',
      hover: false,
    },
    {
      icon: 'insights',
      title: 'QA',
      description: 'Signup as a QA to create the bugs and report in tasks.',
      hover: false,
    },
  ];

  ngOnInit(): void {
    localStorage.removeItem("onboard-selected-role")

    console.log(window.innerWidth);  // e.g., 1440
    console.log(window.innerHeight); // e.g., 900

  }

  navToLogin() {
    this.router.navigate(['/login']);
  }

  navToRegister(role: string) {
    console.log(`role passed: ${role}`)
    localStorage.setItem("onboard-selected-role", role);
    this.router.navigate(['/register']);
  }

}
