import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompositorComponent } from './compositor.component';

describe('CompositorComponent', () => {
  let component: CompositorComponent;
  let fixture: ComponentFixture<CompositorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompositorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompositorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
