import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavController, ToastController, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone: false
})
export class LoginPage {
  email = '';
  password = '';
  isLoading = false;

  constructor(
    private http: HttpClient,
    private navCtrl: NavController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private storage: Storage
  ) {
    this.storage.create();
  }

  async login() {
    if (!this.email || !this.password) {
      this.showToast('Por favor, completa todos los campos');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent',
    });

    await loading.present();
    this.isLoading = true;

    this.http.post('http://localhost:3000/api/auth/login', {
      email: this.email,
      password: this.password,
    }).subscribe({
      next: async (res: any) => {
        await loading.dismiss();
        await this.storage.set('token', res.token);
        this.showToast('¡Bienvenido!', 'success');
        this.navCtrl.navigateRoot('/movimientos');
      },
      error: async (err) => {
        await loading.dismiss();
        this.showToast('Credenciales inválidas o error del servidor');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  async showToast(message: string, color: 'danger' | 'success' = 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
    });
    toast.present();
  }
}
// Compare this snippet from src/app/pages/login/login.page.html: