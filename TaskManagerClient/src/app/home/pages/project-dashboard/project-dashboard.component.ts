import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { ProjectDialogComponent } from '../../dialogs/project-dialog/project-dialog.component';
import { ProjectService } from 'src/app/services/project.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.scss']
})
export class ProjectDashboardComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialog: MatDialog,
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  isManager = false;
  AddButtonText = 'Add New Project';
  projects: any[] = [];
  filteredProjects: any[] = [];
  username: string
  searchForm!: FormGroup;

  sortBy: 'latest' | 'mostTasks' = 'latest';
  projectFilter: 'my' | 'all' = 'all';

  pageSizeOptions: number[] = [6];
  pageSize = 6;
  currentPage = 1;
  totalItems = 0;

  ngOnInit(): void {
    this.checkRole();
    this.initSearchForm();
    this.getProjects();
    this.username = this.authService.getUsername().split(' ')[0] || "NA"

  }

  private initSearchForm() {
    this.searchForm = this.fb.group({ search: [''] });
    this.searchForm.get('search')?.valueChanges.subscribe(() => this.applyFiltersAndSorting());
  }

  private getProjects() {
    this.projectService.getAllProjects().subscribe({
      next: res => {
        this.projects = res.data || [];
        this.applyFiltersAndSorting();
      }
    });
  }

  applyFiltersAndSorting() {
    let projects = [...this.projects];

    if (this.projectFilter === 'my') {
      projects = projects.filter(p => p.canEdit);
    }

    const searchTerm = this.searchForm.get('search')?.value?.trim().toLowerCase() || '';
    if (searchTerm) {
      projects = projects.filter(
        p =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.description?.toLowerCase().includes(searchTerm)
      );
    }

    if (this.sortBy === 'latest') {
      projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (this.sortBy === 'mostTasks') {
      projects.sort((a, b) => (b.totalTasks || 0) - (a.totalTasks || 0));
    }

    this.filteredProjects = projects;
    this.totalItems = this.filteredProjects.length;
    this.currentPage = 1;
  }

  onSortChange(option: 'latest' | 'mostTasks') {
    this.sortBy = option;
    this.applyFiltersAndSorting();
  }

  onProjectFilterChange(option: 'my' | 'all') {
    this.projectFilter = option;
    this.applyFiltersAndSorting();
  }

  openProjectDialog(project?: any) {
    const dialogRef = this.dialog.open(ProjectDialogComponent, { data: { project } });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const action$ = project
        ? this.projectService.updateProject(project.id, result)
        : this.projectService.createProject(result);

      action$.subscribe(() => {
        alert("Completed successfully")
        this.getProjects()
      });
    });
  }

  deleteProject(projectId: string) {
    this.projectService.deleteById(projectId).subscribe({
      next: () => {
        alert("Deleted Successfully");
        this.getProjects();
      },
      error: (err) => {
        console.error("Delete failed", err);
        alert("Delete failed. Please try again.");
      }
    });

  }

  navToDetails(project: any) {
    this.router.navigate([`projects/${project.id}/bugs`]);
    localStorage.setItem('project-title', project.name);
  }

  private checkRole() {
    const role = this.authService.getRole();
    if (role === 'Manager') {
      this.isManager = true;
      this.AddButtonText = 'Add New Project';
    } else if (role === 'Developer' || role === 'QA') {
      this.isManager = false;
      this.AddButtonText = 'Add New Bug';
    }
  }

  get pagedProjects() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProjects.slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  get totalPages() {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get startItem() {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem() {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: Event) {
    this.router.navigate(['/login']);
  }
}
