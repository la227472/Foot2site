import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ModifierProfilComponent } from './modifier-profil.component'

describe('ModifierProfilComponent', () => {
  let component: ModifierProfilComponent;
  let fixture: ComponentFixture<ModifierProfilComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ ModifierProfilComponent ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifierProfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('le formulaire doit être invalide par défaut', () => {
    expect(component.profilForm.valid).toBeFalsy();
  });

  it('devrait valider le formulaire après saisie correcte', () => {
    component.profilForm.patchValue({
      nom: 'Dupont',
      prenom: 'Marie',
      email: 'marie.dupont@test.com',
      password: 'azerty',
      rue: 'Avenue Paris',
      numero: '12',
      codePostal: '75000'
    });
    expect(component.profilForm.valid).toBeTruthy();
  });
});
