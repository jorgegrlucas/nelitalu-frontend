import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcuctFormComponent } from './procuct-form.component';

describe('ProcuctFormComponent', () => {
  let component: ProcuctFormComponent;
  let fixture: ComponentFixture<ProcuctFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcuctFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcuctFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
