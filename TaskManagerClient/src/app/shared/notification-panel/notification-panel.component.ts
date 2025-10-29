import { Component, Input, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';

interface NotificationItem {
  text: string;
  timestamp: Date;
  actionable: boolean;
}

@Component({
  selector: 'app-notification-panel',
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.scss'],
})
export class NotificationPanelComponent implements OnInit {
  @Input() visible = false;
  @Input() anchorRect?: DOMRect;
  notifications: NotificationItem[] = [];

  readonly staticLogo = 'assets/icons/Group.png';

  ngOnInit() {
    this.notifications = [
      {
        text: 'Your bug report “Login crash” was resolved.',
        timestamp: new Date(),
        actionable: false,
      },
      {
        text: 'A new version 1.3.2 is available for deployment.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
        actionable: true,
      },
      {
        text: 'New comment on ticket #456.',
        timestamp: new Date(Date.now() - 86400000 * 2),
        actionable: false,
      },
      {
        text: 'Server downtime scheduled for maintenance.',
        timestamp: new Date(Date.now() - 86400000 * 5),
        actionable: true,
      },
    ];
  }

  getPosition() {
    if (!this.anchorRect) return {};
    return {
      position: 'absolute',
      top: `${this.anchorRect.bottom + 8}px`,
      left: `${this.anchorRect.right - 320}px`,
    };
  }

  formatTimestamp(date: Date): string {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );

    let label: string;
    if (d.toDateString() === now.toDateString()) {
      label = 'Today';
    } else if (diffDays < 7) {
      label = `Last ${d.toLocaleDateString(undefined, { weekday: 'long' })}`;
    } else {
      label = formatDate(d, 'MMM d', 'en-US');
    }

    const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return `${label} at ${time}`;
  }

  onView(note: NotificationItem) {
    console.log('View clicked:', note.text);
  }

  onDismiss(note: NotificationItem) {
    console.log('Dismiss clicked:', note.text);
  }
}
