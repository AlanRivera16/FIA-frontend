import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HistorialService } from '../services/historial/historial.service';
import { LoginService } from '../services/login/login.service';
import { Router } from '@angular/router';

const STORAGE_KEY = 'login-data-user'

@Component({
  selector: 'app-notific-modal',
  templateUrl: './notific-modal.component.html',
  styleUrls: ['./notific-modal.component.scss'],
})
export class NotificModalComponent  implements OnInit {

  dataUser: any = {};

  notificaciones: any[] = [];
  todasLeidas = false;
  page = 1;
  limit = 10;
  totalPages = 1;

  constructor(
    private modalCtrl:ModalController,
    private historialService: HistorialService,
    private loginService: LoginService,
    private router: Router,
  ) { }

  async ngOnInit() {
    this.dataUser = await this.loginService.getData(STORAGE_KEY);
    console.log(this.dataUser);
    this.cargarNotificaciones();
  }

  cargarNotificaciones(event?: any) {
    if (this.page > this.totalPages) {
      if (event) event.target.disabled = true;
      return;
    }
    this.historialService.getNotificacionesByUser(this.dataUser._id, this.page, this.limit)
      .subscribe(res => {
        console.log(res, this.notificaciones);
        this.notificaciones = [...this.notificaciones, ...res.notificaciones];
        this.totalPages = res.totalPages;
        this.page++;
        if (event) event.target.complete();
        if (this.page > this.totalPages && event) event.target.disabled = true;
      });
  }

  closeModal() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  marcarComoLeida(n: any, index: number) {
    if (!n.isRead) {
      this.historialService.marcarNotificacionComoLeida(n._id).subscribe(res => {
        this.notificaciones[index].isRead = true;
      });
    }
    this.closeModal();
    if (n.data.id_prestamo) {
      setTimeout(() => {
        this.router.navigate(['/home/prestamos'], { queryParams: { id_prestamo: n.data.id_prestamo } });
      }, 200); // 200ms para asegurar cierre visual
    } else if (n.type === 'otro' && n.data && n.data.clientes) {
      setTimeout(() => {
        this.router.navigate(['/home/clientes'], { queryParams: { id_cliente: n.data.clientes[0] } });
      }, 200); // 200ms para asegurar cierre visual
    }
  }

  srcImageName(images: { originalname: string }[], name: string): any {
    if (images && images.length > 0) {
      return images.find(img => img.originalname === name + '.jpeg');
    } else {
      return { url: 'https://ionicframework.com/docs/img/demos/avatar.svg' }; // Default image if not found
    }
  }
  
}
