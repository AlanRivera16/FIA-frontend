import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";


@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  api_test = 'http://localhost:8382';
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
  postGarantia(formData: any, id_cliente: string){
    return this.http.post(`${this.api_prod}/usuarios/${id_cliente}/garantias`, formData)
  }

  getAsesores(){
    return this.http.get(`${this.api_prod}/usuarios/asesores`)
  }
  getClientes(id_asesor:string){ //Get clientes by asesor
    return this.http.get(`${this.api_prod}/usuarios/clientes/${id_asesor}`)
  }
  getClientesNoAsignados(){
    return this.http.get(`${this.api_prod}/usuarios/no-asignados`)
  }
  getClientesBaja(){
    return this.http.get(`${this.api_prod}/usuarios/baja`)
  }

  deleteUsuario(id: string){
    return this.http.delete(`${this.api_prod}/delete/usuario/${id}`)
  }
  deletePhotos(id_cliente: string, id_garantias: any){
    return this.http.patch(`${this.api_prod}/usuarios/${id_cliente}/garantias`, {public_ids: id_garantias} )
  }
  asignarAsesorAClientes(clienteIds: string[], asesorId: string) {
    return this.http.patch(`${this.api_prod}/usuarios/asignar-asesor`, {clienteIds, asesorId});
  }

}
