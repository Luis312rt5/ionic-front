import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AhorrosCompartidosPage } from './ahorros-compartidos.page';

const routes: Routes = [
  {
    path: '',
    component: AhorrosCompartidosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AhorrosCompartidosPageRoutingModule {}
