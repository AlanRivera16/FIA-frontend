import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrestamosService {

  api_test = 'http://localhost:3000';

  constructor(
    public http: HttpClient
  ) { }

  getPrestamos(){
    return this.http.get(`${this.api_test}/prestamos`)
  }
  getClientes(){
    return this.http.get(`${this.api_test}/usuarios/clientes`)
  }

  postPrestamos(body:any){
    return this.http.post(`${this.api_test}/prestamo`, body)
  }
  aceptarPrestamo(id:string,body:any){
    return this.http.patch(`${this.api_test}/crear_tabla/${id}`, body)
  }

  putPago(id:string, body:{}){
    return this.http.patch(`${this.api_test}/update_tabla/pago/${id}`, body)
  }

  rechazarPrestamo(id:string){
    return this.http.patch(`${this.api_test}/rechazar/prestamo/${id}`, {})
  }

  restarDías(fecha1:Date, fecha2:Date){

    console.log(fecha1, fecha2)
    if(fecha1 == null){
      return
    }
    if(fecha2 == null) {
      var fecha1Obj = new Date(fecha1);
      var fecha2Obj = new Date();
      
      // Convertir las fechas a milisegundos para poder restarlas
      var diferenciaMs = fecha1Obj.getTime() - fecha2Obj.getTime();
      
      // Convertir la diferencia de milisegundos a días
      var diasDeRetraso = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
      
      return diasDeRetraso; // 0 = No hay retraso | +0 = Días que sobraron (En tiempo) | -0 Con retraso 
    }else {
      var fecha1Obj = new Date(fecha1);
      var fecha2Obj = new Date(fecha2);
      
      // Convertir las fechas a milisegundos para poder restarlas
      var diferenciaMs = fecha1Obj.getTime() - fecha2Obj.getTime();
      console.log("fecha1Time:", fecha1Obj.getTime())
      console.log("fecha2Time:", fecha2Obj.getTime())
      console.log("Diferencia:", diferenciaMs)
      
      // Convertir la diferencia de milisegundos a días
      var diasDeRetraso = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
      
      return diasDeRetraso; // 0 = No hay retraso | +0 = Días que sobraron (En tiempo) | -0 Con retraso
    }
  }

  compareDates(fechaPago: string, limitHour: number = 18) { //Fecha lpimite real 20:00 horas (20)
    const currentDate = new Date(); // Fecha actual
    const targetDate = new Date(fechaPago); // Fecha objetivo
  
    // Asegurarse de que solo se comparen fechas (sin horas)
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  
    if (target < today) {
      // La fecha x es mayor
      const delayDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return delayDays //Dias de retraso -0
    } else if (target > today) {
      const daysLeft = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft;
    } else {
      // Las fechas son iguales, considerar la hora límite
      const currentHour = currentDate.getHours();
      console.log(currentHour)
      if (currentHour >= limitHour) {
        // return 'Retraso: la hora límite ya pasó.';
        console.log("Hoy fecha límite | Ya pasó la hora ", )
        return -1
      } else {
        // return 'Está en tiempo: dentro del límite de hoy.';
        console.log("Hoy fecha límite | En tiempo ", )
        return 0
      }
    }
  }
  
}
