import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeudasPage } from './deudas.page';

describe('DeudasPage', () => {
  let component: DeudasPage;
  let fixture: ComponentFixture<DeudasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DeudasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
