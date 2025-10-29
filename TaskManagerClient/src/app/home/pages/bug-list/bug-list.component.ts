import { Component, OnInit, HostListener, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { BugDialogComponent } from '../../dialogs/bug-dialog/bug-dialog.component';
import { UpdateBugDialogComponent } from '../../dialogs/update-bug-dialog/update-bug-dialog.component';
import { BugService } from 'src/app/services/bug.service';
import { BugDetails } from 'src/app/common/BugDetails';
import { asLiteral } from '@angular/compiler/src/render3/view/util';

@Component({
  selector: 'app-bug-list',
  templateUrl: './bug-list.component.html',
  styleUrls: ['./bug-list.component.scss']
})
export class BugListComponent implements OnInit {
  displayedColumns: string[] = ['details', 'status', 'dueDate', 'assignedTo', 'actions'];
  dataSource = new MatTableDataSource<BugDetails>();

  projectId: string;
  projectTitle: string = 'Default';
  bugDetails: BugDetails[] = [];
  originalBugDetails: BugDetails[] = [];

  isQa = false;
  isGridView = false;
  isFilterActive = false;
  isSortActive = false;

  activeBug: BugDetails | null = null;
  dropdownPosition = { top: 0, left: 0 };
  statusOptions = ['New', 'Started', 'Resolved'];

  @ViewChild('sortMenuTrigger', { read: MatMenuTrigger }) sortMenuTrigger: MatMenuTrigger;
  @ViewChild('filterMenuTrigger', { read: MatMenuTrigger }) filterMenuTrigger: MatMenuTrigger;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private bugService: BugService
  ) { }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('projectId')!;
    this.getBugDetails();

    this.projectTitle = localStorage.getItem('project-title') || 'Default';
    localStorage.removeItem('project-title');

    if (localStorage.getItem('user-role') === 'QA') this.isQa = true;
  }

  private getBugDetails() {

    this.isFilterActive = false
    this.isSortActive = false

    this.bugService.getBugDetails(this.projectId).subscribe(res => {
      this.bugDetails = res.data || [];
      this.originalBugDetails = [...this.bugDetails];
      this.dataSource.data = this.bugDetails;
    });
  }

  openBugDialog() {
    const dialogRef = this.dialog.open(BugDialogComponent, {
      width: '780px',
      height: '880px',
      panelClass: 'no-padding-dialog',
      // panelClass: 'bug-dialog',
      data: { projectId: this.projectId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.append('projectId', this.projectId);
        this.bugService.create(result).subscribe(() => this.getBugDetails());
      }
    });
  }

  openUpdateBugDialog(bugId: string) {
    if (!this.isQa) return;

    const dialogRef = this.dialog.open(UpdateBugDialogComponent, {
      width: '780px',
      height: '880px',
      panelClass: 'no-padding-dialog',
      data: { bugId: bugId, projectId: this.projectId }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getBugDetails()
    });
  }

  openMenu(event: MouseEvent, type: 'filter' | 'sort') {
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    const menu = document.querySelector(`#${type}-menu`) as HTMLElement;
    if (menu) {
      menu.style.position = 'absolute';
      menu.style.top = `${rect.bottom + window.scrollY}px`;
      menu.style.left = `${rect.left + window.scrollX}px`;
    }
  }

  sortBugs(type: 'latest' | 'nearest') {
    this.isSortActive = true;
    if (type === 'latest') {
      this.bugDetails.sort(
        (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      );
    } else {
      this.bugDetails.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
    }
    this.dataSource.data = [...this.bugDetails];
  }

  filterBugs(type: 'assignedToMe' | 'createdByMe') {
    this.isFilterActive = true;

    if (type === 'assignedToMe') {
      this.bugDetails = this.originalBugDetails.filter(b => b.canUpdate);
    } else if (type === 'createdByMe') {
      this.bugDetails = this.originalBugDetails.filter(b => b.canDelete);
    }

    this.dataSource.data = this.bugDetails;
  }

  clearFilters(filter: number) {

    if (filter === 1) {
      this.isFilterActive = false;
    } else {
      this.isSortActive = false;
    }

    this.bugDetails = [...this.originalBugDetails];
    this.dataSource.data = this.bugDetails;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  toggleView(view: 'list' | 'grid') {
    this.isGridView = view === 'grid';
  }

  getColor(status: string): string {
    switch (status) {
      case 'New': return '#1565c0';
      case 'Started': return '#ef6c00';
      case 'Resolved':
      case 'Completed': return '#2e7d32';
      default: return '#6b7280';
    }
  }

  onActionClick(bug: BugDetails) {
    console.log('Deleting bug', bug.details);
    alert(`Deleting bug for id: ${bug.id}`);
    this.bugService.delete(bug.id).subscribe(() => this.getBugDetails());
  }

  toggleDropdown(bug: BugDetails, event: MouseEvent) {
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    if (this.activeBug && this.activeBug.id === bug.id) {
      this.activeBug = null;
      return;
    }

    this.activeBug = bug;
    this.dropdownPosition = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX + 40
    };
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.activeBug = null;
  }

  updateStatus(bugId: string, status: string) {
    this.activeBug = null;
    this.bugService.updateStatus(bugId, status).subscribe(() => this.getBugDetails());
  }

  onRowClick(bug: BugDetails) {
    this.openUpdateBugDialog(bug.id);
  }
}
