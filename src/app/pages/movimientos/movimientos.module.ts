import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MovimientosPage } from './movimientos.page';
import { NgChartsModule } from 'ng2-charts';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgChartsModule,
    RouterModule.forChild([{ path: '', component: MovimientosPage }])
  ],
  declarations: [MovimientosPage]
})
export class MovimientosPageModule {}
