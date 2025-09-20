import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { ProfileModalComponent } from '../profile-modal/profile-modal.component';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { WalletService } from '../services/wallet/wallet.service';
import { LoginService } from '../services/login/login.service';
import { PrestamosService } from '../services/prestamo/prestamos.service';
import { UsuariosService } from '../services/usuarios/usuarios.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { NotificModalComponent } from '../notific-modal/notific-modal.component';
import { HistorialService } from '../services/historial/historial.service';
import { ActivatedRoute } from '@angular/router';

const STORAGE_KEY = 'login-data-user'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  @ViewChild('formDirective') formDirective!: NgForm;
  
  tieneNotificacionesPendientes = 0;

  dataUsuario:any=[];

  dataWallet:any;
  movimientosFiltrados: any[] = [];
  verMovimientos = false;
  viewMovimiento = false;
  movimientoInfo: any;

  //////////////////////
  mainListLimit = 10;
  mainListPage = 1;
  mainListTotalPages = 1;
  mainListFiltrados: any[] = []; // Aquí guardarás los movimientos filtrados paginados

  movimientosAgrupados: any[] = [];
  movimientosAcumulados: any[] = []; // Acumula todos los movimientos paginados
  page = 1;
  limit = 10;

  asesores: any[] = [];
  asesorInfo: any;
  clientes_baja: any[] = [];
  clienteInfo: any;
  prestamos: any[] = [];
  prestamoInfo: any;

  settingsWallet = false;

  filterModal = false;
  fechaInicio: string | null = null;
  fechaFin: string | null = null;
  filtroIngresos: boolean = false;
  filtroEgresos: boolean = false;
  isFiltrado = false;

  chartData: ChartData<'bar'> = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
    datasets: [
      { label: 'Ventas', data: [12, 19, 3, 5, 2], backgroundColor: '#3880ff' }
    ]
  };
  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: '#000' }
      }
    }
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: '#ffffff' }
      },
      y: {
        ticks: { color: '#ffffff' }
      }
    }
  };

  // barChartData: ChartConfiguration<'bar'>['data'] = {
  //   labels: ['Pagado', 'Prestado'],
  //   datasets: [
  //     {
  //       data: [2500, 1500],
  //       backgroundColor: ['#dbeafe', '#3b82f6'], // Colores de barras
  //       borderRadius: 8 // Bordes redondeados
  //     }
  //   ]
  // };

  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  // barChartOptions: ChartOptions<'bar'> = {
  //   responsive: true,
  //   plugins: { legend: { display: true } },
  //   scales: { x: { ticks: { color: '#222' } }, y: { ticks: { color: '#222' } } }
  // };

  pieChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  pieChartOptions = {
    type: 'doughnut',
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Chart.js Doughnut Chart'
        }
      }
    },
  };
  lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  guardados: any[] = [];



  constructor(
    private modalCtrl: ModalController,
    private walletService: WalletService,
    private loginService: LoginService,
    private prestamoService: PrestamosService,
    private usuariosService: UsuariosService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router,
    private historialService: HistorialService,
    private route: ActivatedRoute,
  ) { }

  async ngOnInit() {
    this.dataUsuario = await this.loginService.getData(STORAGE_KEY);
    //console.log(this.dataUsuario);

    // Consulta si hay notificaciones pendientes
    if (this.dataUsuario?._id) {
      this.checkNotificacionesPendientes();
    }
    
    this.setAllData();
    this.filtroFromBack();

    this.buscarGuardado()
  }

  async setAllData(){
    await this.walletService.getWallet('688da59bfb293ae6030bc09f').subscribe((res: any) => {
      //console.log(res);
      this.prepareBarChartData(res.movimientos);
      this.preparePieChartData(res.movimientos);
      this.prepareLineChartData(res.movimientos);

      // Agrupa por fecha (formato: YYYY-MM-DD)
      // const grupos: { [fecha: string]: any[] } = {};
      // for (const mov of res.movimientos) {
      //   const fecha = new Date(mov.fecha).toISOString().slice(0, 10); // 'YYYY-MM-DD'
      //   if (!grupos[fecha]) grupos[fecha] = [];
      //   grupos[fecha].push(mov);
      // }

      // // Convierte a array ordenado por fecha descendente
      // res.movimientos = Object.entries(grupos)
      //   .map(([fecha, movimientos]) => ({ fecha, movimientos }))
      //   .sort((a, b) => b.fecha.localeCompare(a.fecha));
      //this.dataWallet = res;
      // this.movimientosFiltrados = [...this.dataWallet.movimientos];
      // console.log(this.dataWallet);

      this.dataWallet = res;
      this.generarMovimientos();
      this.cargarGuardados();
    });

    await this.prestamoService.getPrestamos().subscribe((res: any) => {
      this.prestamos = res;
    });

    await this.usuariosService.getAsesores().subscribe((res: any) => {
      this.asesores = res;
    });

    await this.usuariosService.getClientesBaja().subscribe((res: any) => {
      this.clientes_baja = res;
    });

  }

  async cargarGuardados() {
    await this.historialService.obtenerMovimientosGuardados(this.dataWallet.owner).subscribe((res: any) => {
      this.guardados = res.guardados.map((mov: any) => mov._id);
      console.log('Movimientos guardados:', this.guardados);
    });
  }
  buscarGuardado(){
    this.route.queryParams.subscribe(params => {
      if (params['movimientoId']) {
        // Consulta directa al backend por el movimiento
        this.historialService.getMovimientoById(params['movimientoId']).subscribe((mov: any) => {
          console.log(mov);
          this.movimientoInfo = mov;
          this.viewMovimiento = true;
          // Limpia el parámetro para evitar abrirlo de nuevo al refrescar
          this.router.navigate([], { queryParams: {}, replaceUrl: true });
        });
      }
    });
  }

  async generarMovimientos(event?: any) {

    setTimeout(() => {
      let agrupadosPorFecha: any[] = [];
      this.historialService.getMovimientos(this.dataWallet.owner, {
        page: this.page,
        limit: this.limit
      }).subscribe((movData: any) => {
        // Acumula los movimientos paginados
        this.movimientosAcumulados = [...this.movimientosAcumulados, ...movData.movimientos];
  
        // Agrupa por fecha (formato: YYYY-MM-DD)
        const grupos: { [fecha: string]: any[] } = {};
        for (const mov of this.movimientosAcumulados) {
          const fecha = new Date(mov.fecha).toISOString().slice(0, 10);
          if (!grupos[fecha]) grupos[fecha] = [];
          grupos[fecha].push(mov);
        }
  
        // Convierte a array ordenado por fecha descendente
        agrupadosPorFecha = Object.entries(grupos)
          .map(([fecha, movimientos]) => ({ fecha, movimientos }))
          .sort((a, b) => b.fecha.localeCompare(a.fecha));

        this.movimientosFiltrados = [...agrupadosPorFecha];
        // this.mainListFiltrados = [...agrupadosPorFecha];

        // Completa el infinite scroll
        if (event) event.target.complete();
  
        // Si ya no hay más páginas, deshabilita el infinite scroll
        if (this.page >= movData.totalPages && event) event.target.disabled = true;
  
        // Avanza la página para la siguiente carga
        this.page++;
      });
    }, 1000);
  }

  onIonInfinite(ev: any) {
    // this.generateItems();
    console.log('Cargar más movimientos...');
    console.log(ev);
    setTimeout(() => {
      if (ev) ev.target.complete();
      console.log('Se cargó la data');
    }, 900);
  }

  handleRefresh(event:any) {
    setTimeout(() => {
      this.setAllData();
      event.target.complete();
    }, 2000);
  }

  prepareBarChartData(movimientos: any[]) {
    // Agrupa movimientos por mes y tipo
    const ingresos: { [mes: string]: number } = {};
    const egresos: { [mes: string]: number } = {};
    for (const mov of movimientos) {
      const mes = new Date(mov.fecha).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (mov.tipo === 'ingreso') ingresos[mes] = (ingresos[mes] || 0) + mov.monto;
      if (mov.tipo === 'egreso') egresos[mes] = (egresos[mes] || 0) + mov.monto;
    }
    const meses = Array.from(new Set([...Object.keys(ingresos), ...Object.keys(egresos)])).sort();
    this.barChartData = {
      labels: meses,
      datasets: [
        { label: 'Ingresos', data: meses.map(m => ingresos[m] || 0), backgroundColor: '#3b82f6' },
        { label: 'Egresos', data: meses.map(m => egresos[m] || 0), backgroundColor: '#dbeafe' }
      ]
    };
    //console.log(this.barChartData);
  }
  preparePieChartData(movimientosData: any[]) {
    const categorias: { [cat: string]: number } = {};
    for (const mov of movimientosData) {
      if (mov.tipo === 'egreso') {
        const cat = mov.descripcion || 'Otro';
        categorias[cat] = (categorias[cat] || 0) + mov.monto;
      }
    }
    // Ordenar y agrupar "Otros"
    const sorted = Object.entries(categorias).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 3);
    const otros = sorted.slice(3).reduce((sum, [, v]) => sum + v, 0);
    const labels = top.map(([k]) => k);
    const data = top.map(([, v]) => v);
    if (otros > 0) {
      labels.push('Otros');
      data.push(otros);
    }
    this.pieChartData = {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#fbbf24', '#3b82f6', '#f87171', '#6366f1'],
        borderWidth: 2
      }]
    };
  }
  prepareLineChartData(movimientosData: any[]) {
    let saldo = 0;
    const labels: string[] = [];
    const data: number[] = [];
    const movimientos = [...movimientosData].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    for (const mov of movimientos) {
      saldo += mov.tipo === 'ingreso' ? mov.monto : -mov.monto;
      labels.push(new Date(mov.fecha).toLocaleDateString());
      data.push(saldo);
    }
    this.lineChartData = {
      labels,
      datasets: [{ label: 'Saldo', data, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true }]
    };
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: ProfileModalComponent,
    });
    modal.present();
  }

  setOpenMovimientos(isOpen: boolean) {
    this.verMovimientos = isOpen;
  }
  setOpenSettings(isOpen: boolean) {
    this.settingsWallet = isOpen;
  }
  setOpenFilter(isOpen: boolean) {
    this.filterModal = isOpen;
  }

  setViewMov(isOpen: boolean, mov: any) {
    console.log(mov);
    this.viewMovimiento = isOpen;
    this.movimientoInfo = mov;
  }

  srcImageName(images: { originalname: string }[], name: string): any {
    if (images && images.length > 0) {
      return images.find(img => img.originalname === name + '.jpeg');
    } else {
      return { url: 'https://ionicframework.com/docs/img/demos/avatar.svg' }; // Default image if not found
    }
  }

  async presentToast(position: 'top' | 'middle' | 'bottom', message: string, time: number) {
    const toast = await this.toastController.create({
      message: message,
      duration: time,
      position: position,
    });

    await toast.present();
  }

  async activarDesactivarWallet() {
    const nuevaAccion = !this.dataWallet.activa;
    const alert = await this.alertController.create({
      header: '¡Atención!',
      subHeader: `${nuevaAccion ? 'Encender' : 'Apagar'} tarjeta`,
      message: `¿Estás seguro de que deseas ${nuevaAccion ? 'encender' : 'apagar'} la wallet?.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: async () => {
            this.walletService.setEstadoWallet(this.dataWallet.owner, nuevaAccion).subscribe((res: any) => {
              this.dataWallet = res;
              this.settingsWallet = false;
              this.presentToast('bottom', `Wallet ${nuevaAccion ? 'activada' : 'desactivada'} correctamente`, 2000);
            });
          }
        }
      ],
    });

    await alert.present();
  }

  async depositarWallet() {
    const alert = await this.alertController.create({
      header: 'Depositar a Wallet',
      inputs: [
        {
          name: 'monto',
          type: 'number',
          placeholder: 'Monto a depositar'
        },
        {
          name: 'descripcion',
          type: 'text',
          placeholder: 'Descripción (opcional)'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Depositar',
          handler: data => {
            const monto = parseFloat(data.monto);
            if (monto > 0) {
              this.walletService.depositar(this.dataWallet.owner, monto, data.descripcion).subscribe((res: any) => {
                this.dataWallet = res;
                this.settingsWallet = false;
                this.presentToast('bottom', 'Depósito realizado correctamente', 2000);
              });
            } else {
              this.presentToast('top', 'El monto debe ser mayor a cero', 2000);
            }
          }
        }
      ],
    });
    await alert.present();
  }

  async retirarWallet() {
    const alert = await this.alertController.create({
      header: 'Retirar de Wallet',
      inputs: [
        {
          name: 'monto',
          type: 'number',
          placeholder: 'Monto a retirar'
        },
        {
          name: 'descripcion',
          type: 'text',
          placeholder: 'Descripción (opcional)'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Retirar',
          handler: data => {
            const monto = parseFloat(data.monto);
            if (monto > 0 && monto <= this.dataWallet.saldo) {
              this.walletService.retirar(this.dataWallet.owner, monto, data.descripcion).subscribe((res: any) => {
                this.dataWallet = res;
                this.settingsWallet = false;
                this.presentToast('bottom', 'Retiro realizado correctamente', 2000);
              });
            } else {
              this.presentToast('top', 'Monto inválido o saldo insuficiente', 2000);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  
  goToPrestamo(idPrestamo: string) {
    if (this.verMovimientos) this.verMovimientos = false; //Si el modal de ver todos los movimientos está abierto, se cierra
    this.viewMovimiento = false; // Cierra el modal de movimientos
    setTimeout(() => {
      this.router.navigate(['/home/prestamos'], { queryParams: { id_prestamo: idPrestamo } });
    }, 500); // 200ms para asegurar cierre visual
  }

  filtrarMovimientos(){
    console.log(this.filtroIngresos, this.filtroEgresos, this.fechaInicio, this.fechaFin);
    if (!this.dataWallet?.movimientos) return;

    // Validación de fechas
    if (this.fechaInicio && this.fechaFin) {
      const inicio = new Date(this.fechaInicio);
      const fin = new Date(this.fechaFin);
      if (fin < inicio) {
        this.presentToast('top', 'La fecha final no puede ser menor a la fecha de inicio', 2000);
        return;
      }
    }

    // Desagrupa si ya está agrupado
    let movimientos = Array.isArray(this.dataWallet.movimientos[0]?.movimientos)
      ? this.dataWallet.movimientos.flatMap((g: any) => g.movimientos)
      : this.dataWallet.movimientos;

    // Filtrar por fechas
    if (this.fechaInicio) {
      const inicio = new Date(this.fechaInicio);
      movimientos = movimientos.filter((m: any) => new Date(m.fecha) >= inicio);
    }
    if (this.fechaFin) {
      const fin = new Date(this.fechaFin);
      fin.setHours(23, 59, 59, 999); // Incluye todo el día
      movimientos = movimientos.filter((m: any) => new Date(m.fecha) <= fin);
    }

    // Filtrar por tipo solo si alguno está activo
    if (this.filtroIngresos !== this.filtroEgresos) {
      movimientos = movimientos.filter((m: any) =>
        (this.filtroIngresos && m.tipo === 'ingreso') ||
        (this.filtroEgresos && m.tipo === 'egreso')
      );
    }

    // Agrupar por día
    const grupos: { [fecha: string]: any[] } = {};
    for (const mov of movimientos) {
      const fecha = new Date(mov.fecha).toISOString().slice(0, 10);
      if (!grupos[fecha]) grupos[fecha] = [];
      grupos[fecha].push(mov);
    }

    this.movimientosFiltrados = Object.entries(grupos)
      .map(([fecha, movimientos]) => ({ fecha, movimientos }))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));

    this.filterModal = false;
    this.isFiltrado = true;
  }

  filtroFromBack(manual: boolean = false) {

    let agrupadosPorFecha: any[] = [];
    let movimientosAcumulados: any[] = [];  // Acumula todos los movimientos paginados
    const queryParams: any = {
      page: this.mainListPage,
      limit: this.mainListLimit
    };
    if (this.fechaInicio) queryParams.fechaInicio = this.fechaInicio;
    if (this.fechaFin) queryParams.fechaFin = this.fechaFin;
    const tiposSeleccionados = [];
    if (this.filtroIngresos) tiposSeleccionados.push('ingreso');
    if (this.filtroEgresos) tiposSeleccionados.push('egreso');
    // Si tienes "otros", agrégalo aquí
    if (tiposSeleccionados.length > 0) {
      queryParams.tipo = tiposSeleccionados.join(',');
    }

    this.historialService.getMovimientos('688da59bfb293ae6030bc09f', queryParams).subscribe((res: any) => {
      movimientosAcumulados = [...movimientosAcumulados, ...res.movimientos];
      
      this.mainListTotalPages = res.totalPages;
      // Agrupa por fecha
      const grupos: { [fecha: string]: any[] } = {};
      for (const mov of movimientosAcumulados) {
        const fecha = new Date(mov.fecha).toISOString().slice(0, 10);
        if (!grupos[fecha]) grupos[fecha] = [];
        grupos[fecha].push(mov);
      }

      // Convierte a array ordenado por fecha descendente
      agrupadosPorFecha = Object.entries(grupos)
        .map(([fecha, movimientos]) => ({ fecha, movimientos }))
        .sort((a, b) => b.fecha.localeCompare(a.fecha));

      this.mainListFiltrados = [...agrupadosPorFecha];

      if (manual) {
        this.filterModal = false;
        this.isFiltrado = true;
      }
      console.log(res)
      // this.filterModal = false;
      // this.isFiltrado = true;
    });
  }
  mostrarMasMovimientos() {
    if (this.isFiltrado && this.mainListPage < this.mainListTotalPages) {
      this.mainListLimit += 10; // Aumenta el límite para mostrar más
      this.filtroFromBack(); // No resetea, solo agrega más
      console.log(this.mainListPage, this.mainListTotalPages)
    }
  }

  limpiarFiltro() {
    this.fechaInicio = null;
    this.fechaFin = null;
    this.filtroIngresos = false;
    this.filtroEgresos = false;
    this.filterModal = false;

    this.isFiltrado = false;
    this.mainListPage = 1;
    this.mainListLimit = 10;
    this.mainListTotalPages = 1;
    this.filtroFromBack();
  }


  async openNotificacionesModal() {
    const modal = await this.modalCtrl.create({
      component: NotificModalComponent,
    });
    modal.present();
  }

  checkNotificacionesPendientes() {
    this.historialService.getNotificacionesNoLeidas(this.dataUsuario._id)
      .subscribe((res:any) => {
        // Si hay alguna no leída, la propiedad será true
        console.log('Notificaciones no leídas:', res);
        this.tieneNotificacionesPendientes = res.count
        console.log('Notificaciones pendientes:', this.tieneNotificacionesPendientes);
      });
  }

  toggleGuardado(mov: any) {
    if (this.guardados.includes(mov._id)) {
      this.historialService.eliminarMovimientoGuardado(this.dataWallet.owner, mov._id).subscribe(() => {
        this.presentToast('bottom', 'Movimiento quitado de guardados', 1500);
        this.cargarGuardados();
      });
    } else {
      this.historialService.guardarMovimiento(this.dataWallet.owner, mov._id).subscribe(() => {
        this.presentToast('bottom', 'Movimiento guardado', 1500);
        this.cargarGuardados();
      });
    }
  }

}
