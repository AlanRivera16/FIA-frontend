import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {

  api_test = 'http://localhost:3000';

  constructor(
    public http: HttpClient
  ) { }

  getHistorialByIdUser(id_user:string){
    return this.http.get(`${this.api_test}/historial/user/${id_user}`)
  }
  
}
