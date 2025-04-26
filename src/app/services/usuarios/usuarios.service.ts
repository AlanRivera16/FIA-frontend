import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";


@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  api_test = 'http://localhost:3000';

  constructor(
    public http: HttpClient,
  ) { }


  getAsesores(){
    return this.http.get(`${this.api_test}/usuarios/asesores`)
  }
  getClientes(id_asesor:string){
    return this.http.get(`${this.api_test}/usuarios/clientes/${id_asesor}`)
  }

}
