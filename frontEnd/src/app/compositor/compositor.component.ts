import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {ConfigurationService} from '../Service/configuration.service';
import { ComposantsService } from '../Service/composants.service';
import { ConnectionService } from '../Service/connection.service';
import { Composants } from '../Interface/Composants';
import { CreateConfigurationRequest } from '../Interface/Configuration';

@Component({
  selector: 'app-compositor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './compositor.component.html',
  styleUrl: './compositor.component.css'
})
export class CompositorComponent implements OnInit {
  compositionForm: FormGroup;
  configNameForm: FormGroup;

  // Listes de composants par type
  cpus = signal<Composants[]>([]);
  motherboards = signal<Composants[]>([]);
  hardDisks = signal<Composants[]>([]);
  boxes = signal<Composants[]>([]);
  gpus = signal<Composants[]>([]);
  memories = signal<Composants[]>([]);
  psus = signal<Composants[]>([]);

  // État de l'interface
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showNameModal = signal(false);
  totalPrice = signal(0);

  constructor(
    private compositorService: ConfigurationService,
    private composantsService: ComposantsService,
    private fb: FormBuilder,
    private authService: ConnectionService,
    private router: Router
  ) {
    // Formulaire de sélection des composants
    this.compositionForm = this.fb.group({
      cpu: ['', Validators.required],
      motherboard: ['', Validators.required],
      gpu: ['', Validators.required],
      memory: ['', Validators.required],
      psu: ['', Validators.required],
      box: ['', Validators.required],
      hardDisk: ['', Validators.required]
    });

    // Formulaire pour le nom de la configuration
    this.configNameForm = this.fb.group({
      nomConfiguration: ['', [Validators.required, Validators.minLength(3)]]
    });

    // Calculer le prix total à chaque changement
    this.compositionForm.valueChanges.subscribe(() => {
      this.calculateTotalPrice();
    });
  }

  ngOnInit(): void {
    this.loadComponents();
  }

  loadComponents(): void {
    this.loading.set(true);

    this.loadByType('CPU', this.cpus);
    this.loadByType('GPU', this.gpus);
    this.loadByType('Memory', this.memories);
    this.loadByType('Motherboard', this.motherboards);
    this.loadByType('HardDisk', this.hardDisks);
    this.loadByType('Box', this.boxes);
    this.loadByType('PSU', this.psus);
  }

  private loadByType(type: string, target: any) {
    this.composantsService.getComposantsByType(type).subscribe({
      next: (data) => {
        target.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set(`Erreur chargement ${type}`);
        this.loading.set(false);
      }
    });
  }

  calculateTotalPrice(): void {
    const formValues = this.compositionForm.value;
    let total = 0;

    // Récupérer les prix de chaque composant sélectionné
    const selectedIds = Object.values(formValues).filter(id => id);

    const allComponents = [
      ...this.cpus(),
      ...this.motherboards(),
      ...this.gpus(),
      ...this.memories(),
      ...this.psus(),
      ...this.boxes(),
      ...this.hardDisks()
    ];

    selectedIds.forEach(id => {
      const component = allComponents.find(c => c.id === Number(id));
      if (component) {
        total += component.prix;
      }
    });

    this.totalPrice.set(total);
  }

  onSubmit(): void {
    if (this.compositionForm.invalid) {
      this.compositionForm.markAllAsTouched();
      this.errorMessage.set('Veuillez sélectionner tous les composants');
      return;
    }

    // Afficher le modal pour entrer le nom
    this.showNameModal.set(true);
  }

  saveConfiguration(): void {
    if (this.configNameForm.invalid) {
      this.configNameForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const currentUser = this.authService.getUserInfo();
    console.log(currentUser)

    if (!currentUser) {
      this.errorMessage.set('Utilisateur non connecté');
      this.loading.set(false);
      return;
    }

    // Récupérer tous les IDs des composants sélectionnés
    const formValues = this.compositionForm.value;
    const composantIds: number[] = Object.values(formValues)
      .filter(id => id)
      .map(id => Number(id));

    const configData: CreateConfigurationRequest = {
      nomConfiguration: this.configNameForm.value.nomConfiguration,
      utilisateurId: currentUser.id,
      composantIds: composantIds
    };

    console.log('Configuration à enregistrer:', configData);

    this.compositorService.createConfiguration(configData).subscribe({
      next: (response) => {
        this.successMessage.set('Configuration enregistrée avec succès !');
        this.loading.set(false);

        // Réinitialiser les formulaires
        this.compositionForm.reset();
        this.configNameForm.reset();
        this.showNameModal.set(false);

        // Redirection après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/comparer']);
        }, 2000);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage.set(
          error.error?.message || 'Erreur lors de l\'enregistrement'
        );
        this.loading.set(false);
      }
    });
  }

  cancelSave(): void {
    this.showNameModal.set(false);
    this.configNameForm.reset();
  }

  getComponentDetails(componentId: string | null, list: Composants[]): Composants | undefined {
    if (!componentId) return undefined;
    return list.find(c => c.id === Number(componentId));
  }

  // Getters pour le formulaire de nom
  get nomConfiguration() {
    return this.configNameForm.get('nomConfiguration');
  }
}
