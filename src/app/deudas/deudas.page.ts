import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { AlertController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-deudas',
  templateUrl: './deudas.page.html',
  styleUrls: ['./deudas.page.scss'],
  standalone: false
})
export class DeudasPage implements OnInit {
  deudas: any[] = [];

  nuevaDeuda = {
    descripcion: '',
    monto: null
  };

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    await this.storage.create();
    this.cargarDeudas();
  }

  async cargarDeudas() {
    const token = await this.storage.get('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:3000/api/deudas', { headers }).subscribe({
      next: (data) => {
        this.deudas = data;
      },
      error: (err) => console.error('Error al obtener deudas', err)
    });
  }

  async registrarDeuda() {
    const token = await this.storage.get('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Validación simple
    if (!this.nuevaDeuda.descripcion.trim() || this.nuevaDeuda.monto === null || isNaN(Number(this.nuevaDeuda.monto))) {
      const alert = await this.alertCtrl.create({
        header: 'Campos incompletos',
        message: 'Por favor, ingresa una descripción y un monto válido.',
        buttons: ['OK']
      });
      return await alert.present();
    }

    const payload = {
      descripcion: this.nuevaDeuda.descripcion.trim(),
      monto: Number(this.nuevaDeuda.monto)
    };

    this.http.post('http://localhost:3000/api/deudas', payload, { headers }).subscribe({
      next: async () => {
        this.nuevaDeuda = { descripcion: '', monto: null };
        await this.cargarDeudas();
      },
      error: async (err) => {
        console.error('Error al registrar deuda', err); // 👈 útil para depurar
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo registrar la deuda.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  async eliminarDeuda(id: number) {
    const token = await this.storage.get('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:3000/api/deudas/${id}`, { headers }).subscribe({
      next: () => this.cargarDeudas(),
      error: (err) => console.error('Error al eliminar deuda', err)
    });
  }

  async cerrarSesion() {
    await this.storage.remove('token');
    await this.storage.remove('userId');
    this.navCtrl.navigateRoot('/login');
  }
}
