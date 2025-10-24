import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepicker } from '@angular/material/datepicker';
import { UserService } from 'src/app/services/user.service';
import { AvatarUser } from 'src/app/common/AvatarUser';

@Component({
  selector: 'app-bug-dialog',
  templateUrl: './bug-dialog.component.html',
  styleUrls: ['./bug-dialog.component.scss']
})
export class BugDialogComponent implements OnInit {
  bugForm!: FormGroup;
  selectedFile?: File;
  assignees: AvatarUser[]

  @ViewChild('picker') picker!: MatDatepicker<Date>;

  // assignees = [
  //   { avatar: 'https://i.pravatar.cc/40?img=3', id: 'u1' },
  //   { avatar: 'https://i.pravatar.cc/40?img=5', id: 'u2' },
  //   { avatar: 'https://i.pravatar.cc/40?img=7', id: 'u3' },
  // ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BugDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.bugForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      details: [''],
      assignees: [[]],
      dueDate: [null],
      attachment: [null]
    });

    // get devs here
    this.userService.getDevelopers().subscribe(resp => {
      this.assignees = resp.data || []
    })
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.bugForm.patchValue({ attachment: file });
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

  save(): void {
    if (this.bugForm.invalid) return;

    const { title, details, assignees, dueDate, attachment } = this.bugForm.value;
    const formData = new FormData();

    formData.append('title', title);
    formData.append('details', details || '');
    formData.append('dueDate', dueDate ? new Date(dueDate).toISOString() : '');
    // assignees.forEach((a: any) => formData.append('assignees[]', a));
    formData.append('assigneeIds', JSON.stringify(assignees.map(u => u.id)));
    if (attachment) formData.append('attachment', attachment, attachment.name);

    this.dialogRef.close(formData);
  }

  close(): void {
    this.dialogRef.close();
  }

  toggleAssignee(dev: AvatarUser) {
    const currentAssignees: AvatarUser[] = this.bugForm.get('assignees')?.value || [];

    if (this.isSelected(dev)) {
      const updated = currentAssignees.filter(a => a.id !== dev.id);
      this.bugForm.get('assignees')?.setValue(updated);
    } else {
      this.bugForm.get('assignees')?.setValue([...currentAssignees, dev]);
    }
  }

  isSelected(dev: AvatarUser): boolean {
    const currentAssignees: AvatarUser[] = this.bugForm.get('assignees')?.value || [];
    return currentAssignees.some(a => a.id === dev.id);
  }

}
