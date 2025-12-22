import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Composants } from '../Interface/Composants';
import { ComposantsService } from '../Service/composants.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface DialogData {
  composant: Composants | null;
}

@Component({
  selector: 'app-composant-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSliderModule,
    MatAutocompleteModule
  ],
  templateUrl: './composant-dialog.component.html',
  styleUrl: './composant-dialog.component.css'
})
export class ComposantDialogComponent implements OnInit {
  composantForm: FormGroup;
  marqueControl = new FormControl('');
  modeleControl = new FormControl('');

  filteredMarques!: Observable<string[]>;
  filteredModeles!: Observable<string[]>;

  allMarques: string[] = [];
  allModeles: string[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ComposantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private composantsService: ComposantsService
  ) {
    this.composantForm = this.fb.group({
      type: ['', Validators.required],
      marque: ['', Validators.required],
      modele: ['', Validators.required],
      prix: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      score: [50, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    // Charger toutes les marques et modèles existants
    this.composantsService.getAllComposants().subscribe({
      next: (composants) => {
        this.allMarques = [...new Set(composants.map(c => c.marque))].sort();
        this.allModeles = [...new Set(composants.map(c => c.modele))].sort();

        // Configurer les autocompletes
        this.filteredMarques = this.marqueControl.valueChanges.pipe(
          startWith(''),
          map(value => this._filterMarques(value || ''))
        );

        this.filteredModeles = this.modeleControl.valueChanges.pipe(
          startWith(''),
          map(value => this._filterModeles(value || ''))
        );
      }
    });

    // Si on modifie un composant existant, remplir les champs
    if (this.data.composant) {
      this.composantForm.patchValue(this.data.composant);
      this.marqueControl.setValue(this.data.composant.marque);
      this.modeleControl.setValue(this.data.composant.modele);
    }

    // Synchroniser les valeurs des autocomplete avec le form
    this.marqueControl.valueChanges.subscribe(value => {
      this.composantForm.patchValue({ marque: value });
    });

    this.modeleControl.valueChanges.subscribe(value => {
      this.composantForm.patchValue({ modele: value });
    });
  }

  private _filterMarques(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allMarques.filter(marque => marque.toLowerCase().includes(filterValue));
  }

  private _filterModeles(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allModeles.filter(modele => modele.toLowerCase().includes(filterValue));
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.composantForm.valid) {
      const composant: Composants = {
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
