import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectAssigneeDto } from 'src/app/common/ProjectAssigneeDto';

@Component({
  selector: 'app-project-dialog',
  templateUrl: './project-dialog.component.html',
  styleUrls: ['./project-dialog.component.scss']
})
export class ProjectDialogComponent {
  projectForm: FormGroup;
  assignees: ProjectAssigneeDto[];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { assignees: ProjectAssigneeDto[] }
  ) {

    this.assignees = data.assignees || [];

    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      details: [''],
      assignTo: [[] , Validators.required],
      logo: [null]
    });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.projectForm.patchValue({ logo: file });
    }
  }

  save() {
    if (this.projectForm.valid) {
    
      const payload = {
        name: this.projectForm.value.name,
        description: this.projectForm.value.description,
        assigneeIds: this.projectForm.value.assignTo.map((u: ProjectAssigneeDto) => u.Id)
      };
      console.log(`payload: ${payload}`)
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
}
