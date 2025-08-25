// number-modal.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-number-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './number-modal.component.html',
  styleUrls: ['./number-modal.component.css']
})
export class NumberModalComponent {
  constructor(
    public dialogRef: MatDialogRef<NumberModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { number: number }
  ) {}
}
