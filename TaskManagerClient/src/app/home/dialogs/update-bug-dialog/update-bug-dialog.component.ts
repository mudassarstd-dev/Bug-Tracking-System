import { Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AvatarUser } from 'src/app/common/AvatarUser';
import { ProjectAssigneeDto } from 'src/app/common/ProjectAssigneeDto';
import { BugService } from 'src/app/services/bug.service';
import { UserService } from 'src/app/services/user.service';



import { AbstractControl, ValidationErrors } from '@angular/forms';

function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  const selectedDate = control.value ? new Date(control.value) : null;
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  if (selectedDate && selectedDate < today) {
    return { pastDate: true };
  }
  return null;
}


@Component({
  selector: 'app-update-bug-dialog',
  templateUrl: './update-bug-dialog.component.html',
  styleUrls: ['./update-bug-dialog.component.scss']
})
export class UpdateBugDialogComponent implements OnInit {
  bugForm: FormGroup;
  selectedFile?: File;
  imagePreview?: string;
  assignees: AvatarUser[] = [];
  allUsers: any = [];
  screenshotUrl?: string;
  dropdownOpen = false;
  dropdownPosition = { top: 0, left: 0 };
  canUpdate: boolean = false;
  minDate: Date = new Date();


  @ViewChild('picker') picker!: MatDatepicker<Date>;

  constructor(
    private dialogRef: MatDialogRef<UpdateBugDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public bugId: string,
    private bugService: BugService,
    private userService: UserService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.bugForm = this.fb.group({
      title: [''],
      details: [''],
      status: [''],
      dueDate: ['', [futureDateValidator]]
    });

    this.minDate = new Date()

    this.loadBugDetails();
  }

  loadBugDetails() {
    this.bugService.getById(this.bugId).subscribe(res => {
      if (res.success && res.data) {
        const bug = res.data;
        this.bugForm.patchValue({
          title: bug.title,
          details: bug.details,
          status: bug.status,
          dueDate: bug.dueDate
        });
        this.assignees = bug.assignees || [];
        this.screenshotUrl = bug.screenshotUrl;
        this.canUpdate = bug.canUpdate
      }
    });

    this.userService.getDevelopers().subscribe(resp => {
      this.allUsers = resp.data;
    });
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dropdownOpen = !this.dropdownOpen;
    this.dropdownPosition = {
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX - 220
    };
  }

  toggleAssignee(user: ProjectAssigneeDto): void {
    const exists = this.assignees.some(a => a.id === user.id);
    this.assignees = exists
      ? this.assignees.filter(a => a.id !== user.id)
      : [...this.assignees, { id: user.id, name: user.username, avatar: user.avatar }];
  }

  isAssigned(user: ProjectAssigneeDto): boolean {
    return this.assignees.some(a => a.id === user.id);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (file.type !== 'image/png' && file.type !== 'image/gif') {
      alert('Only PNG and GIF images are allowed.');
      (event.target as HTMLInputElement).value = '';
      return;
    }

    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  openDatePicker(): void {
    this.picker.open();
  }

  onDatePicked(date: Date | null) {
    if (date) {
      this.bugForm.get('dueDate')?.setValue(date);
    }
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

  getBackgroundColor(status: string): string {
    switch (status) {
      case 'New': return '#e3f2fd';
      case 'Started': return '#fff3e0';
      case 'Resolved':
      case 'Completed': return '#e8f5e9';
      default: return '#f5f5f5';
    }
  }

  save(): void {
    if (this.bugForm.invalid) return;

    const formValue = this.bugForm.value;
    const assigneeIds = this.assignees.map(a => a.id);

    const formData = new FormData();
    formData.append('title', formValue.title);
    formData.append('details', formValue.details);
    formData.append('status', formValue.status);
    formData.append('dueDate', formValue.dueDate ? new Date(formValue.dueDate).toISOString() : '');
    formData.append('assigneeIds', JSON.stringify(assigneeIds));

    if (this.selectedFile) {
      formData.append('screenshot', this.selectedFile);
    }

    this.bugService.update(this.bugId, formData).subscribe({
      next: () => {
        alert("Updated successfully")
        this.dialogRef.close(true)
      }
    });
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  close(): void {
    this.dialogRef.close();
  }
}
