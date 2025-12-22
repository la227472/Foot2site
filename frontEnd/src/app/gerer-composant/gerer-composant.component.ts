import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ComposantsService } from '../Service/composants.service';
import { Composants } from '../Interface/Composants';
import { ComposantDialogComponent } from '../composant-dialog/composant-dialog.component';
import { ConfirmDialogComponent } from '../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { ConnectionService } from '../Service/connection.service';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-gerer-composant',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatSliderModule,
    MatTooltipModule
  ],
  templateUrl: './gerer-composant.component.html',
  styleUrl: './gerer-composant.component.css'
})
export class GererComposantComponent implements OnInit {
  // Liste des colonnes à afficher (utilisée dans le HTML ligne 85) - L'ordre ici = l'ordre d'affichage
  displayedColumns: string[] = ['type', 'marque', 'modele', 'prix', 'stock' , 'score', 'actions'];

  // Source de données du tableau (utilisée dans le HTML ligne 44) - Remplie par loadComposants()
  dataSource: MatTableDataSource<Composants>;

  // FormControl pour l'autocomplete de type (utilisé dans le HTML ligne 12)
  myControl = new FormControl('');

  // Liste des types disponibles pour l'autocomplete
  options: string[] = ['CPU', 'GPU', 'RAM', 'SSD', 'Carte Mère', 'Alimentation', 'Boîtier', 'Refroidissement'];

  // Observable contenant les options filtrées (utilisé dans le HTML ligne 17)
  filteredOptions!: Observable<string[]>;

  // Valeurs des sliders de prix (utilisées dans le HTML ligne 25, 27, 28)
  prixMin = 0;
  prixMax = 5000;

  // Valeurs des sliders de score (utilisées dans le HTML ligne 34, 36, 37)
  scoreMin = 0;
  scoreMax = 100;

  // Filtre les options de l'autocomplete selon le texte tapé - Appelée automatiquement par l'Observable
  private _filter(value: string | null): string[] {
    if (!value) {
      return this.options;
    }
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  // Référence au composant de pagination du HTML (utilisé dans loadComposants())
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Référence au composant de tri du HTML (utilisé dans loadComposants())
  @ViewChild(MatSort) sort!: MatSort;

  // Injection des services : composantService (API), dialog (popups), snackBar (notifications), connectionService (auth)
  constructor(
    private composantService: ComposantsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private connectionService: ConnectionService
  ) {
    this.dataSource = new MatTableDataSource<Composants>([]);
  }

  // Méthode appelée au chargement : configure l'autocomplete, écoute les filtres, vérifie le token, charge les données
  ngOnInit(): void {
    // Configure l'autocomplete pour filtrer automatiquement les options quand on tape
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    // Écoute les changements du filtre de type et applique les filtres
    this.myControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    // Vérifie si le token est valide, sinon redirige vers la connexion
    const tokenExpired = this.connectionService.isTokenExpired();
    if (tokenExpired) {
      this.connectionService.logout();
      return;
    }

    // Charge les composants depuis l'API
    this.loadComposants();
  }

  // Récupère tous les composants depuis l'API et remplit le tableau
  loadComposants(): void {
    this.composantService.getAllComposants().subscribe({
      next: (composants) => {
        this.dataSource.data = composants; // Remplit le tableau
        this.dataSource.paginator = this.paginator; // Lie la pagination
        this.dataSource.sort = this.sort; // Lie le tri
        this.setupCustomFilter(); // Configure les filtres personnalisés
      },
      error: (error) => {
        this.snackBar.open('Erreur lors du chargement des composants', 'Fermer', { duration: 3000 });
      }
    });
  }

  // Définit comment filtrer les données : retourne true si la ligne passe tous les filtres
  setupCustomFilter(): void {
    this.dataSource.filterPredicate = (data: Composants, filter: string) => {
      const filterObj = JSON.parse(filter);
      const matchType = !filterObj.type || data.type === filterObj.type;
      const matchPrix = data.prix >= filterObj.prixMin && data.prix <= filterObj.prixMax;
      const matchScore = data.score >= filterObj.scoreMin && data.score <= filterObj.scoreMax;
      return matchType && matchPrix && matchScore;
    };
  }

  // Applique les filtres au tableau (appelée depuis le HTML quand les sliders changent)
  applyFilters(): void {
    const filterValue = {
      type: this.myControl.value || '',
      prixMin: this.prixMin,
      prixMax: this.prixMax,
      scoreMin: this.scoreMin,
      scoreMax: this.scoreMax
    };
    this.dataSource.filter = JSON.stringify(filterValue);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Ancienne méthode de filtrage simple (non utilisée) - Gardée pour référence
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Ouvre une popup pour ajouter/modifier un composant (appelée depuis le HTML ligne 4)
  openDialog(composant?: Composants): void {
    const dialogRef = this.dialog.open(ComposantDialogComponent, {
      width: '500px',
      data: { composant: composant || null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (composant) {
          this.updateComposant(result); // Mode modification
        } else {
          this.createComposant(result); // Mode création
        }
      }
    });
  }

  // Crée un nouveau composant via l'API (appelée depuis openDialog())
  createComposant(composant: Composants): void {
    if (this.connectionService.isTokenExpired()) {
      this.connectionService.logout();
      return;
    }

    this.composantService.addComposants(composant).subscribe({
      next: () => {
        this.loadComposants();
        this.snackBar.open('Composant ajouté avec succès', 'Fermer', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Erreur lors de la création du composant', 'Fermer', { duration: 3000 });
      }
    });
  }

  // Modifie un composant existant via l'API (appelée depuis openDialog())
  updateComposant(composant: Composants): void {
    if (this.connectionService.isTokenExpired()) {
      this.connectionService.logout();
      return;
    }

    this.composantService.updateComposants(composant.id, composant).subscribe({
      next: () => {
        this.loadComposants();
        this.snackBar.open('Composant modifié avec succès', 'Fermer', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Erreur lors de la modification du composant', 'Fermer', { duration: 3000 });
      }
    });
  }

  // Supprime un composant via l'API avec confirmation dialog
  deleteComposant(composant: Composants): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer un composant',
        message: `Êtes-vous sûr de vouloir supprimer ce composant ?`,
        composantName: `${composant.marque} ${composant.modele}`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.connectionService.isTokenExpired()) {
          this.connectionService.logout();
          return;
        }

        this.composantService.deleteComposants(composant.id).subscribe({
          next: () => {
            this.loadComposants();
            this.snackBar.open('Composant supprimé avec succès', 'Fermer', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open('Erreur lors de la suppression du composant', 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }

  // Retourne une classe CSS selon le score (utilisée dans le HTML ligne 76 avec [ngClass])
  getScoreClass(score: number): string {
    if (score >= 90) return 'score-high';
    if (score >= 70) return 'score-medium';
    return 'score-low';
  }
}
