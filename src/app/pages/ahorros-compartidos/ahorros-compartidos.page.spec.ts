import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AhorrosCompartidosPage } from './ahorros-compartidos.page';

describe('AhorrosCompartidosPage', () => {
  let component: AhorrosCompartidosPage;
  let fixture: ComponentFixture<AhorrosCompartidosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AhorrosCompartidosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
