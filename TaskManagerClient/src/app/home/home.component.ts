import { Component, HostListener, OnInit } from '@angular/core';
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
  userImage: string | null = null
  navbarOptions: any

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.isManager = this.authService.isManager()
    this.username = this.authService.getUsername().split(' ')[0] || "NA"
    this.userImage = this.authService.getUserImage()

    this.navbarOptions = [
      {
        title: "Projects",
        icon: "assets/icons/projects.png",
        route: "/projects",
        show: true,
      },
      {
        title: "Bugs",
        icon: "assets/icons/bugs.svg",
        route: "/bugs",
        show: true,
      },
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

  showNotifications = false;
  anchorRect?: DOMRect;

  toggleNotifications(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    this.anchorRect = target.getBoundingClientRect();
    this.showNotifications = !this.showNotifications;
  }

  // @HostListener('document:click')
  // closeNotificationPanel(): void {
  //   this.showNotifications = false;
  // }

}
