import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportesPageRoutingModule } from './reportes-routing.module';

import { ReportesPage } from './reportes.page';
import { NgChartsModule } from 'ng2-charts'; // Importa ChartsModule


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportesPageRoutingModule,
    NgChartsModule // Añade ChartsModule aquí
  ],
  declarations: [ReportesPage]
})
export class ReportesPageModule {}
