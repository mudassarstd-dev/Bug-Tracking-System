import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { BugDialogComponent } from '../../dialogs/bug-dialog/bug-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { BugService } from 'src/app/services/bug.service';
import { BugDetails } from 'src/app/common/BugDetails';

@Component({
  selector: 'app-bug-list',
  templateUrl: './bug-list.component.html',
  styleUrls: ['./bug-list.component.scss']
})
export class BugListComponent implements OnInit {

  displayedColumns: string[] = ['details', 'status', 'dueDate', 'assignedTo', 'actions'];
  dataSource = new MatTableDataSource<BugDetails>();
  isQa = false
  projectId: string
  projectTitle: string = 'Default';

  bugDetails: BugDetails[]

  constructor(private route: ActivatedRoute, private dialog: MatDialog, private bugService: BugService) { }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('projectId')
    this.getBugDetails()


    this.projectTitle = localStorage.getItem('project-title') || 'Default';
    localStorage.removeItem('project-title');

    if (localStorage.getItem("user-role") == "QA") this.isQa = true
  }

  getColor(status: string): string {
    switch (status) {
      case 'New': return '#1565c0';
      case 'Started': return '#ef6c00';
      case 'Resolved': return '#2e7d32';
      case 'Completed': return '#2e7d32';
      default: return '#6b7280';
    }
  }

  onActionClick(bug: BugDetails) {
    console.log('Clicked actions for', bug.details);
    alert(`deleting bug for id: ${bug.id}`)
    this.bugService.delete(bug.id).subscribe()
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
        this.bugService.create(result).subscribe(res => {
          this.getBugDetails()
        })
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }


  private getBugDetails() {
    this.bugService.getBugDetails(this.projectId).subscribe(res => {
      this.bugDetails = res.data || []
      this.dataSource.data = this.bugDetails
    })
  }

}
