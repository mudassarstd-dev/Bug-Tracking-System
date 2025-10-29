import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ProjectAssigneeDto } from 'src/app/common/ProjectAssigneeDto';

@Component({
  selector: 'app-custom-dropdown',
  templateUrl: './custom-dropdown.component.html',
  styleUrls: ['./custom-dropdown.component.scss']
})
export class CustomDropdownComponent {
  @Input() assignees: ProjectAssigneeDto[] = [];
  @Input() selected: ProjectAssigneeDto[] = [];
  @Output() selectedChange = new EventEmitter<ProjectAssigneeDto[]>();

  dropdownOpen = false;
  dropdownPosition = { top: 0, left: 0 };

  /** ✅ Helper to check if a user is selected (fixes NG5002) */
  isSelected(user: ProjectAssigneeDto): boolean {
    return !!this.selected?.some(u => u.id === user.id);
  }

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
    const exists = this.selected.some(u => u.id === user.id);
    const updated = exists
      ? this.selected.filter(u => u.id !== user.id)
      : [...this.selected, user];
    this.selected = updated;
    this.selectedChange.emit(updated);
  }

  removeUser(user: ProjectAssigneeDto) {
    const updated = this.selected.filter(u => u.id !== user.id);
    this.selected = updated;
    this.selectedChange.emit(updated);
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.dropdownOpen = false;
  }
}
