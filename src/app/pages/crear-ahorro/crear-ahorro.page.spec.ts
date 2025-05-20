import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearAhorroPage } from './crear-ahorro.page';

describe('CrearAhorroPage', () => {
  let component: CrearAhorroPage;
  let fixture: ComponentFixture<CrearAhorroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearAhorroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
