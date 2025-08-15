import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActionSheetController, ModalController, ToastController, Gesture, GestureController, IonItem, IonCard, IonModal } from '@ionic/angular';
import { ProfileModalComponent } from '../profile-modal/profile-modal.component';
import { UsuariosService } from '../services/usuarios/usuarios.service';
import { HistorialService } from '../services/historial/historial.service';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { LocalFile, LoginService } from '../services/login/login.service';
import { PrestamosService } from '../services/prestamo/prestamos.service';
import { Router } from '@angular/router';
import { Asesor } from '../types';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
})
export class ClientesPage implements OnInit, AfterViewInit {
@ViewChild('formDirective') formDirective!: NgForm;
// @ViewChildren(IonItem, {read: ElementRef}) items!: QueryList<ElementRef>;
@ViewChildren('noAsigItem', {read: ElementRef}) noAsigItems!: QueryList<ElementRef>;
@ViewChild('modal_ase') modal_ase!: IonModal;
  images: LocalFile[] = [];

  isModalOpenAdd = false;
  isModalOpenClient = false;
  isModalOpenOptns = false;
  isModalOpenPicture = false;
  presRetrModal = false;
  rollMedia = '';

  clienteModalInfo: any = {};
  isPrestOrRetrasos = '';

  rollModal = ''

  // Guarda el índice seleccionado para cada préstamo por su id
  selectedPagoIndex: { [idPrestamo: string]: number } = {};

  // Para form 
  formInputPOST: FormGroup;
  formSubmit = false;
  postingCliente = false;
  accordionValues = ['first'];

  pseudo_table_asesors_lastmoves= [
    {
      _id: "6463debc096500b73df445b6",
      nombre: "Alexa Smith",
      email: "alexa.smith-21@gmail.com",
      password: "mari_orion_85",
      role: "CLIENTE",
      deleteStatus: false,
      saldo_asignado: 0,
      telefono: 4961208795,
      direccion: "San Rafael #338 - San Cayetano",
      evidencia: [
        {
          url: 'https://i.pravatar.cc/300?u=1',
          idWeb: 'qCw34Fr32Ff23FG3212351FFS',
          nameImage: 'Profile'
        }
      ],
      createdAt: "2023-05-16T19:51:24.939Z",
      updatedAt: "2023-05-16T20:04:09.596Z",
      __v: 0
    },
    {
      _id: "6463debc096500b73df445b7",
      nombre: "Josefa Talamantes",
      email: "jose.ta_pk@gmail.com",
      password: "josefa_taurus_98",
      role: "CLIENTE",
      deleteStatus: false,
      saldo_asignado: 0,
      telefono: 4496127598,
      direccion: "Alcantará #203 - Los Rosales",
      evidencia: [
        {
          url: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          idWeb: 'qCw34Fr32Ff23FG3212351FFS',
          nameImage: 'Profile'
        }
      ],
      createdAt: "2023-05-16T19:51:24.939Z",
      updatedAt: "2023-05-16T20:04:09.596Z",
      __v: 0
    },
    {
      _id: "6463debc096500b73df445b6",
      nombre: "Deisy Díaz",
      email: "dd_daysi58@gmail.com",
      password: "rosaura_aquia_87",
      role: "CLIENTE",
      deleteStatus: false,
      saldo_asignado: 0,
      telefono: 4498746912,
      direccion: "Saucedo Velasquez - Canteras del Río",
      evidencia: [
        {
          url: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          idWeb: 'qCw34Fr32Ff23FG3212351FFS',
          nameImage: 'Profile'
        }
      ],
      createdAt: "2023-05-16T19:51:24.939Z",
      updatedAt: "2023-05-16T20:04:09.596Z",
      __v: 0
    }
  ]
  clientesNoAsignados:any = []
  resultsClientes: any = [];
  showMore = false; 
  toggleShowMore() {
    this.showMore = !this.showMore; // Toggle the value of showMore
  }
  selectedClientesNoAsignados: any[] = [];

  longPressActive = false;
  longPressedId: string | null = null;

  asesores: Asesor[] = [];
  selectedAsesoresText = 'No se ha asignado asesor';
  selectedAsesores: string[] = [];
  modalAsesores = false;
  asignarAsesorModal = false;
  clienteParaAsignar: any = null;
  asesorParaAsignar: any = null;

  clientesData:any = []
  public results:any = []

  constructor(
    private actionSheetCtrl: ActionSheetController,
    public loginService: LoginService,
    private modalCtrl: ModalController,
    private usuariosService: UsuariosService,
    private prestamosService: PrestamosService,
    private historialService: HistorialService,
    public formPrest : FormBuilder,
    private toastController: ToastController,
    private router: Router,
    private gestureCtrl: GestureController,
    private cdr: ChangeDetectorRef
  ) {
    this.formInputPOST = this.formPrest.group({
      nombre: new FormControl("", Validators.required),
      telefono: new FormControl("", Validators.required),
      email: new FormControl("", Validators.required),
      direccion: new FormControl("", Validators.required),

      nombre_aval: new FormControl("", Validators.required),
      telefono_aval: new FormControl("", Validators.required),
      email_aval: new FormControl("", Validators.required),
      direccion_aval: new FormControl("", Validators.required),
    })
   }

  ngAfterViewInit(): void {
    this.noAsigItems.changes.subscribe(() => {
      this.longPress();
    });
    this.longPress();
  }
  // longPress()
  longPress() {
    const itemsArray = this.noAsigItems.toArray();
    for (let i = 0; i < itemsArray.length; i++) {
      const item = itemsArray[i];
      let pressTimer: any = null;
      const cliente = this.clientesNoAsignados[i];
      if (!cliente) continue;

      const gesture: Gesture = this.gestureCtrl.create({
        el: item.nativeElement,
        threshold: 0,
        gestureName: 'long-press',
        onStart: (ev) => {
          pressTimer = setTimeout(() => {
            if (!this.selectedClientesNoAsignados.some(c => c._id === cliente._id)) {
              this.selectedClientesNoAsignados.push(cliente);
            }
            this.longPressActive = true;
            this.cdr.detectChanges();
          }, 500);
        },
        onEnd: () => {
          clearTimeout(pressTimer);
        }
      });
      gesture.enable(true);
    }
  }
  cancelLongPress() {
    this.longPressActive = false;
    this.longPressedId = null; // Reiniciar el ID del elemento presionado
    this.cdr.detectChanges(); // Forzar actualización del template
    console.log('Long press cancelled:', this.longPressActive);
  }
  // onItemClick(clienteId: string, cliente: any)
  onItemClick(clienteId: string, cliente: any) {
    const idx = this.selectedClientesNoAsignados.findIndex(c => c._id === clienteId);
    if (idx !== -1) {
      // Si ya está seleccionado, deselecciona
      this.selectedClientesNoAsignados.splice(idx, 1);
      if (this.selectedClientesNoAsignados.length === 0) {
        this.longPressActive = false;
      }
    } else if (this.longPressActive) {
      // Si está en modo selección, selecciona el nuevo
      this.selectedClientesNoAsignados.push(cliente);
    } else {
      // Si no está en modo selección, abre el modal normalmente
      this.setOpenClient(true, cliente);
    }
    this.cdr.detectChanges();
  }
  formatData(data: string[], type:'cliente' | 'asesor') {
    if (data.length === 1 && type === 'asesor') {
      const asesor = this.asesores.find((asesor:Asesor) => asesor._id === data[0]);
      return asesor? asesor.nombre : '';
    }
  
    return `No selected`;
  }
  asesorSelectionChanged(asesores: string[]) {
    const asesor = this.asesores.find((asesor:Asesor) => asesor._id === asesores[0]);
    this.selectedAsesores = asesores;
    this.selectedAsesoresText = this.formatData(asesores, 'asesor');
    this.asesorParaAsignar = asesor;
    this.modalAsesores = false; // Cierra el modal de asesores
  }
  removeAseSelection(){
    this.selectedAsesores = [];
    this.selectedAsesoresText = 'No se ha asignado asesor';
    this.asesorParaAsignar = null;
    this.modalAsesores = false; // Cierra el modal de asesores
    setTimeout(() => {
      this.asignarAsesorModal=false;
    }, 100);
  }
  cancelAllSelections() {
    this.selectedClientesNoAsignados = [];
    this.longPressActive = false;
    this.cdr.detectChanges();
  }
  viewClienteNoAsig() {
    if (this.selectedClientesNoAsignados.length === 1) {
      this.cancelLongPress();
      this.setOpenClient(true, this.selectedClientesNoAsignados[0]);
      this.cancelAllSelections();
      this.cdr.detectChanges();
    }
  }
  edithClienteNoAsig() {
    if (this.selectedClientesNoAsignados.length === 1) {
      this.cancelLongPress();
      this.clienteModalInfo = this.selectedClientesNoAsignados[0];
      this.setOpenAdd(true, 'ACTUALIZAR');
      this.cancelAllSelections();
      this.cdr.detectChanges();
    }
  }
  async eliminarClienteNoAsig() {
    const clientesAEliminar = [...this.selectedClientesNoAsignados];
    if (clientesAEliminar.length === 0) return;

    const actionSheet = await this.actionSheetCtrl.create({
      header: '¡Atención!',
      subHeader: `¿Seguro que quieres eliminar ${clientesAEliminar.length > 1 ? 'estos clientes' : 'este cliente'}?`,
      cssClass: 'my-custom-actsheet',
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            let eliminados = 0;
            for (const cliente of clientesAEliminar) {
              await new Promise<void>((resolve) => {
                this.usuariosService.deleteUsuario(cliente._id).subscribe(async (res: any) => {
                  const idx = this.clientesNoAsignados.findIndex((c: any) => c._id === cliente._id);
                  if (idx !== -1) {
                    this.clientesNoAsignados.splice(idx, 1);
                    eliminados++;
                  }
                  resolve();
                });
              });
            }
            this.cancelAllSelections();
            this.cdr.detectChanges();
            await this.presentToast('bottom', `${eliminados} cliente(s) eliminado(s) correctamente`, 2000);
            this.isModalOpenOptns = false;
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          data: { action: 'cancel' },
        },
      ],
    });

    actionSheet.present();
  }
  // async asignarAsesorAMultiplesClientes() {
  //   if (!this.asesorParaAsignar || this.selectedClientesNoAsignados.length === 0) return;

  //   const clienteIds = this.selectedClientesNoAsignados.map(c => c._id);

  //   this.usuariosService.asignarAsesorAClientes(clienteIds, this.asesorParaAsignar._id)
  //     .subscribe(async (res: any) => {
  //       await this.presentToast('bottom', `${this.selectedClientesNoAsignados.length} cliente(s) asignado(s) correctamente`, 2000);
  //       this.clientesNoAsignados = this.clientesNoAsignados.filter(
  //         (c: any) => !clienteIds.includes(c._id)
  //       );
  //       this.cancelAllSelections();
  //       this.cdr.detectChanges();
  //       this.asesorParaAsignar = null;
  //       this.asignarAsesorModal = false;
  //     });
  // }
  async asignarAsesorAClientes(clientes: any[]) {
    if (!this.asesorParaAsignar || clientes.length === 0) return;

    const clienteIds = clientes.map(c => c._id);

    this.usuariosService.asignarAsesorAClientes(clienteIds, this.asesorParaAsignar._id)
      .subscribe(async (res: any) => {
        // Remueve de clientesNoAsignados
        this.clientesNoAsignados = this.clientesNoAsignados.filter(
          (c: any) => !clienteIds.includes(c._id)
        );
        // Remueve de asesores.clientes
        for (let asesor of this.results) {
          asesor.clientes = asesor.clientes.filter(
            (c: any) => !clienteIds.includes(c._id)
          );
        }
        // AGREGA los clientes al asesor seleccionado
        const asesorIndex = this.results.findIndex((a: any) => a._id === this.asesorParaAsignar._id);
        if (asesorIndex !== -1) {
          if (!Array.isArray(this.results[asesorIndex].clientes)) {
            this.results[asesorIndex].clientes = [];
          }
          // Puedes agregar todos los clientes reasignados
          this.results[asesorIndex].clientes.push(...clientes);
        }
        
        await this.presentToast('bottom', `${clientes.length} cliente(s) asignado(s) correctamente`, 2000);
        this.cancelAllSelections();
        this.asesorParaAsignar = null;
        setTimeout(() => {
          this.asignarAsesorModal = false;
        }, 200);
        this.cdr.detectChanges();
      });
  }
  asignarAsesorAMultiplesClientes() {
    // Si hay seleccionados, usa esos; si no, usa el cliente del modal
    const clientes = this.selectedClientesNoAsignados.length > 0
      ? this.selectedClientesNoAsignados
      : (this.clienteModalInfo ? [this.clienteModalInfo] : []);
    this.asignarAsesorAClientes(clientes);
  }
  asignarAsesorAClienteIndividual() {
    if (this.clienteModalInfo) {
      this.asignarAsesorAClientes([this.clienteModalInfo]);
      this.isModalOpenClient = false;
    }
  }
  canContinueAsignarAsesor(): boolean {
    return !!this.asesorParaAsignar && (
      (this.selectedClientesNoAsignados && this.selectedClientesNoAsignados.length > 0) ||
      (!!this.clienteModalInfo && Object.keys(this.clienteModalInfo).length > 0)
    );
  }
  isClienteSeleccionado(cliente: any): boolean {
    return this.selectedClientesNoAsignados.some(c => c._id === cliente._id);
  }


  async ngOnInit() {
    this.loginService.imagesClientes$.subscribe(images => {
      this.images = images;
    });

    await this.loginService.loadFilesEntity('cliente');

    this.setAllData();
  }

  async setAllData() {
    this.clientesData = [];
    this.results = [];
    await this.usuariosService.getAsesores().subscribe((data:any) => {
      let fotoAsesor:any = {};
      data.forEach((item:any) => {
        this.usuariosService.getClientes(item._id).subscribe((clientes: any) => {
          if(item.evidencia_aval.length > 0 ){
            fotoAsesor = item.evidencia_aval.filter((e:any) => e.originalname === 'foto-perfil.jpeg')[0];
            fotoAsesor ? fotoAsesor : fotoAsesor = {url: 'https://ionicframework.com/docs/img/demos/avatar.svg'};
          } else { 
            fotoAsesor = {url: 'https://ionicframework.com/docs/img/demos/avatar.svg'}; 
          }
          this.clientesData.push({
            _id: item._id,
            nombre: item.nombre,
            foto_perfil: fotoAsesor.url, 
            clientes: clientes,
          });
          this.results = [...this.clientesData];
        });
      });
    });
    await this.usuariosService.getClientesNoAsignados().subscribe((data:any) => {
      console.log('Clientes no asignados:', data);
      this.clientesNoAsignados = data;
      this.resultsClientes = [...data]; // Inicializa los resultados con los clientes no asignados
    });
    await this.usuariosService.getAsesores().subscribe((res:any)=>{
      console.log('Asesores para buscar', res)
      this.asesores = res
    });
  }

  goToPrestamo(idPrestamo: string) {
    this.isModalOpenClient = false; // Cierra el modal de clientes
    this.presRetrModal = false; // Cierra el modal de clientes
    setTimeout(() => {
      this.router.navigate(['/home/prestamos'], { queryParams: { id_prestamo: idPrestamo } });
    }, 500); // 200ms para asegurar cierre visual
  }
  goToPrestamoPago(idPrestamo: string, indexPago: number) {
    this.isModalOpenClient = false; // Cierra el modal de clientes
    setTimeout(() => {
      this.router.navigate(['/home/prestamos'], { queryParams: { id_prestamo: idPrestamo, index_pago: indexPago } });
    }, 500); // 200ms para asegurar cierre visual
  }
  goToPrestamos(){
    this.isModalOpenClient = false; // Cierra el modal de clientes
    this.presRetrModal = false; // Cierra el modal de clientes
    setTimeout(() => {
      this.router.navigate(['/home/prestamos'], { queryParams: { post_prestamo: true } });
    }, 200); // 200ms para asegurar cierre visual
  }

  getRetrasosAgrupados() {
    // Suponiendo que clienteModalInfo.historial?.detalles_retrasos es un array
    const retrasos = this.clienteModalInfo.historial?.detalles_retrasos || [];
    const agrupados: { [idPrestamo: string]: any[] } = {};
    for (const r of retrasos) {
      if (!agrupados[r.id_prestamo]) agrupados[r.id_prestamo] = [];
      agrupados[r.id_prestamo].push(r);
    }
    console.log('Retrasos agrupados:', agrupados);
    return agrupados;
  }

  handleRefresh(event:any) {
    setTimeout(() => {
      this.setAllData();
      event.target.complete();
    }, 2000);
  }

  takePicture(imageName:string){
    this.loginService.takePicture(imageName, 'cliente').then(() => {
      this.isModalOpenPicture = false
    })
  }
  selectPicture(imageName:string){
    this.loginService.selectPicture(imageName, 'cliente').then(() => {
      this.isModalOpenPicture = false
    })
  }
  deletePicture(image:any){
    this.loginService.deleteImageEntity(image, 'cliente').then(() => {
      this.isModalOpenPicture = false
    })
  }


  async setOpenAdd(isOpen: boolean, roll:string) {
    this.isModalOpenAdd = isOpen;
    this.rollModal = roll
    console.log("Toy probando",this.clienteModalInfo)

    //console.log(this.clienteModalInfo)
    if (roll === 'ACTUALIZAR' && this.clienteModalInfo) {
      // Llenar el formulario con los datos del asesor seleccionado
      this.formInputPOST.patchValue({
        nombre: this.clienteModalInfo.nombre,
        telefono: this.clienteModalInfo.telefono,
        email: this.clienteModalInfo.email,
        direccion: this.clienteModalInfo.direccion,
        nombre_aval: this.clienteModalInfo.aval_info?.nombre_aval || '',
        telefono_aval: this.clienteModalInfo.aval_info?.telefono_aval || '',
        email_aval: this.clienteModalInfo.aval_info?.email_aval || '',
        direccion_aval: this.clienteModalInfo.aval_info?.direccion_aval || '',
      });
      console.log(this.formInputPOST.value)
      // Si tienes imágenes asociadas, también puedes cargarlas aquí si lo necesitas
    } else {
      // Limpiar el formulario si es un alta nueva
      this.formInputPOST.reset();
      this.clienteModalInfo = {};
    }
    //await this.cancelarSubmit()
  }
  async setOpenClient(isOpen: boolean, item: any){
    this.isModalOpenClient = isOpen;
    this.clienteModalInfo = item;
    await this.historialService.getHistorialByIdUser(item._id).subscribe((data:any) => {
      //console.log('Historial del cliente:', data);
      this.clienteModalInfo.historial = data;
      for (let p of this.clienteModalInfo.historial.prestamos_detallados) {
        //console.log(p.id_prestamo)
        this.prestamosService.getPrestamosById(p.id_prestamo).subscribe((data:any) => {
          //console.log('Prestamos Detallados:', data);
          p.detalles = data;
        });
      }
    });
    console.log('Cliente Modal Info:', this.clienteModalInfo);
  }
  setOpenLongPress(isOpen: boolean) {
    // this.modalAsesores = isOpen;
    this.asignarAsesorModal = isOpen;
    this.cdr.detectChanges();
  }

  //!!!ANALIZAR ESTE METODO CODUGO DUPLICADO PARA PRESTAMOS Y RETRASOS!!!
  async setOpenPresAtraz(isOpen: boolean, dataType: 'prestamos' | 'retrasos') {
    this.presRetrModal = isOpen;
    //console.log('Soy prestamos o retrasos: ', array)
    this.isPrestOrRetrasos = dataType;
    // for (let p of this.clienteModalInfo.historial.prestamos_detallados) {
    //   this.prestamosService.getPrestamosById(p.id_prestamo).subscribe((data:any) => {
    //     //console.log('Prestamos Detallados:', data);
    //     p.detalles = data;
    //   });
    // }
    // Inicializa el índice seleccionado en 0 para cada préstamo
    if (this.clienteModalInfo.historial?.prestamos_detallados) {
      for (let p of this.clienteModalInfo.historial.prestamos_detallados) {
        this.selectedPagoIndex[p.id_prestamo] = 0;
      }
    }
  }
  getProximoPago(tablaAmortizacion: any[]): { pago: any, idx: number } | null {
    if (!Array.isArray(tablaAmortizacion) || tablaAmortizacion.length === 0) {
      return null;
    }
    const hoy = new Date();
    // Filtra pagos cuya fecha de pago es igual o mayor a hoy (sin importar estado)
    const pagosProximos = tablaAmortizacion
      .map((pago, idx) => ({ pago, idx }))
      .filter(obj => new Date(obj.pago.fecha_pago) >= hoy)
      .sort((a, b) => new Date(a.pago.fecha_pago).getTime() - new Date(b.pago.fecha_pago).getTime());

    if (pagosProximos.length > 0) {
      // Retorna el primero (el más próximo)
      return pagosProximos[0];
    } else {
      // Si no hay pagos próximos, retorna el último pago de la tabla y su indice
      return { pago: tablaAmortizacion[tablaAmortizacion.length - 1], idx: tablaAmortizacion.length - 1 };
    }
  }
  setOpenOpts(isOpen: boolean, item: any) {
    this.isModalOpenOptns = isOpen;
    this.clienteModalInfo = item;
  }
  
  async presentActionSheet() {
    const cliente = this.clienteModalInfo;
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¡Atención!',
      subHeader: '¿Seguro que quieres eliminar este cliente?',
      cssClass: 'my-custom-actsheet',
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            // Llama al endpoint para eliminar
            setTimeout(() => {
              this.usuariosService.deleteUsuario(cliente._id).subscribe(async (res: any) => {
                // Mostrar toast de éxito
                await this.presentToast('bottom', 'Cliente eliminado correctamente', 2000);

                // Eliminar del array clientesNoAsignados si existe ahí
                const idxNoAsig = this.clientesNoAsignados.findIndex((c: any) => c._id === cliente._id);
                if (idxNoAsig !== -1) {
                  this.clientesNoAsignados.splice(idxNoAsig, 1);
                } else {
                  // Si no está en clientesNoAsignados, buscar en los arrays de asesores
                  for (let asesor of this.results) {
                    const idx = asesor.clientes.findIndex((c: any) => c._id === cliente._id);
                    if (idx !== -1) {
                      asesor.clientes.splice(idx, 1);
                      break;
                    }
                  }
                }
                this.cancelLongPress();
                this.cdr.detectChanges();
                this.isModalOpenOptns = false;
              });
            }, 1500);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    actionSheet.present();
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: ProfileModalComponent,
    });
    modal.present();
  }

  handleInput(event:any) {
    const query = event.target.value.toLowerCase();
    // Array para los resultados filtrados
    const filteredResults: any[] = [];

    // Recorre todos los asesores
    this.clientesData.forEach((asesor: any) => {
      // Filtra los clientes de este asesor que coincidan con el query
      const filteredClientes = asesor.clientes.filter((cliente: any) =>
        cliente.nombre.toLowerCase().includes(query) ||
        cliente.email.toLowerCase().includes(query) ||
        cliente.telefono?.toString().includes(query)
      );
      // Si hay clientes que coinciden, agrega el asesor y solo esos clientes
      if (filteredClientes.length > 0) {
        filteredResults.push({
          ...asesor,
          clientes: filteredClientes
        });
      }
    });

    // Filtra clientes no asignados
    const filteredNoAsignados = this.resultsClientes.filter((cliente: any) =>
      cliente.nombre.toLowerCase().includes(query) ||
      cliente.email.toLowerCase().includes(query) ||
      cliente.telefono?.toString().includes(query)
    );

    this.results = filteredResults;
    this.clientesNoAsignados = filteredNoAsignados;
  }

  //For form
  async submitAddCliente(){
    this.formSubmit = true
    //const blobs = []
    console.log(this.formInputPOST.value, this.formInputPOST.valid, this.images, this.rollModal)


    // if(!this.formInputPOST.valid || this.images.length != 8 && this.rollModal != 'ACTUALIZAR'){
    if(!this.formInputPOST.valid && this.rollModal != 'ACTUALIZAR'){
      console.log("not valid"); return
    }else{

      this.postingCliente = true

      let formData: any = new FormData();
      formData.append('nombre', this.formInputPOST.value.nombre);
      formData.append('telefono', this.formInputPOST.value.telefono); 
      formData.append('email', this.formInputPOST.value.email);
      formData.append('direccion', this.formInputPOST.value.direccion);
      formData.append('role', "CLIENTE");
      formData.append('password', "werv!@");
      formData.append('nombre_aval', this.formInputPOST.value.nombre_aval);
      formData.append('telefono_aval', this.formInputPOST.value.telefono_aval);
      formData.append('email_aval', this.formInputPOST.value.email_aval);
      formData.append('direccion_aval', this.formInputPOST.value.direccion_aval);
      for (let file of this.images) { // Add images to formData
        const response = await fetch(file.data);
        const blob = await response.blob();
        if (file.name.includes('aval'))
          formData.append('image_aval', blob, file.name);
        else
          formData.append('image', blob, file.name);
      }
      
      if(this.rollModal === 'ACTUALIZAR'){
        formData.append('id', this.clienteModalInfo._id);

        await this.usuariosService.putUsuario(this.clienteModalInfo._id, formData).subscribe((data: any) => {
          setTimeout(() => {
            console.log(data)
            this.postingCliente = false
            this.formDirective?.resetForm();
            this.formSubmit = false;

            // Agregar el nuevo asesor al principio del array (opcional)
            if (data && data.usuario) {
              // Actualizar el asesor en el array results
              const index = this.results.findIndex((item: any) => item._id === data.usuario._id);
              if (index !== -1) {
                this.results[index] = data.usuario;
              }
              this.presentToast('bottom', data.message, 2500);
            }

            this.loginService.deleteFolder(this.loginService.imagesClientes, 'cliente');
            this.isModalOpenAdd = false;
            this.images = []; // Limpiar las imágenes después de enviar
          }, 2000);
        });
      }else {
        await this.usuariosService.postUsuario(formData).subscribe((data: any) => {
          setTimeout(() => {
            console.log(data)
            this.postingCliente = false
            this.formDirective?.resetForm();
            this.formSubmit = false;

            // Agregar el nuevo asesor al principio del array (opcional)
            if (data && data.usuario) {
              this.results.unshift(data.usuario);
              this.presentToast('bottom', data.message, 2500);
            }

            this.loginService.deleteFolder(this.loginService.imagesClientes, 'cliente');
            this.isModalOpenAdd = false;
            this.images = []; // Limpiar las imágenes después de enviar
          }, 2000);
        })
      }

      
    }
  }
  async cancelarSubmit() {

    const valores = Object.values(this.formInputPOST.value);
    const no_data = valores.every(valor => valor === '' || valor === null || valor === undefined); 

    if(no_data && this.images.length == 0){
      this.isModalOpenAdd = false; //Cerrar modal inmediato si no hay datos
    }else{
      const actionSheet = await this.actionSheetCtrl.create({
        header: '¡Atención!',
        subHeader: '¿Seguro que quieres continuar? Se perdera cualquier cambio no guardado.',
        //cssClass: 'my-custom-actsheet',
        buttons: [
          {
            text: 'Cancelar',
            handler: () => { return true }
          },
          {
            text: 'Aceptar',
            handler: () => {
              this.formDirective?.resetForm();
              this.formSubmit = false;

              this.loginService.deleteFolder(this.loginService.imagesClientes, 'cliente');
              this.isModalOpenAdd = false;
            }
          },
        ],
      });

      actionSheet.present();
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


  setEvidencia(typeMedia: 'foto-perfil' | 'INE-front' | 'INE-back' | 'com-domicilio' | 'foto-perfil-aval' | 'INE-front-aval' | 'INE-back-aval' | 'com-domicilio-aval'){
    console.log(typeMedia)
    this.isModalOpenPicture = true
    this.rollMedia = typeMedia
  }
  getImageByName(name: string): LocalFile | undefined {
    return this.images.find(img => img.name === name + '.jpeg');
  }
  srcImageName(images: { originalname: string }[], name: string): any {
    if(images && images.length > 0) {
      return images.find(img => img.originalname === name + '.jpeg');
    } else if (!this.isModalOpenAdd) { // Si modal add/update esta abierto no muestres la imagen por defecto
      return { url: 'https://ionicframework.com/docs/img/demos/avatar.svg' }; // Default image if not found
    }
  }
  accordionGroupChange = (ev: any) => {
  this.accordionValues = ev.detail.value; // value es un array de los expandidos
  };


  selectPago(idPrestamo: string, index: number) {
    this.selectedPagoIndex[idPrestamo] = index;
    console.log('Pago seleccionado:', this.selectedPagoIndex[idPrestamo])
  }

}
