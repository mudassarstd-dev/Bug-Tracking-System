// import { Component, Inject, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// import { AvatarUser } from 'src/app/common/AvatarUser';
// import { BugService } from 'src/app/services/bug.service';

// @Component({
//   selector: 'app-update-bug-dialog',
//   templateUrl: './update-bug-dialog.component.html',
//   styleUrls: ['./update-bug-dialog.component.scss']
// })
// export class UpdateBugDialogComponent implements OnInit {

//   bugForm: FormGroup;
//   selectedFile?: File;
//   assignees: AvatarUser[] = [];
//   screenshotUrl?: string;

//   constructor(
//     private dialogRef: MatDialogRef<UpdateBugDialogComponent>,
//     @Inject(MAT_DIALOG_DATA) public bugId: string,
//     private bugService: BugService,
//     private fb: FormBuilder
//   ) {}

//   ngOnInit(): void {
//     this.bugForm = this.fb.group({
//       title: [''],
//       details: [''],
//       status: [''],
//       dueDate: ['']
//     });

//     this.bugService.getById(this.bugId).subscribe(res => {
//       if (res.success && res.data) {
//         const bug = res.data;

//         this.bugForm.patchValue({
//           title: bug.title,
//           details: bug.details,
//           status: bug.status,
//           dueDate: bug.dueDate
//         });

//         this.assignees = bug.assignees || [];
//         this.screenshotUrl = bug.screenshotUrl;
//       }
//     });
//   }

//   save() {
//     if (this.bugForm.valid) {
//       const updated = this.bugForm.value;
//       console.log('Updated bug:', updated);
//       alert('Will save soon');
//     }
//   }

//   close() {
//     this.dialogRef.close();
//   }
// }

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AvatarUser } from 'src/app/common/AvatarUser';
import { BugService } from 'src/app/services/bug.service';

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
  screenshotUrl?: string;

  constructor(
    private dialogRef: MatDialogRef<UpdateBugDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public bugId: string,
    private bugService: BugService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.bugForm = this.fb.group({
      title: [''],
      details: [''],
      status: [''],
      dueDate: ['']
    });

    this.loadBugDetails();
  }

  /** Load bug details from API */
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
  }

  /** Handle file selection (from footer browse only) */
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;

      // Show instant preview inside drop zone
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  /** Save updated data to API */
  save(): void {
    if (this.bugForm.invalid) return;

    const formValue = this.bugForm.value;
    const assigneeIds = this.assignees.map(a => a.id);

    // Prepare multipart form data for image + fields
    const formData = new FormData();
    formData.append('title', formValue.title);
    formData.append('details', formValue.details);
    formData.append('status', formValue.status);
    formData.append('dueDate', formValue.dueDate);
    formData.append('assigneeIds', JSON.stringify(assigneeIds));

    if (this.selectedFile) {
      formData.append('screenshot', this.selectedFile);
    }

    // this.bugService.update(this.bugId, formData).subscribe({
    //   next: res => {
    //     if (res.success) {
    //       this.dialogRef.close(true);
    //     } else {
    //       alert('Failed to update bug.');
    //     }
    //   },
    //   error: err => {
    //     console.error('Update failed', err);
    //     alert('Error updating bug.');
    //   }
    // });
  }

  close(): void {
    this.dialogRef.close();
  }
}
