import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {ConfigurationService} from '../Service/configuration.service';
import { ComposantsService } from '../Service/composants.service';
import { ConnectionService } from '../Service/connection.service';
import { Composants } from '../Interface/Composants';
import { Configuration } from '../Interface/Configuration';
import {PanierService} from '../Service/panier.service';
import { ConfigurationDTO } from '../Interface/ConfigurationDTO';

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
  saveMode = signal<'save' | 'cart'>('save');
  hasAtLeastOneComponent = signal(false);

  constructor(
    private compositorService: ConfigurationService,
    private composantsService: ComposantsService,
    private fb: FormBuilder,
    private authService: ConnectionService,
    private panierService: PanierService,
    private router: Router
  ) {
    // Formulaire de sélection des composants
    this.compositionForm = this.fb.group({
      cpu: [''],
      motherboard: [''],
      gpu: [''],
      memory: [''],
      psu: [''],
      box: [''],
      hardDisk: ['']
    });

    // Formulaire pour le nom de la configuration
    this.configNameForm = this.fb.group({
      nomConfiguration: ['', [Validators.required, Validators.minLength(3)]]
    });

    // Calculer le prix total à chaque changement
    this.compositionForm.valueChanges.subscribe(() => {
      this.calculateTotalPrice();

      const hasOne = Object.values(this.compositionForm.value).some(
        v => v !== null && v !== ''
      );

      this.hasAtLeastOneComponent.set(hasOne);
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

  // Arrondir à 2 décimales pour éviter les erreurs de précision JS
  // On multiplie par 100, on arrondit, puis on divise par 100
  const roundedTotal = Math.round((total + Number.EPSILON) * 100) / 100;
  this.totalPrice.set(roundedTotal);
}

  onSubmit(mode: 'save' | 'cart'): void {
    if (!this.hasAtLeastOneComponent()) {
      this.errorMessage.set('Veuillez sélectionner au moins un composant');
      return;
    }

    if (this.compositionForm.invalid) {
      this.compositionForm.markAllAsTouched();
      this.errorMessage.set('Veuillez sélectionner tous les composants');
      return;
    }

    this.saveMode.set(mode);
    this.showNameModal.set(true);
  }

  saveConfiguration(): void {
    if (this.configNameForm.invalid) {
      this.configNameForm.markAllAsTouched();
      return;
    }

    const currentUser = this.authService.getUserInfo();
    if (!currentUser) {
      this.errorMessage.set('Utilisateur non connecté');
      return;
    }

    const name = this.configNameForm.value.nomConfiguration;

    this.loading.set(true);
    this.errorMessage.set('');

    this.compositorService
      .checkConfigNameExists(currentUser.id, name)
      .subscribe(exists => {
        if (exists) {
          this.errorMessage.set(
            'Une configuration avec ce nom existe déjà.'
          );
          this.loading.set(false);
          return;
        }


        this.createConfiguration(currentUser.id);
      });
  }

  private createConfiguration(userId: number): void {
    const formValues = this.compositionForm.value;

    const composantIds: number[] = Object.values(formValues)
      .filter(id => id)
      .map(id => Number(id));

    const configData: ConfigurationDTO = {
      nomConfiguration: this.configNameForm.value.nomConfiguration,
      utilisateurId: userId,
      composantIds
    };

    this.compositorService.createConfiguration(configData).subscribe({
      next: savedConfig => {

        const configuration: Configuration = {
          id: savedConfig.id,
          nomConfiguration: savedConfig.nomConfiguration,
          utilisateurId: savedConfig.utilisateurId,
          composantIds: savedConfig.composantIds
        };

        // 👉 MODE PANIER
        if (this.saveMode() === 'cart') {
          const allComponents = [
            ...this.cpus(),
            ...this.motherboards(),
            ...this.gpus(),
            ...this.memories(),
            ...this.psus(),
            ...this.boxes(),
            ...this.hardDisks()
          ];

          const composantsSelectionnes = allComponents.filter(c =>
            composantIds.includes(c.id)
          );

          this.panierService.addToCart(configuration, composantsSelectionnes);
          this.router.navigate(['/panier']);
          return;
        }

        // 👉 MODE SAVE
        this.successMessage.set('Configuration enregistrée avec succès !');
        this.loading.set(false);

        this.compositionForm.reset();
        this.configNameForm.reset();
        this.showNameModal.set(false);

        setTimeout(() => {
          this.router.navigate(['/compo']);
        }, 1500);
      },
      error: error => {
        console.error(error);

        if (error.status === 409) {
          this.errorMessage.set(error.error);
        } else {
          this.errorMessage.set('Erreur lors de l’enregistrement');
        }

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
