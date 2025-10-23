import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { BugDialogComponent } from '../../dialogs/bug-dialog/bug-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { BugService } from 'src/app/services/bug.service';
import { BugDetails } from 'src/app/common/BugDetails';
import { HostListener } from '@angular/core';


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
  activeBug: BugDetails | null = null;
  dropdownPosition = { top: 0, left: 0 };
  statusOptions = ['New', 'Started', 'Resolved'];

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

  // onActionClick(bug: BugDetails) {
  //   console.log('Clicked actions for', bug.details);
  //   alert(`deleting bug for id: ${bug.id}`)
  //   this.bugService.delete(bug.id).subscribe()
  // }

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



  toggleDropdown(bug: BugDetails, event: MouseEvent) {
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    // Toggle if same bug clicked again
    if (this.activeBug && this.activeBug.id === bug.id) {
      this.activeBug = null;
      return;
    }

    this.activeBug = bug;

    // Calculate global position
    this.dropdownPosition = {
      top: rect.bottom + window.scrollY + 0, // below button
      left: rect.left + window.scrollX + 40 // slightly left of button
    };
  }


  // Click outside closes dropdown
  @HostListener('document:click')
  onDocumentClick() {
    this.activeBug = null;
  }

  updateStatus(bugId: string, status: string) {
    this.activeBug = null;
    this.bugService.updateStatus(bugId, status).subscribe(() => this.getBugDetails());
  }


}
