import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AvatarUser } from 'src/app/common/AvatarUser';
import { ProjectAssigneeDto } from 'src/app/common/ProjectAssigneeDto';
import { BugService } from 'src/app/services/bug.service';
import { UserService } from 'src/app/services/user.service';

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
      dueDate: ['']
    });

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

  removeAssignee(user: AvatarUser): void {
    this.assignees = this.assignees.filter(a => a.id !== user.id);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  isAssigned(user: ProjectAssigneeDto): boolean {
    return this.assignees.some(a => a.id === user.id);
  }

  save(): void {
    if (this.bugForm.invalid) return;

    const formValue = this.bugForm.value;
    const assigneeIds = this.assignees.map(a => a.id);

    const formData = new FormData();
    formData.append('title', formValue.title);
    formData.append('details', formValue.details);
    // formData.append('status', formValue.status);
    formData.append('dueDate', formValue.dueDate);
    formData.append('assigneeIds', JSON.stringify(assigneeIds));

    if (this.selectedFile) {
      formData.append('screenshot', this.selectedFile);
    }

    this.bugService.update(this.bugId, formData).subscribe()
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  close(): void {
    this.save()
    this.dialogRef.close();
  }
}
