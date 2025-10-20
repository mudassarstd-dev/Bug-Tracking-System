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
      description: 'Work seamlessly with your team in real-time.',
      hover: false,
    },
    {
      icon: 'check_circle',
      title: 'Developer',
      description: 'Keep track of every task and deadline efficiently.',
      hover: false,
    },
    {
      icon: 'insights',
      title: 'QA',
      description: 'Visualize your achievements and performance.',
      hover: false,
    },
  ];

  ngOnInit(): void {
    localStorage.removeItem("onboard-selected-role")
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
