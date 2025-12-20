import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparerComposComponent } from './comparer-compos.component';

describe('ComparerComposComponent', () => {
  let component: ComparerComposComponent;
  let fixture: ComponentFixture<ComparerComposComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparerComposComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparerComposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
