import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ProfileModalComponent } from '../profile-modal/profile-modal.component';
import { LoginService } from '../services/login/login.service';
import { Router, NavigationEnd } from '@angular/router';
import { NotificModalComponent } from '../notific-modal/notific-modal.component';
import { HistorialService } from '../services/historial/historial.service';


const STORAGE_KEY = 'login-data-user'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  mostrarHeader = true;

  tieneNotificacionesPendientes = 0;

  dataUser: any;

  message = 'This modal example uses the modalController to present and dismiss modals.';

  title = 'Home';

  routeTitleMap: { [key: string]: string } = {
    'asesores': 'Asesores',
    'clientes': 'Clientes',
    'dashboard': 'Wallet',
    'prestamos': 'Prestamos'
  };

  constructor(
    private modalCtrl: ModalController,
    public loginService: LoginService,
    public router: Router,
    private historialService: HistorialService,
  ) {}

  async ngOnInit() {
    this.dataUser = await this.loginService.getData(STORAGE_KEY);
    console.log(this.dataUser.evidencia_aval); 

    // Detecta la ruta activa al iniciar
    this.actualizarHeader(this.router.url);

    // Escucha cambios de ruta
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.actualizarHeader(event.urlAfterRedirects || event.url);
      }
    });


    // Consulta si hay notificaciones pendientes
    if (this.dataUser?._id) {
      this.checkNotificacionesPendientes();
    }
  }

  actualizarHeader(url: string) {
    // Solo oculta el header en /home/dashboard
    this.mostrarHeader = !url.startsWith('/home/dashboard');
    // ...actualiza el título como antes...
    const match = url.match(/\/home\/(\w+)/);
    if (match && match[1] && this.routeTitleMap[match[1]]) {
      this.title = this.routeTitleMap[match[1]];
    }
  }

  checkNotificacionesPendientes() {
    this.historialService.getNotificacionesNoLeidas(this.dataUser._id)
      .subscribe((res:any) => {
        // Si hay alguna no leída, la propiedad será true
        console.log('Notificaciones no leídas:', res);
        this.tieneNotificacionesPendientes = res.count
        console.log('Notificaciones pendientes:', this.tieneNotificacionesPendientes);
      });
  }

  async openProfileModal() {
    const modal = await this.modalCtrl.create({
      component: ProfileModalComponent,
    });
    await modal.present();

    // Espera a que el modal se cierre y recarga la data del usuario
    const { role } = await modal.onWillDismiss();
    this.dataUser = await this.loginService.getData(STORAGE_KEY);
  }

  async openNotificacionesModal() {
    const modal = await this.modalCtrl.create({
      component: NotificModalComponent,
    });
    modal.present();
  }
  srcImageName(images: { originalname: string, url:string }[] | undefined, name: string): any {
    if (Array.isArray(images) && images.length > 0) {
      const found = images.find(img => img.originalname === name + '.jpeg');
      return found ? { url: found.url } : { url: 'https://ionicframework.com/docs/img/demos/avatar.svg' };
    } else {
      return { url: 'https://ionicframework.com/docs/img/demos/avatar.svg' };
    }
  }

}
