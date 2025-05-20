import { TestBed } from '@angular/core/testing';

import { AhorrosCompartidosService } from './ahorros-compartidos.service';

describe('AhorrosCompartidosService', () => {
  let service: AhorrosCompartidosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AhorrosCompartidosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
