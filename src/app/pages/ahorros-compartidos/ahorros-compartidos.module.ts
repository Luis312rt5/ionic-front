import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AhorrosCompartidosPageRoutingModule } from './ahorros-compartidos-routing.module';

import { AhorrosCompartidosPage } from './ahorros-compartidos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AhorrosCompartidosPageRoutingModule
  ],
  declarations: [AhorrosCompartidosPage]
})
export class AhorrosCompartidosPageModule {}
