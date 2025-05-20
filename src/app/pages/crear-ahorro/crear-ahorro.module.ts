import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearAhorroPageRoutingModule } from './crear-ahorro-routing.module';

import { CrearAhorroPage } from './crear-ahorro.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearAhorroPageRoutingModule
  ],
  declarations: [CrearAhorroPage]
})
export class CrearAhorroPageModule {}
