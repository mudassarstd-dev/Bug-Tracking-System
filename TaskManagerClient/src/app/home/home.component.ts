import { Component, OnInit } from '@angular/core';
import { MasterService } from '../services/master.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  isManager: boolean = false
  username: string = "NA"
  navbarOptions: any

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.isManager = this.authService.isManager()
    this.username = this.authService.getUsername().split(' ')[0] || "NA"

    this.navbarOptions = [
    {
      title: "Projects",
      icon: "assets/icons/projects.png",
      show: true
    },
    {
      title: "Bugs",
      icon: "assets/icons/bugs.svg",
      show: true
    },
    {
      title: "Manage",
      icon: "bar_chart",
      show: this.isManager
    },
    {
      title: "Users",
      icon: "bar_chart",
      show: this.isManager
    },
  ];

    this.renderDashboard()
  }


  private renderDashboard() {
    this.router.navigate(['/home/dashboard'])
  }
}
