import { Component, OnInit } from '@angular/core';
import { AhorrosCompartidosService } from '../../services/ahorros-compartidos.service';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
<<<<<<< HEAD
import { ToastController, AlertController } from '@ionic/angular';
=======
import { ToastController, NavController } from '@ionic/angular';
>>>>>>> c092382e7fcabb678cc83125bd363c59533234f7

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
mainMenu: any;

  aportes: any[] = [];
  mostrarAportes = false;

  mostrarPopover = false;
  eventoPopover: any;
  ahorroEnOpciones: any = null;

  constructor(
    private ahorrosService: AhorrosCompartidosService,
    private storage: Storage,
    private router: Router,
    private toastController: ToastController,
<<<<<<< HEAD
    private alertController: AlertController
=======
    private navCtrl: NavController
>>>>>>> c092382e7fcabb678cc83125bd363c59533234f7
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

  mostrarOpciones(event: any, ahorro: any) {
    event.stopPropagation();
    this.eventoPopover = event;
    this.ahorroEnOpciones = ahorro;
    this.mostrarPopover = true;
  }

  cerrarPopover() {
    this.mostrarPopover = false;
    this.ahorroEnOpciones = null;
  }

  async accionDesdePopover(accion: string, ahorro: any) {
    this.cerrarPopover();
    switch (accion) {
      case 'aporte':
        this.abrirModalParaAportar(ahorro);
        break;
      case 'usuario':
        this.abrirModalParaAgregarUsuario(ahorro);
        break;
      case 'eliminar':
        await this.confirmarEliminarAhorro(ahorro);
        break;
    }
  }

  abrirModal(ahorro: any) {
    this.selectedAhorro = ahorro;
    this.montoAportar = 0;
    this.emailNuevoUsuario = '';
    this.cargarAportes(ahorro);
  }

  abrirModalParaAportar(ahorro: any) {
    this.selectedAhorro = ahorro;
    this.montoAportar = 0;
    this.emailNuevoUsuario = '';
    this.cargarAportes(ahorro);
  }

  abrirModalParaAgregarUsuario(ahorro: any) {
    this.selectedAhorro = ahorro;
    this.emailNuevoUsuario = '';
    this.montoAportar = 0;
    this.cargarAportes(ahorro);
  }

  cerrarModal() {
    this.selectedAhorro = null;
    this.montoAportar = 0;
    this.emailNuevoUsuario = '';
    this.aportes = [];
    this.mostrarAportes = false;
  }

  cancelar() {
    this.cerrarModal();
  }

  async aportar() {
    if (!this.selectedAhorro || this.montoAportar <= 0) {
      this.mostrarToast('Ingresa un monto válido mayor a 0', 'warning');
      return;
    }

    try {
      const response$ = await this.ahorrosService.aportarAhorro(
        this.selectedAhorro.id,
        this.montoAportar
      );
      response$.subscribe({
        next: () => {
          this.cargarAhorros();
          this.cargarAportes(this.selectedAhorro);
          this.montoAportar = 0;
          this.mostrarToast('Aporte realizado exitosamente', 'success');
        },
        error: (error) => {
          console.error('Error al aportar:', error);
          this.mostrarToast('Error al realizar el aporte', 'danger');
        }
      });
    } catch (error) {
      console.error('Error al aportar al ahorro:', error);
      this.mostrarToast('Error al realizar el aporte', 'danger');
    }
  }

  async agregarUsuario() {
    if (!this.selectedAhorro || !this.emailNuevoUsuario.trim()) {
      this.mostrarToast('Ingresa un correo válido', 'warning');
      return;
    }

    try {
      const response$ = await this.ahorrosService.agregarUsuarioPorEmail(
        this.selectedAhorro.id,
        this.emailNuevoUsuario.trim()
      );
      response$.subscribe({
        next: () => {
          this.mostrarToast('Usuario agregado correctamente', 'success');
          this.emailNuevoUsuario = '';
          this.cargarAportes(this.selectedAhorro);
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

  async confirmarEliminarAhorro(ahorro: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar el ahorro "${ahorro.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarAhorro(ahorro.id);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarAhorro(ahorroId: number) {
    try {
      const response$ = await this.ahorrosService.eliminarAhorro(ahorroId);
      response$.subscribe({
        next: () => {
          this.ahorros = this.ahorros.filter(a => a.id !== ahorroId);
          this.mostrarToast('Ahorro eliminado correctamente', 'success');
        },
        error: (error) => {
          console.error('Error al eliminar el ahorro:', error);
          this.mostrarToast('Error al eliminar el ahorro', 'danger');
        }
      });
    } catch (error) {
      console.error('Error al eliminar el ahorro:', error);
      this.mostrarToast('Error al eliminar el ahorro', 'danger');
    }
  }

  esCreador(): boolean {
    return this.selectedAhorro?.creador_id === this.userId;
  }

  esCreadorDesdeId(ahorro: any): boolean {
    return ahorro?.creador_id === this.userId;
  }

  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  async cargarAportes(ahorro: any) {
    try {
      const response$ = await this.ahorrosService.obtenerAportes(ahorro.id);
      response$.subscribe({
        next: (res: any[]) => {
          this.aportes = res;
          this.mostrarAportes = true;
        },
        error: (err: any) => {
          console.error(err);
          this.mostrarToast('Error al cargar aportes', 'danger');
        }
      });
    } catch (error) {
      console.error('Error cargando aportes:', error);
      this.mostrarToast('Error inesperado', 'danger');
    }
  }
}
