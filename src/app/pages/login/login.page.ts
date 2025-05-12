import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavController, ToastController } from '@ionic/angular';
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

  constructor(
    private http: HttpClient,
    private navCtrl: NavController,
    private toastController: ToastController,
    private storage: Storage
  ) {
    this.storage.create();
  }

  async login() {
    try {
      const res: any = await this.http.post('http://localhost:3000/api/auth/login', {
        email: this.email,
        password: this.password,
      }).toPromise();

      await this.storage.set('token', res.token);

      this.showToast('¡Bienvenido!');
      this.navCtrl.navigateRoot('/movimientos'); // cambia según tu ruta principal
    } catch (error) {
      this.showToast('Credenciales inválidas');
    }
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'primary',
    });
    toast.present();
  }
}
