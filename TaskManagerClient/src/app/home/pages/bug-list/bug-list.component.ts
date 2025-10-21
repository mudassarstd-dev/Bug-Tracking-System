import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bug-list',
  templateUrl: './bug-list.component.html',
  styleUrls: ['./bug-list.component.scss']
})
export class BugListComponent implements OnInit {

  constructor() { }

  projectTitle: string = "Default"

  ngOnInit(): void {
    this.projectTitle = localStorage.getItem("project-title")
    localStorage.removeItem("project-title")
  }

  items = [
    {title: "one"}
  ]

}
