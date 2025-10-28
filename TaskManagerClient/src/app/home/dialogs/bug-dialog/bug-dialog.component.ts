import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepicker } from '@angular/material/datepicker';
import { UserService } from 'src/app/services/user.service';
import { AvatarUser } from 'src/app/common/AvatarUser';

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
  selector: 'app-bug-dialog',
  templateUrl: './bug-dialog.component.html',
  styleUrls: ['./bug-dialog.component.scss'],
})
export class BugDialogComponent implements OnInit, OnDestroy {
  bugForm!: FormGroup;
  selectedFile?: File;
  assignees: AvatarUser[] = [];
  allUsers: AvatarUser[] = [];
  previewUrl: string | null = null;
  dropdownOpen = false;
  dropdownPosition = { top: 0, left: 0 };
  minDate: Date = new Date();

  @ViewChild('picker') picker!: MatDatepicker<Date>;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BugDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.bugForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(60)]],
      details: ['', Validators.required],
      assignees: [[]],
      dueDate: [null, [futureDateValidator]],
      attachment: [null],
    });

    this.minDate = new Date()
    
    this.userService.getDevelopers().subscribe((resp) => {
      this.assignees = resp.data || [];
      this.allUsers = this.assignees;
    });

    document.addEventListener('click', this.handleOutsideClick);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleOutsideClick);
  }

  private handleOutsideClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    if (
      !target.closest('.custom-dropdown-card') &&
      !target.closest('.add-avatar')
    ) {
      this.dropdownOpen = false;
    }
  };

  openDropdown(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    this.dropdownPosition = {
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
    };

    this.dropdownOpen = !this.dropdownOpen;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.bugForm.patchValue({ attachment: file });

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
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

  toggleAssignee(dev: AvatarUser) {
    const current = this.bugForm.get('assignees')?.value || [];
    const updated = this.isSelected(dev)
      ? current.filter((a) => a.id !== dev.id)
      : [...current, dev];
    this.bugForm.get('assignees')?.setValue(updated);
  }

  isSelected(dev: AvatarUser): boolean {
    const current = this.bugForm.get('assignees')?.value || [];
    return current.some((a) => a.id === dev.id);
  }

  save(): void {
    if (this.bugForm.invalid) return;

    const { title, details, assignees, dueDate, attachment } =
      this.bugForm.value;
    const formData = new FormData();

    formData.append('title', title);
    formData.append('details', details || '');
    formData.append('dueDate', dueDate ? new Date(dueDate).toISOString() : '');
    formData.append('assigneeIds', JSON.stringify(assignees.map((u) => u.id)));
    if (attachment) formData.append('attachment', attachment, attachment.name);

    this.dialogRef.close(formData);
  }

  close(): void {
    this.dialogRef.close();
  }
}
