import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage {
  nombre = '';
  email = '';
  password = '';

  constructor(
    private http: HttpClient,
    private navCtrl: NavController,
    private toastController: ToastController
  ) {}

  async registrar() {
    try {
      const res: any = await this.http.post('http://localhost:3000/api/auth/register', {
        nombre: this.nombre,
        email: this.email,
        password: this.password,
      }).toPromise();

      this.showToast('¡Registro exitoso! Inicia sesión');
      this.navCtrl.navigateRoot('/login');
    } catch (error) {
      this.showToast('Error al registrar. El correo puede estar en uso.');
      console.error(error);
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
