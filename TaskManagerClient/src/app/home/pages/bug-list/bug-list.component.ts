import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { BugDialogComponent } from '../../dialogs/bug-dialog/bug-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { BugService } from 'src/app/services/bug.service';

export interface Bug {
  title: string;
  status: 'Open' | 'In Progress' | 'Closed';
  dueDate: string;
  assignees: string[]; 
}

const BUG_DATA: Bug[] = [
  {
    title: 'Login button not working',
    status: 'Open',
    dueDate: '2025-10-30',
    assignees: [
      'https://i.pravatar.cc/40?img=1',
      'https://i.pravatar.cc/40?img=2',
      'https://i.pravatar.cc/40?img=3',
    ]
  },
  {
    title: 'UI overlap on dashboard',
    status: 'In Progress',
    dueDate: '2025-10-25',
    assignees: [
      'https://i.pravatar.cc/40?img=4',
      'https://i.pravatar.cc/40?img=5'
    ]
  },
  {
    title: 'Crash on mobile view',
    status: 'Closed',
    dueDate: '2025-10-20',
    assignees: [
      'https://i.pravatar.cc/40?img=6'
    ]
  }
];

@Component({
  selector: 'app-bug-list',
  templateUrl: './bug-list.component.html',
  styleUrls: ['./bug-list.component.scss']
})
export class BugListComponent implements OnInit {

  displayedColumns: string[] = ['details', 'status', 'dueDate', 'assignedTo', 'actions'];
  dataSource = new MatTableDataSource<Bug>(BUG_DATA);
  isQa = true
  projectId: string
  projectTitle: string = 'Default';

  constructor(private route: ActivatedRoute, private dialog: MatDialog, private bugService: BugService) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('projectId')
    this.projectTitle = localStorage.getItem('project-title') || 'Default';
    localStorage.removeItem('project-title');

    if (localStorage.getItem("user-role") == "QA") this.isQa = true 
  }

  getColor(status: string): string {
    switch (status) {
      case 'Open': return '#1565c0';
      case 'In Progress': return '#ef6c00';
      case 'Closed': return '#2e7d32';
      default: return '#6b7280';
    }
  }

  onActionClick(bug: Bug) {
    console.log('Clicked actions for', bug.title);
  }

    openBugDialog() {
    const dialogRef = this.dialog.open(BugDialogComponent, {
      width: '780px',
      height: '880px',
      panelClass: 'light-dialog', 
      data: { someInput: 'value' } 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        result.append('projectId', this.projectId);
        console.log('Bug saved:', result);
        this.bugService.create(result).subscribe()
      }
    });
  }

}
