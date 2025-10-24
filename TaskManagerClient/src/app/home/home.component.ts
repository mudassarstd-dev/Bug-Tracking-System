import { Component, OnInit } from '@angular/core';
import { MasterService } from '../services/master.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  isManager: boolean = false
  username: string = "NA"
  userImage: string | null = null
  navbarOptions: any

  totalItems = 100;
  pageSize = 10;
  pageIndex = 0;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.isManager = this.authService.isManager()
    this.username = this.authService.getUsername().split(' ')[0] || "NA"
    this.userImage = this.authService.getUserImage()

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
      // {
      //   title: "Manage",
      //   icon: "bar_chart",
      //   show: this.isManager
      // },
      // {
      //   title: "Users",
      //   icon: "bar_chart",
      //   show: this.isManager
      // },
    ];

    this.renderDashboard()

  }

  renderView() {
    // this.router.navigate(['/bugs'])
  }

  private renderDashboard() {
    this.router.navigate(['/dashboard'])
  }

  navToProfile() {
    this.router.navigate(['/profile'])
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    console.log('Current page:', this.pageIndex + 1, 'Page size:', this.pageSize);
    // You can now trigger a data fetch for this page
  }

  showNotifications = false;
  anchorRect?: DOMRect;

  toggleNotifications(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    this.anchorRect = target.getBoundingClientRect();
    this.showNotifications = !this.showNotifications;
  }

}
