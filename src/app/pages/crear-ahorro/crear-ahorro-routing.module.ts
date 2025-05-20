import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearAhorroPage } from './crear-ahorro.page';

const routes: Routes = [
  {
    path: '',
    component: CrearAhorroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrearAhorroPageRoutingModule {}
