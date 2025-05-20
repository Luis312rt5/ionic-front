import { Component } from '@angular/core';
import { AhorrosCompartidosService } from '../../services/ahorros-compartidos.service';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular'; // Asegúrate de importar esto
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-ahorro',
  templateUrl: './crear-ahorro.page.html',
  styleUrls: ['./crear-ahorro.page.scss'],
  standalone: false
})
export class CrearAhorroPage {
  nombre: string = '';
  descripcion: string = '';
  meta: number = 0;

  constructor(
    private ahorrosService: AhorrosCompartidosService,
    private navCtrl: NavController,
    private storage: Storage,
    private router: Router
  ) {}

  async crearAhorro() {
  try {
    const response$ = await this.ahorrosService.crearAhorro(this.nombre, this.descripcion, this.meta);
    response$.subscribe(() => {
      this.navCtrl.navigateBack('/ahorros-compartidos');
    });
  } catch (error) {
    console.error('Error al crear el ahorro:', error);
  }
  }

  cancelar() {
  this.navCtrl.navigateBack('/ahorros-compartidos');
}

  async cerrarSesion() {
    await this.storage.remove('token');
    this.router.navigate(['/login']);
  }
}
