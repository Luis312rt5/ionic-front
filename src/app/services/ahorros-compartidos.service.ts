import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AhorrosCompartidosService {
  private apiUrl = 'http://localhost:3000/api/ahorrosCompartidos';

  constructor(private http: HttpClient, private storage: Storage) {}

  private async getHeaders(): Promise<HttpHeaders> {
    const token = await this.storage.get('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ Crear nuevo ahorro (usando la clave correcta: montoObjetivo)
  async crearAhorro(nombre: string, descripcion: string, montoObjetivo: number): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    const body = { nombre, descripcion, montoObjetivo };
    return this.http.post<any>(this.apiUrl, body, { headers });
  }

  // ✅ Eliminar ahorro
  async eliminarAhorro(ahorroId: number): Promise<any> {
    const headers = await this.getHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${ahorroId}`, { headers }).toPromise();
  }

  // ✅ Obtener todos los ahorros
  async obtenerAhorros(): Promise<Observable<any[]>> {
    const headers = await this.getHeaders();
    return this.http.get<any[]>(this.apiUrl, { headers });
  }

  // ✅ Aportar a un ahorro (clave correcta: cantidad)
  async aportarAhorro(ahorroId: number, cantidad: number): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    const body = { cantidad };
    return this.http.post<any>(`${this.apiUrl}/${ahorroId}/aportar`, body, { headers });
  }

  // ✅ Agregar usuario por email (clave correcta: email)
  async agregarUsuarioPorEmail(ahorroId: number, email: string): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    const body = { email }; // el backend ahora espera "email"
    return this.http.post<any>(`${this.apiUrl}/${ahorroId}/agregarUsuario`, body, { headers });
  }
}
