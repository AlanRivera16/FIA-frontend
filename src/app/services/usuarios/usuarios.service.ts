import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";


@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  api_test = 'http://localhost:3000';
  api_prod = 'https://fia-backend-production.up.railway.app';
  constructor(
    public http: HttpClient,
  ) { }


  postUsuario(formData: any){
    return this.http.post(`${this.api_prod}/usuarios`, formData)
  }
  putUsuario(id: string, formData: any){
    return this.http.put(`${this.api_prod}/usuarios/${id}`, formData)
  }

  getAsesores(){
    return this.http.get(`${this.api_prod}/usuarios/asesores`)
  }
  getClientes(id_asesor:string){
    return this.http.get(`${this.api_prod}/usuarios/clientes/${id_asesor}`)
  }

}
