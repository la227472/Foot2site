import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { Composant } from '../Interface/Composant';

export interface DialogData {
  composant: Composant | null;
}

@Component({
  selector: 'app-composant-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSliderModule
  ],
  templateUrl: './composant-dialog.component.html',
  styleUrl: './composant-dialog.component.css'
})
export class ComposantDialogComponent implements OnInit {
  composantForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ComposantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.composantForm = this.fb.group({
      type: ['', Validators.required],
      marque: ['', Validators.required],
      modele: ['', Validators.required],
      prix: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      score: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    if (this.data.composant) {
      this.composantForm.patchValue(this.data.composant);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.composantForm.valid) {
      const composant: Composant = {
        id: this.data.composant?.id || 0,
        ...this.composantForm.value
      };
      this.dialogRef.close(composant);
    }
  }

  formatLabel(value: number): string {
    return `${value}`;
  }
}
