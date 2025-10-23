import { isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectAssigneeDto } from 'src/app/common/ProjectAssigneeDto';
import { UserService } from 'src/app/services/user.service';


interface ProjectData {
  project?: any
}

@Component({
  selector: 'app-project-dialog',
  templateUrl: './project-dialog.component.html',
  styleUrls: ['./project-dialog.component.scss']
})
export class ProjectDialogComponent implements OnInit {
  projectForm: FormGroup;
  assignees: ProjectAssigneeDto[];
  selectedAssignees: ProjectAssigneeDto[];
  logoPreview: string | ArrayBuffer | null = null;
  isEditMode: boolean = false
  saveButtonText = "Save"

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProjectData,
    private userService: UserService
  ) {

    // this.assignees = data.assignees || [];

    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      details: [''],
      assignTo: [[], Validators.required],
      logo: [null]
    });
  }

  ngOnInit(): void {
    this.isEditMode = !!this.data.project

    if (this.isEditMode && this.data.project) {

      this.saveButtonText = "Update"

      const { name, description, logoUrl, id: id } = this.data.project;
      this.projectForm.patchValue({ name, details: description })
      if (logoUrl) this.logoPreview = logoUrl

    }
    this.userService.getNotManagers().subscribe({
      next: res => {
        this.assignees = res.data || []
      }
    });

    this.userService.getProjectAssignees(this.data.project.id).subscribe(resp => {
      const currentAssignees = resp.data || [];
      this.selectedAssignees = this.assignees.filter(a =>
        currentAssignees.some(c => c.id === a.id)
      );
      this.projectForm.patchValue({ assignTo: this.selectedAssignees });
    });

  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.projectForm.patchValue({ logo: file });
      console.log(file)

      const reader = new FileReader();
      reader.onload = () => (this.logoPreview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  save() {
    if (this.projectForm.valid) {
      // const payload = {
      //   name: this.projectForm.value.name,
      //   description: this.projectForm.value.description,
      //   assigneeIds: this.projectForm.value.assignTo.map((u: ProjectAssigneeDto) => u.Id)
      // };

      const { name, details, assignTo, logo } = this.projectForm.value;

      const payload = new FormData();
      payload.append('name', name);
      payload.append('description', details || '');
      payload.append('assigneeIds', JSON.stringify(assignTo.map((u: ProjectAssigneeDto) => u.id)));
      if (logo) payload.append('logo', logo);

      console.log(`payload: ${payload.get('assigneeIds')}`)

      if (this.isEditMode && this.data.project) {
        // payload.append('projectId', this.data.project.id);
      }

      this.dialogRef.close(payload);
    }
  }

  cancel() {
    this.dialogRef.close(null);
  }

  removeUser(user: any) {
    const updated = this.projectForm.value.assignTo.filter((u: any) => u !== user);
    this.projectForm.patchValue({ assignTo: updated });
  }

  dropdownOpen = false;
  dropdownPosition = { top: 0, left: 0 };

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dropdownOpen = !this.dropdownOpen;

    this.dropdownPosition = {
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX
    };
  }

  toggleAssignee(user: ProjectAssigneeDto) {
    const selected = this.projectForm.value.assignTo || [];
    const exists = selected.includes(user);

    const updated = exists
      ? selected.filter((u: any) => u !== user)
      : [...selected, user];

    this.projectForm.patchValue({ assignTo: updated });
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.dropdownOpen = false;
  }

}
