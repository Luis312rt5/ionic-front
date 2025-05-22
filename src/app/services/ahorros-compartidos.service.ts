import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AhorrosCompartidosService {
  private apiUrl = 'http://localhost:3000/api/ahorrosCompartidos'; // Ajusta según tu backend

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {}

  // Obtener cabecera con token
  private async getHeaders(): Promise<HttpHeaders> {
    const token = await this.storage.get('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ Crear nuevo ahorro
  async crearAhorro(nombre: string, descripcion: string, meta: number): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    const body = { nombre, descripcion, meta };
    return this.http.post<any>(this.apiUrl, body, { headers });
  }

  // ✅ Eliminar ahorro
  async eliminarAhorro(ahorroId: number): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${ahorroId}`, { headers });
  }

  // ✅ Obtener ahorros del usuario
  async obtenerAhorros(): Promise<Observable<any[]>> {
    const headers = await this.getHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/mis`, { headers });
  }

  // ✅ Aportar a un ahorro
  async aportarAhorro(ahorroId: number, cantidad: number): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    const body = { cantidad };
    return this.http.post<any>(`${this.apiUrl}/${ahorroId}/aportar`, body, { headers });
  }

  // ✅ Agregar usuario por email
  async agregarUsuarioPorEmail(ahorroId: number, email: string): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    const body = { email };
    return this.http.post<any>(`${this.apiUrl}/${ahorroId}/agregarUsuario`, body, { headers });
  }

  // ✅ Obtener aportes del ahorro
  async obtenerAportes(ahorroId: number): Promise<Observable<any[]>> {
    const headers = await this.getHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/${ahorroId}/aportes`, { headers });
  }
}
