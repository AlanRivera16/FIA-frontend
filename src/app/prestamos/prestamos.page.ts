import { Component, OnInit } from '@angular/core';
import { ProfileModalComponent } from '../profile-modal/profile-modal.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-prestamos',
  templateUrl: './prestamos.page.html',
  styleUrls: ['./prestamos.page.scss'],
})
export class PrestamosPage implements OnInit {
  public progress = 0.5; //Regla de tres para porcentaje de barra (aprobados)*(1)/(total de prestamos) || (aprobados)/(total de prestamos) 
  infoModel = false



  dataTableMort:any = [
    { num_pago: 1, fecha_pago: "01/12/23", cuota: "$800.00", estado_pago: true },
    { num_pago: 2, fecha_pago: "01/28/23", cuota: "$800.00", estado_pago: false },
    { num_pago: 3, fecha_pago: "01/28/23", cuota: "$400.00", estado_pago: false },
    // { pagado: false, num_pago: 4, fecha_pago: "01/28/23", monto: "$800.00", status_pago: "No pagado" },
    // { pagado: false, num_pago: 5, fecha_pago: "01/28/23", monto: "$800.00", status_pago: "No pagado" },
    // { pagado: false, num_pago: 6, fecha_pago: "01/28/23", monto: "$800.00", status_pago: "No pagado" },
    // { pagado: false, num_pago: 7, fecha_pago: "01/28/23", monto: "$800.00", status_pago: "No pagado" },
    // { pagado: false, num_pago: 8, fecha_pago: "01/28/23", monto: "$800.00", status_pago: "No pagado" },
    // { pagado: false, num_pago: 9, fecha_pago: "01/28/23", monto: "$800.00", status_pago: "No pagado" },
    // { pagado: false, num_pago: 10, fecha_pago: "01/28/23", monto: "$800.00", status_pago: "No pagado" },
    // { pagado: false, num_pago: 11, fecha_pago: "01/28/23", monto: "$800.00", status_pago: "No pagado" },
    // { pagado: false, num_pago: 12, fecha_pago: "01/28/23", monto: "$800.00", status_pago: "No pagado" },
    // { pagado: false, num_pago: 13, fecha_pago: "01/28/23", monto: "$800.00", status_pago: "No pagado" },
    // { pagado: false, num_pago: 14, fecha_pago: "01/28/23", monto: "$800.00", status_pago: "No pagado" },
  ]

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.generarTablaAmor(1000,10,14)
  }

  setModalInfo(isOpen: boolean){
    this.infoModel = isOpen
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: ProfileModalComponent,
    });
    modal.present();
  }


    // Función para generar la tabla de amortización con 14 pagos
  generarTablaAmortizacion14Pagos(monto:number, tasaInteresAnual:number) {
      const plazoPagos = 14; // Siempre serán 14 pagos
      const tasaMensual = (tasaInteresAnual / 100) / 12;
      const cuota = (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazoPagos));

      let saldoPendiente = monto;
      let tabla = [];

      for (let i = 1; i <= plazoPagos; i++) {
        const interes = saldoPendiente * tasaMensual;
        const capital = cuota - interes;
        saldoPendiente -= capital;

        tabla.push({
          pago: i,
          cuota: cuota.toFixed(2),
          interes: interes.toFixed(2),
        });
      }
      
      console.log(tabla)
  }

  generarTablaAmor(monto:number, interes:number, periodo:number){
    const cuota = (interes * monto) / (100)
    let tabla = [];
    
    let fechas = this.calcularFechas(new Date ('2024-12-04'))
    for (let i = 1; i <= periodo; i++) {
      // const interes = saldoPendiente * tasaMensual;
      // const capital = cuota - interes;
      // saldoPendiente -= capital;

      tabla.push({
        num_pago: i,
        fecha_pago:fechas[i-1],
        cuota: cuota.toFixed(2),
        estado_pago: false
      });
    }
    console.log(fechas)
    console.log(tabla)
    this.dataTableMort = tabla
  }

  calcularFechas(fechaInicial: Date): Date[] {
  const fechas: Date[] = [];
  const lunesProximo = new Date(fechaInicial);

  // Ajustar la fecha al próximo lunes
  const diaDeLaSemana = lunesProximo.getDay(); // 0: Domingo, 1: Lunes, ..., 6: Sábado
  const diasHastaLunes = (diaDeLaSemana === 0) ? 1 : 8 - diaDeLaSemana;
  lunesProximo.setDate(lunesProximo.getDate() + diasHastaLunes);

  // Generar las siguientes 14 fechas (cada lunes)
  for (let i = 0; i < 14; i++) {
    const nuevaFecha = new Date(lunesProximo);
    nuevaFecha.setDate(lunesProximo.getDate() + i * 7); // Sumar semanas
    fechas.push(nuevaFecha);
  }

  return fechas;
}

// Ejemplo de uso:

// const fechas = this.calcularFechas(fechaInicial);

// fechas.forEach((fecha, index) => {
//   console.log(`Semana ${index + 1}: ${fecha.toLocaleDateString('es-ES')}`);
// });


}
