import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-prestamos',
  templateUrl: './prestamos.page.html',
  styleUrls: ['./prestamos.page.scss'],
})
export class PrestamosPage implements OnInit {
  public progress = 0.5; //Regla de tres para porcentaje de barra (aprobados)*(1)/(total de prestamos) || (aprobados)/(total de prestamos) 
  infoModel = false



  dataTableMort = [
    { pagado: true, num_pago: 1, fecha_pago: "01/12/23", monto: "$800.00", status_pago: "Pagado" },
    { pagado: false, num_pago: 2, fecha_pago: "01/28/23", monto: "$800.00", status_pago: "No pagado" },
    { pagado: false, num_pago: 3, fecha_pago: "01/28/23", monto: "$400.00", status_pago: "Pendiente" },
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

  constructor() { }

  ngOnInit() {
  }

  setModalInfo(isOpen: boolean){
    this.infoModel = isOpen
  }

}
