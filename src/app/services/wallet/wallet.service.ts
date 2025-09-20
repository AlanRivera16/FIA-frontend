import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  api_test = 'http://localhost:8382';
  api_prod = 'https://fia-backend-production.up.railway.app';

  constructor(
    private http: HttpClient
  ) { }

  getWallet(id:string){
    return this.http.get(`${this.api_prod}/wallet/${id}`)
    // return this.http.get(`${this.api_prod}/wallet/${id}`) --- IGNORE ---
  }

  setEstadoWallet(owner: string, activa: boolean) {
    return this.http.put(`${this.api_prod}/wallet/${owner}/estado`, { activa });
  }

  depositar(owner: string, monto: number, descripcion?: string) {
    return this.http.post(`${this.api_prod}/wallet/${owner}/depositar`, { monto, descripcion });
  }

retirar(owner: string, monto: number, descripcion?: string) {
    return this.http.post(`${this.api_prod}/wallet/${owner}/retirar`, { monto, descripcion });
  }
}
