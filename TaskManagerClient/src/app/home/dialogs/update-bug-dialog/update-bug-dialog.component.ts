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

  save() {
    if (this.bugForm.valid) {
      const updated = this.bugForm.value;
      console.log('Updated bug:', updated);
      alert('Will save soon');
    }
  }

  close() {
    this.dialogRef.close();
  }
}
