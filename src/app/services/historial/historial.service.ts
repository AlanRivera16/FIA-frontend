import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {

  api_test = 'http://localhost:8382';
  api_prod = 'https://fia-backend-production.up.railway.app';

  constructor(
    public http: HttpClient
  ) { }

  getHistorialByIdUser(id_user:string){
    return this.http.get(`${this.api_test}/historial/user/${id_user}`)
  }

  getNotificacionesByUser(userId: string, page: number = 1, limit: number = 10) {
    return this.http.get<any>(`${this.api_test}/notificacion/${userId}?page=${page}&limit=${limit}`);
  }

  marcarNotificacionComoLeida(id: string) {
    return this.http.patch(`${this.api_test}/notificacion/leida/${id}`, {});
  }
  getNotificacionesNoLeidas(userId: string) {
    return this.http.get(`${this.api_test}/notificacion/no-leidas/${userId}`);
  }

  getMovimientos(owner: string, params: { fechaInicio?: string, fechaFin?: string, tipo?: string, page?: number, limit?: number }) {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
      .join('&');
    return this.http.get(`${this.api_test}/wallet/${owner}/movimientos${query ? '?' + query : ''}`);
  }
  
  guardarMovimiento(owner: string, movimientoId: string) {
    return this.http.post(`${this.api_test}/wallet/${owner}/guardar-movimiento`, { movimientoId });
  }
  
  obtenerMovimientosGuardados(owner: string) {
    return this.http.get(`${this.api_test}/wallet/${owner}/movimientos-guardados`);
  }
  obtenerDatosMovimientosGuardados(owner: string) {
    return this.http.get(`${this.api_test}/wallet/${owner}/datos-movimientos-guardados`);
  }
  getMovimientoById(id: string) {
    return this.http.get(`${this.api_test}/wallet/movimiento/${id}`);
  }

  eliminarMovimientoGuardado(owner: string, movimientoId: string) {
    return this.http.delete(`${this.api_test}/wallet/${owner}/eliminar-movimiento-guardado`, { body: { movimientoId } });
  }
  
}
