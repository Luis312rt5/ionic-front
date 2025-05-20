import { Component, OnInit } from '@angular/core';
import { AhorrosCompartidosService } from '../../services/ahorros-compartidos.service';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-ahorros-compartidos',
  templateUrl: './ahorros-compartidos.page.html',
  styleUrls: ['./ahorros-compartidos.page.scss'],
  standalone: false
})
export class AhorrosCompartidosPage implements OnInit {
  ahorros: any[] = [];

  selectedAhorro: any = null;
  montoAportar: number = 0;
  emailNuevoUsuario: string = '';
  userId: number = 0;

  constructor(
    private ahorrosService: AhorrosCompartidosService,
    private storage: Storage,
    private router: Router,
    private toastController: ToastController
  ) {
    this.initStorage();
  }

  async initStorage() {
    await this.storage.create();
    const tokenPayload = await this.storage.get('user');
    if (tokenPayload?.userId) {
      this.userId = tokenPayload.userId;
    } else {
      const token = await this.storage.get('token');
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        this.userId = decoded.userId;
        await this.storage.set('user', { userId: this.userId });
      }
    }
  }

  async ngOnInit() {
    await this.cargarAhorros();
  }

  async cargarAhorros() {
    try {
      const ahorros$ = await this.ahorrosService.obtenerAhorros();
      ahorros$.subscribe((data) => {
        this.ahorros = data;
      });
    } catch (error) {
      console.error('Error al cargar los ahorros:', error);
    }
  }

  async cerrarSesion() {
    await this.storage.remove('token');
    await this.storage.remove('user');
    this.router.navigate(['/login']);
  }

  abrirModal(ahorro: any) {
    this.selectedAhorro = ahorro;
    this.montoAportar = 0;
    this.emailNuevoUsuario = '';
  }

  cerrarModal() {
    this.selectedAhorro = null;
  }

  async aportar() {
    if (!this.selectedAhorro || this.montoAportar <= 0) return;

    try {
      const response$ = await this.ahorrosService.aportarAhorro(
        this.selectedAhorro.id,
        this.montoAportar
      );
      response$.subscribe(() => {
        this.cargarAhorros();
        this.cerrarModal();
        this.mostrarToast('Aporte exitoso');
      });
    } catch (error) {
      console.error('Error al aportar al ahorro:', error);
      this.mostrarToast('Error al realizar el aporte', 'danger');
    }
  }

  esCreador(): boolean {
    return this.selectedAhorro?.creador_id === this.userId;
  }

  async agregarUsuario() {
    if (!this.selectedAhorro || !this.emailNuevoUsuario.trim()) {
      this.mostrarToast('Ingresa un correo válido', 'danger');
      return;
    }

    try {
      const response$ = await this.ahorrosService.agregarUsuarioPorEmail(
        this.selectedAhorro.id,
        this.emailNuevoUsuario
      );
      response$.subscribe({
        next: () => {
          this.mostrarToast('Usuario agregado correctamente');
          this.emailNuevoUsuario = '';
        },
        error: err => {
          const msg = err?.error?.error || 'Error al agregar usuario';
          this.mostrarToast(msg, 'danger');
        }
      });
    } catch (error) {
      this.mostrarToast('Error al procesar la solicitud', 'danger');
    }
  }

  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color
    });
    toast.present();
  }
}
