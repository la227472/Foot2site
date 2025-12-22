import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilConfigComponent } from './profil-config.component';

describe('ProfilConfigComponent', () => {
  let component: ProfilConfigComponent;
  let fixture: ComponentFixture<ProfilConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
