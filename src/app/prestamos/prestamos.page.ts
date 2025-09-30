import { Component, OnInit, ViewChild, LOCALE_ID, Inject, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { ProfileModalComponent } from '../profile-modal/profile-modal.component';
import { ModalController, IonModal, AlertController, AlertInput, ToastController, RangeCustomEvent, IonAccordionGroup } from '@ionic/angular';
import { PrestamosService } from '../services/prestamo/prestamos.service';
import { Asesor, Cliente, Item } from '../types'
import { LocalFile, LoginService } from '../services/login/login.service';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import Swiper from 'swiper';
import { HistorialService } from '../services/historial/historial.service';
import { UsuariosService } from '../services/usuarios/usuarios.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { NotificModalComponent } from '../notific-modal/notific-modal.component';


const STORAGE_KEY = 'login-data-user'

@Component({
  selector: 'app-prestamos',
  templateUrl: './prestamos.page.html',
  styleUrls: ['./prestamos.page.scss'],
  animations: [
    trigger('slide',[
      state('false', style({ translate: '-200%' })),
      state('true', style({ translate: 0 })),
      transition('false <=> true', animate('0.15s ease-in-out'))
    ]),
    trigger('slide2',[
      state('false', style({ translate: '200%' })),
      state('true', style({ translate: 0 })),
      transition('false <=> true', animate('0.15s ease-in-out'))
    ]),
  ]
})
export class PrestamosPage implements OnInit {
  @ViewChild('modal_cli') modal_cli!: IonModal;
  @ViewChild('modal_ase') modal_ase!: IonModal;
  // @ViewChild('formDirective') formDirective : FormGroupDirective;
  @ViewChild('formDirective') formDirective!: NgForm;
  @ViewChild('swiper')
  
  swiperRef: ElementRef | undefined;
  swiper?:Swiper
  thumbsSwiper: any;

  @ViewChild('accordionGroup') accordionGroup!: IonAccordionGroup;
  @ViewChildren('accordionItem') accordionItems!: QueryList<ElementRef>;

  pinFormatter(value: number) {
    return `${value}0K`;
  }

  images: LocalFile[] = [];
  
  toZoom = false;
  zoomImage = '';
  zoomImageName = '';

  dataUser:any = []

  public progress = 0.5; //Regla de tres para porcentaje de barra (aprobados)*(1)/(total de prestamos) || (aprobados)/(total de prestamos)
  openModalInfo = false
  isModalOpenAdd = false
  isModalClientes = false
  isModalFilter = false

  //SEGMENT
  segmentValue = 'tabla'

  //FORM
  rollModal = ''
  editedAsesor:any = {};
  formInputPOST: FormGroup;
  formSubmit = false;
  postingPrestamo = false
  
  noPaymentChange = true
  canDismiss= true
  backdropDismiss = true
  updatingPago = false
  
  accept_reject = false
  
  textAreaFocused: number | null = null;
  bonoCheck: boolean[] = []
  
  // FILTRO
  selectedEstados: string[] = [];
  filters = {
    estados: [] as string[],
    saldoMin: 0,
    clienteId: '',
    asesorId: '',
    tipoPago: '' // 'mensual' o 'semanal'
  }

  //Modal comprobantes 
  isOpenModalComp = false;
  esperandoPickPictures = false;
  pickedPicturesEsperadas = 0;
  sendingComprobantes = false;
  editComprobantePrestamo = false;
  pagoParaComprobante: any = {comprobantes: []};

  selectedPhotoForDelete: any = [];
  eliminandoPhotos = false;
  
  prestamos:any = [
    {
      titulo:"Aceptado",
      prestamos: []
    },
    {
      titulo:"Pendiente",
      prestamos: []
    },
    {
      titulo:"Rechazado",
      prestamos: []
    },
    {
      titulo:"Cerrados",
      prestamos: []
    }
  ]
  public results : any = []
  modalInfo:any = {}
  copyData:any = {}

  selectedClientesText = '';
  selectedClientes: string[] = [];
  selectedAsesoresText = '';
  selectedAsesores: string[] = [];
  clientes: Cliente[] = [];
  asesores: Asesor[] = [];

  selectedClienteObj:any = {};
  selectedAsesorObj:any = {};
  
  modalAccordionIndex: string | null = null;
  modalAccordionValue: string[] = [];
  initialBreakpoint = 0.6

  openKeyboard = false;
  keyboardValue: number = 0;
  private delPressTimer: any = null;


  constructor(
    private modalCtrl: ModalController,
    private prestService: PrestamosService,
    private historialService: HistorialService,
    private loginService: LoginService,
    private usuerService: UsuariosService,
    private alertController: AlertController,
    private toastController: ToastController,
    public formPrest : FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    @Inject(LOCALE_ID) public locale: string, // Variable local para configurar dates en Español
  ) {
    this.formInputPOST = this.formPrest.group({
      'saldo' : new FormControl("", Validators.required),
      'periodo' :  new FormControl("", Validators.required),
      'dia_pago' :  new FormControl(""),
      'id_cliente' :  new FormControl("", Validators.required),
      'id_asesor' :  new FormControl(),
    })
  }

  checarBono(e:any, pago:any){
    this.noPaymentChange = false
    this.canDismiss =  false
    this.backdropDismiss = false
    if(e.target.value){
      console.log("Si tengo datos")
    }else{
      console.log("No tengo datos")
      pago.estado_pago = 'No pagado'
    }
  }
  checarNotas(){
    console.log('AHHH')
    this.noPaymentChange = false
    this.canDismiss =  false
    this.backdropDismiss = false
  }

  swiperReady(){
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }
  goSlide(){ this.swiperRef?.nativeElement.swiper.slideNext() }
  backSlide(){ this.swiperRef?.nativeElement.swiper.slidePrev() }
  // logActiveIndex() {
  //   console.log(this.swiperRef?.nativeElement.swiper.activeIndex);
  // }
  swiperSlideChanged(e:any){
    const swiper = this.swiperRef?.nativeElement.swiper.activeIndex
    // console.log('slide:', swiper)
    swiper == 0 ? this.segmentValue = 'tabla' : this.segmentValue = 'historial';
    // console.log(e)
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: ProfileModalComponent,
    });
    modal.present();
  }

  async openNotificacionesModal() {
    const modal = await this.modalCtrl.create({
      component: NotificModalComponent,
    });
    modal.present();
  }

  showMore = false;
  toggleShowMore() {
    this.showMore = !this.showMore; // Toggle the value of showMore
  }

  async submitAddPrestamo(){
    this.formSubmit = true;
    console.log(this.formInputPOST.value)
    if (!this.formInputPOST.valid) {
      console.log("Formulario no válido");
      this.presentToast('bottom', 'Por favor, completa todos los campos requeridos para dar de alta un prestamo.', 3500);
      return;
    }
    if(this.formInputPOST.value.saldo <= 0 || this.formInputPOST.value.saldo == null){
      console.log("El saldo debe ser mayor a 0");
      return;
    }
    if(this.dataUser && this.dataUser.role == 'ASESOR'){
      this.formInputPOST.patchValue({'id_asesor': this.dataUser._id})
    }
    if (this.formInputPOST.value.periodo == 14 && this.formInputPOST.value.dia_pago == "") {
      console.log("Falta día de pago para préstamo semanal");
      return;
    }
    this.formInputPOST.value.dia_pago == "" ? delete this.formInputPOST.value.dia_pago : ''; // Eliminar dia_pago si está vacío (si es un prestamo mensual)
    this.postingPrestamo = true;

    const today = new Date().toLocaleDateString('en-CA'); // Fecha de hoy para que funcione correctamente en el backend
    const body = {
      ...this.formInputPOST.value,
      fecha_prestamo: today
    };
    setTimeout(() => {
      this.prestService.postPrestamos(body).subscribe((res: any) => {
        // El backend ya decide si es aceptado o pendiente
        if (res.aceptado) {
          this.addItemAceptados(res.prestamo);
          this.presentToast('bottom', 'Se ha generado la tabla de amortización exitosamente', 4500);
        } else {
          this.addItemPendientes(res.prestamo);
          this.presentToast('top', 'El estado general del cliente debe revisarse antes de aceptar un cliente', 5500);
        }
        this.postingPrestamo = false;
        this.isModalOpenAdd = false;
      }, (err: any) => {
        console.log(err);
        this.postingPrestamo = false;
        this.presentToast('top', `${err.error.message}`, 5500);
      });
    }, 1500);
  }
  cancelSubmit(){
    this.formDirective?.resetForm();
    this.selectedClienteObj = {};
    this.selectedAsesorObj = {};
    this.keyboardValue = 0;
    this.formSubmit = false
  }

  async ngOnInit() {
    this.loginService.imagesPrestamos$.subscribe(images => {
      this.images = images;
      console.log('Imágenes de préstamos actualizadas:', this.images);

    });

    await this.loginService.loadFilesEntity('prestamos');


    this.setAllData();
  }

  openPrestamoModalById(idPrestamo: string) {
    // Busca el préstamo en tus datos
    let prestamoEncontrado: any = null;
    for (const grupo of this.prestamos) {
      prestamoEncontrado = grupo.prestamos.find((p: any) => p._id === idPrestamo);
      if (prestamoEncontrado) break;
    }
    if (prestamoEncontrado) {
      this.setModalInfo(true, prestamoEncontrado);
    }
  }

  toggleAccordion = (index: string) => {
    // console.log('Ya me cliquearin soy inex: ' , index)
    // const nativeEl = this.accordionGroup;
    // nativeEl.value = index; // Cambia el valor del acordeón al índice proporcionado
    this.modalAccordionValue = [index]
    setTimeout(() => {
      // Busca el elemento con el data-accordion-index igual al index
      const accordionEl = document.querySelector(`[data-accordion-index="${index}"]`);
    if (accordionEl) {
      (accordionEl as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    }, 400); // Espera a que el DOM se actualice
  };
  accordionGroupChange = (ev: any) => {
    //console.log(ev.detail.value) // value es un array de los expandidos
    this.modalAccordionValue = ev.detail.value;
  };
  // onModalPresented() {
  //   this.changeDetector.detectChanges();
  //   setTimeout(() => {
  //     if (this.modalAccordionIndex !== null && this.accordionGroup) {
  //       this.toggleAccordion(this.modalAccordionIndex!);
  //       this.modalAccordionIndex = null;
  //     }
  //   }, 300);
  // }

  handleRefresh(event:any) {
    setTimeout(() => {
      this.setAllData();
      event.target.complete();
    }, 2000);
  }
  
  async setAllData(){
    this.dataUser = await this.loginService.getData(STORAGE_KEY);

    if(this.dataUser && this.dataUser.role == 'ASESOR'){ //Si el user es asesor solo traigo sus clientes
      console.log('Datos de usuario:', this.dataUser);
      await this.prestService.getPrestamosByAsesor(this.dataUser._id).subscribe((res: any) => {
        console.log('Prestamos de asesor', res)
        
        this.prestamos[0].prestamos = res.filter(((ptms: any) => { return ptms.estado == 'Aceptado' }))
        this.prestamos[1].prestamos = res.filter(((ptms: any) => { return ptms.estado == 'Pendiente' }))
        this.prestamos[2].prestamos = res.filter(((ptms: any) => { return ptms.estado == 'Rechazado' }))
        this.prestamos[3].prestamos = res.filter(((ptms: any) => { return ptms.estado == 'Cerrado' }))
        // console.log(this.prestamos);
        this.results = [...this.prestamos]
      });

      await this.usuerService.getClientes(this.dataUser._id).subscribe((res:any)=>{
        console.log('Clientes de asesor', res)
        this.clientes = res

        this.route.queryParams.subscribe(params => {
          if (params['id_prestamo']) {
            console.log('Solo abro el prestamo porque cliente me dijo')
            this.initialBreakpoint = 1
            // Espera a que los datos estén cargados
            setTimeout(() => {
              this.openPrestamoModalById(params['id_prestamo']);
              console.log('Soy params de url:', params)
              // Si viene index_pago, abre el accordion
              if (params['index_pago'] !== undefined) {
                setTimeout(() => {
                  this.toggleAccordion((params['index_pago']));
                  console.log('Abri el accordion del pago index:', (params['index_pago']))
                }, 200);
              }
              // Elimina los params
              this.router.navigate([], { queryParams: {}, replaceUrl: true });
            }, 800);
          } else if (params['post_prestamo']) {
            console.log('Voy abrir el modal POST porque cliente me dijo')
            setTimeout(() => {
              this.setOpenAdd(true, 'AGREGAR')

              this.formInputPOST.patchValue({ 'id_cliente': params['cliente_id'] }) // Guarda el ID del cliente seleccionado desde clientes page

              // Busca el objeto completo del cliente
              const clienteObj = res.find((c: any) => c._id === params['cliente_id']);
              this.selectedClienteObj = clienteObj || {};
              this.changeDetector.detectChanges();

              this.router.navigate([], { queryParams: {}, replaceUrl: true });
            }, 500);
          }
        });
      });

    }else if (this.dataUser && this.dataUser.role == 'ADMINISTRADOR'){ //De lo contrario traigo todos los clientes en general y tambien todos los asesores
      await this.prestService.getPrestamos().subscribe((res: any) => {
        console.log(res)

        this.prestamos[0].prestamos = res.filter(((ptms: any) => { return ptms.estado == 'Aceptado' }))
        this.prestamos[1].prestamos = res.filter(((ptms: any) => { return ptms.estado == 'Pendiente' }))
        this.prestamos[2].prestamos = res.filter(((ptms: any) => { return ptms.estado == 'Rechazado' }))
        this.prestamos[3].prestamos = res.filter(((ptms: any) => { return ptms.estado == 'Cerrado' }))
        // console.log(this.prestamos);
        this.results = [...this.prestamos]
      })
      
      await this.prestService.getClientes().subscribe((res:any)=>{
        console.log('Clientes para buscar', res)
        this.clientes = res
  
        this.route.queryParams.subscribe(params => {
          if (params['id_prestamo']) {
            console.log('Solo abro el prestamo porque cliente me dijo')
            this.initialBreakpoint = 1
            // Espera a que los datos estén cargados
            setTimeout(() => {
              this.openPrestamoModalById(params['id_prestamo']);
              console.log('Soy params de url:', params)
              // Si viene index_pago, abre el accordion
              if (params['index_pago'] !== undefined) {
                // this.modalAccordionIndex = params['index_pago'] // Guarda el índice del accordion
                // console.log('Voy a abrir el accordion del pago index:', this.modalAccordionIndex)
                setTimeout(() => {
                  this.toggleAccordion((params['index_pago']));
                  console.log('Abri el accordion del pago index:', (params['index_pago']))
                }, 200); // Espera a que el modal esté abierto
              }
              // Elimina los params
              this.router.navigate([], { queryParams: {}, replaceUrl: true });
            }, 800);
          } else if (params['post_prestamo']) {
            console.log('Voy abrir el modal POST porque cliente me dijo')
            setTimeout(() => {
              this.setOpenAdd(true, 'AGREGAR')
  
              this.formInputPOST.patchValue({ 'id_cliente': params['cliente_id'] }) // Guarda el ID del cliente seleccionado desde clientes page
  
              // Busca el objeto completo del cliente
              const clienteObj = res.find((c: any) => c._id === params['cliente_id']);
              this.selectedClienteObj = clienteObj || {};
              this.changeDetector.detectChanges();
  
              this.router.navigate([], { queryParams: {}, replaceUrl: true });
            }, 500);
          }
        });
  
      });
      await this.usuerService.getAsesores().subscribe((res:any)=>{
        console.log('Asesores para buscar', res)
        this.asesores = res
      });
      console.log(this.dataUser, this.formInputPOST.value);
    }
    }

  setModalInfo(isOpen: boolean, data:any){
    this.openModalInfo = isOpen
    this.bonoCheck = new Array(data.tabla_amortizacion.length).fill(false);
    const estados = this.setEstados(data.tabla_amortizacion);
    data.tabla_amortizacion = estados.array;
    //data.totalPagado = estados.totalPagado; //Pago total de cuotas pagadas
    //data.totalCuota = estados.totalCuota; //Pago total del prestamo con los intereses (con ganancia)
    //data.totalMultas = estados.totalMultas; //Pago total de multas (solo multas)
    //data.totalPendiente = estados.totalPendiente; //Pagos que no se han pagado (multas y abonos malos)
    //data.multa = estados.multasArray;
    console.log()

    if(isOpen){
      this.copyData = JSON.parse(JSON.stringify(data.tabla_amortizacion)) //Copia en estado base que nunca será modificada
      this.modalInfo = JSON.parse(JSON.stringify(data)) // Copia en estado base que sí puede ser modificada
    }
    // console.log(this.copyData, this.modalInfo.tabla_amortizacion)
    console.log(data)
  }

  setEstados(array:any[]){ // array es tabla_amortizacion
    //let totalPagado = 0; // Initialize a variable to store the sum of pagado values
    //let totalCuota = 0; // Initialize a variable to store the sum of cuota values
    //let totalMultas = 0; // Initialize a variable to store the sum of multa values
    //let totalPendiente = 0; // Initialize a variable to store the sum of pendiente values (multas y pagos abonos)
    let multasArray = [];

    for(let pago of array){
      let datePago = this.prestService.compareDates(pago.fecha_pago) //Para saber si la fecha de pago ya pasó o no
      // > 0 (En tiempo) | < 0 (Fecha expirada)

      if( datePago < 0 && pago.estado_pago == 'Pagado'){
        pago.completed = true //Ya pasó la fecha, ya no se necesita modificar
      }else if(datePago >= 0) {
        pago.retraso = false //No ha expirado (abierto)
        pago.abierto = true
      }else if(datePago < 0 && pago.estado_pago == 'No pagado' ) {
        pago.retraso = true //Pago retrasado (no pagado)
      // }else if(datePago >= 0 && f.estado_pago == 'Pendiente') {
      //   f.pendiente = true
      }else if(datePago < 0 && pago.estado_pago == 'Pendiente'){ //Remuevo estado abierto si existe
        pago.pendiente = true
        pago.abierto ? delete pago.abierto : '' //Solo queda pendiente pero como estadp cerrado (ya pasó la fecha)
      }

      if (pago.estado_pago == 'Pendiente' && pago.abono_pago) {
        //console.log(pago.estado_pago, pago.abono_pago, pago.cuota)
        let saldo_pendiente = pago.cuota - pago.abono_pago
        //pago.saldo_pendiente = saldo_pendiente < 0 ? 0 : saldo_pendiente
          if(saldo_pendiente > 0){
            pago.saldo_pendiente = saldo_pendiente
            //totalPendiente += saldo_pendiente
            //totalPagado += pago.abono_pago //Calcular el total pagado
          }else{
            pago.saldo_pendiente = 0
            //totalPagado += pago.abono_pago //Calcular el total pagado
          }
        //console.log(saldo_pendiente)
      }
      if ((pago.estado_pago == 'No pagado' && pago.multa.monto_pendiente > 0) || (pago.estado_pago == 'Pagado' && pago.multa.monto_pendiente > 0)) {
        // console.log(pago.multa.dia_retraso, "SI")
        const montoPorDia = pago.multa.monto_pendiente / pago.multa.dia_retraso;
        multasArray = Array(pago.multa.dia_retraso).fill(montoPorDia);
        pago.multa.multasArray = multasArray;
        //totalPendiente += pago.cuota
      }else if (pago.estado_pago == 'No pagado' && pago.multa.monto_pendiente > 0 && pago.multa.saldado) {
        console.log("Ya me pagaron la multa")
        //totalPagado += pago.cuota //Calcular el total pagado
        //totalPagado += pago.multa.monto_pendiente //Calcular el total pagado
      }else if (pago.estado_pago == 'Pagado') { //no borrar el monto_pendiente en el backend para poder tener el historia
        //totalPagado += pago.cuota //Calcular el total pagado
        // const montoPorDia = pago.multa.monto_pendiente / pago.multa.dia_retraso;
        // multasArray = Array(pago.multa.dia_retraso).fill(montoPorDia);
        // console.log(montoPorDia, multasArray, "NO")
        // pago.multa.multasArray = multasArray;
      }


    // Add the cuota value to the total
    //totalCuota += pago.cuota;
    //totalMultas += pago.multa.monto_pendiente;

    //console.log(`Current cuota: ${pago.cuota}, Total cuota so far: ${totalCuota}`);
    //console.log(`Pendientes de no pagos o abonos total: ${totalPendiente}`);
    }
    //console.log(multasArray)
    // return {array, totalCuota, totalMultas, totalPendiente, totalPagado}
    return {array}
  }

  async openModalProfile() {
    const modal = await this.modalCtrl.create({
      component: ProfileModalComponent,
    });
    modal.present();
  }

setOpenAdd(isOpen: boolean, roll:string) {
  this.isModalOpenAdd = isOpen;
  this.openKeyboard = isOpen;
  this.rollModal = roll
  this.cancelSubmit()

  // this.rollModal == 'AGREGAR'? this.editedAsesor = {}: ''
}
setOpenCleinteModal(isOpen:boolean){
  this.isModalClientes = isOpen
}

formatData(data: string[], type:'cliente' | 'asesor') {
  if (data.length === 1 && type === 'cliente') {
    const cliente = this.clientes.find((cliente:Cliente) => cliente._id === data[0]);
    return cliente? cliente.nombre : '';
    // console.log(cliente)
  }else if (data.length === 1 && type === 'asesor') {
    const asesor = this.asesores.find((asesor:Asesor) => asesor._id === data[0]);
    return asesor? asesor.nombre : '';
  }

  return `No selected`;
}

clienteSelectionChanged(clientes: string[]) {
  this.selectedClientes = clientes;
  // Busca el objeto completo del cliente seleccionado
  const clienteObj = this.clientes.find((cliente: any) => cliente._id === clientes[0]);
  //this.selectedClientesText = clienteObj ? clienteObj.nombre : '';
  this.selectedClienteObj = clienteObj; // <-- Guarda el objeto completo
  console.log('Scl', this.selectedClienteObj)

  // this.formInputPOST.setValue({'id_cliente': clientes[0]})
  this.formInputPOST.patchValue({'id_cliente': this.selectedClienteObj._id})
  //this.filters.clienteId = this.selectedClienteObj._id // Para filtro de prestamos
  this.modal_cli.dismiss();
}
clienteSelecChangeFilter(clientes: string[]){
  this.selectedClientes = clientes;
  this.selectedClientesText = this.formatData(this.selectedClientes, 'cliente');
  this.filters.clienteId = clientes[0]
  this.modal_cli.dismiss();
}
asesorSelecChangeFilter(asesores: string[]){
  this.selectedAsesores = asesores;
  this.selectedAsesoresText = this.formatData(this.selectedAsesores, 'asesor');
  this.filters.asesorId = asesores[0]
  this.modal_ase.dismiss();
}
removeCliSelection(){
  this.selectedClientes = [];
  this.selectedClientesText = '';
  this.filters.clienteId = '';
}
asesorSelectionChanged(asesores: string[]) {
  this.selectedAsesores = asesores;
  // Buscar el objeto completo del asesor seleccionado
  const asesorObj = this.asesores.find((asesor: any) => asesor._id === asesores[0]);
  //this.selectedAsesoresText = asesorObj ? asesorObj.nombre : '';
  this.selectedAsesorObj = asesorObj; // <-- Guarda el objeto completo
  console.log(asesores, this.selectedAsesoresText)

  // this.formInputPOST.setValue({'id_cliente': clientes[0]})
  //this.formInputPOST.patchValue({'id_cliente': asesores[0]})
  this.formInputPOST.patchValue({'id_asesor': this.selectedAsesorObj._id})
  //this.filters.asesorId = asesores[0] // Para filtro de prestamos
  this.modal_ase.dismiss();
}
removeAseSelection(){
  this.selectedAsesores = [];
  this.selectedAsesoresText = '';
  this.filters.asesorId = '';
}

updateTablaAmortz(infoPrestamo:any){

  // let modificar = this.prestamos[0].prestamos.filter((prest:any)=>{return prest._id == infoPrestamo._id})
  console.log(infoPrestamo.tabla_amortizacion)
  // console.log(infoPrestamo._id,modificar)
  this.updatingPago =  true
  this.prestService.putPago(infoPrestamo._id, {tabla_amortizacion:infoPrestamo.tabla_amortizacion}).subscribe((res:any)=>{
    setTimeout(() => {
      this.canDismiss = true
      this.backdropDismiss = true
      this.updatingPago = false
      this.noPaymentChange = true

      this.setModalInfo(true, res)
      //Esto puede sustituirse con setModalInfo()
        // res.tabla_amortizacion = this.setEstados(res.tabla_amortizacion).array
        // this.modalInfo = JSON.parse(JSON.stringify(res))
        // this.copyData = JSON.parse(JSON.stringify(res.tabla_amortizacion))

        this.prestamos[0].prestamos.forEach((prestm:any) => {
          if(prestm._id == infoPrestamo._id){
            prestm.tabla_amortizacion = res.tabla_amortizacion
            console.log(prestm)
          }
        });
        //console.log(res.tabla_amortizacion, this.prestamos)
    }, 2000);
  },(err:any)=>{
    console.log(err)
  }); //err updatingPago=falso
}
cancelPut(){
  this.canDismiss = true
  this.backdropDismiss = true
  this.noPaymentChange = true

  //Regresar la data a su original
  this.bonoCheck = []
  this.modalInfo.tabla_amortizacion = JSON.parse(JSON.stringify(this.copyData))
  console.log(this.modalInfo.tabla_amortizacion, this.copyData)
}
setPagoEstado(pago: any, checked: any, estado: string, index:number): void { // 'Pagado'|'Pendiente'
  console.log(pago)
  this.noPaymentChange = false
  this.canDismiss =  false
  this.backdropDismiss = false

  estado == 'Pendiente' ? this.bonoCheck[index] = checked.detail.checked : '' // Para checkbox de bonoCheck

  pago.estado_pago = checked.detail.checked ? estado : 'No pagado';
  if(this.bonoCheck[index] && pago.estado_pago == 'Pagado'){// Revisar si bonoCkeck y su input no tienen datos si es que el estado se cambia a 'Pagado'
    this.bonoCheck[index] = false
    delete pago.abono_pago;
  }
  console.log(this.canDismiss, this.backdropDismiss, this.noPaymentChange)
}
async changeListener(info:any){
  if(!this.noPaymentChange && info.detail.breakpoint != 1){
    this.presentToast('top', 'Guarda todos los cambios antes de cerrar o se perderá la data', 2500)
  }
}
onWillDismiss() {
  this.openModalInfo = false
  this.segmentValue = 'tabla'
  this.showMore = false
  this.modalAccordionValue = []
  this.initialBreakpoint = 0.6
}

async aceptarPrestamo(infoPrestamo:any) {
  const alert = await this.alertController.create({
    header: 'Atención',
    subHeader:'Al APROBAR este prestamo se creará la tabla de amortización calculando la fecha seleccionada en que se dió el prestamo.',
    inputs: [
      {
        name:'fecha',
        type: 'date',
        placeholder: 'Selecciona una fecha',
        attributes: { color : "danger" }
      },
      {
        type: 'textarea',
        placeholder: 'Notas u observaciones',
      },
    ],
    buttons: [
      {
        text:'Cancelar',
        handler:()=>{return true}
      },
      {
        text:'Aprobar',
        handler: (alertData) => {
          console.log(alertData.fecha)
          if(alertData.fecha){
            console.log(infoPrestamo)
            let body = infoPrestamo.dia_pago? {'fecha_prestamo': alertData.fecha, 'dia_pago':infoPrestamo.dia_pago} : {'fecha_prestamo': alertData.fecha}
            console.log(body)
            this.accept_reject = true
            this.prestService.aceptarPrestamo(infoPrestamo._id, body).subscribe((res:any)=>{
             setTimeout(() => {
               this.removeItemPendientes(infoPrestamo._id)
               this.addItemAceptados(res)
               this.accept_reject = false

               this.presentToast('bottom', 'Se ha generado la tabla de amortización exitosamente', 2500)
               setTimeout(() => {
                 this.openModalInfo = false
               }, 1200);
             }, 1500);
             console.log(res)
            }, (err:any) => {
              console.log(err.error.message)
              this.accept_reject = false
              this.presentToast('bottom', err.error.message, 2500)
            })
            return true
          }else{
           this.presentToast('top', 'Selecciona una fecha para generar la tabla de amortización', 1500)
           return false
          }

        }
      },
    ],
  });

  await alert.present();
}
async cerrarPrestamo(infoPrestamo:any) {
  const alert = await this.alertController.create({
    header: 'Atención',
    subHeader:'Para continuar con la operacion por favor ingrese su contraseña.',
    buttons: [
      {
        text:'Cancelar',
        handler:()=>{return true}
      },
      {
        text:'Aceptar',
        handler: () => {
          this.prestService.cerrarPrestamo(infoPrestamo._id).subscribe((res:any)=>{
            setTimeout(() => {
              this.removeItemAceptado(infoPrestamo._id)
              this.addItemCerrados(res)
            }, 1200);
            this.presentToast('bottom', 'Prestamo completado', 1500)
               setTimeout(() => {
                 this.openModalInfo = false
               }, 1200);
            console.log(res)
          });
          return true

        }
      },
    ],
  });

  await alert.present();
}

async rechazarPrestamo(id:string) {
  const alert = await this.alertController.create({
    header: 'Atención',
    subHeader:'¿Seguro que deseas rechazar este prestamo? (Se puede revertir este cambio más delante).',
    buttons: [
      {
        text:'Cancelar',
        handler:()=>{return true}
      },
      {
        text:'Rechazar',
        handler: () => {
          this.accept_reject =  true
          this.prestService.rechazarPrestamo(id).subscribe((res)=>{
            setTimeout(() => {
              this.removeItemPendientes(id)
              this.addItemRechazados(res)
              this.accept_reject = false
              this.presentToast('bottom', 'Se ha actualizado la información exitosamente', 2000)
              setTimeout(() => {
                this.openModalInfo = false
              }, 1200);
              // return true
            }, 1500);
          })//this.accpt_reject = false
        }
      },
    ],
  });

  await alert.present();
}
async pagarMultaPago(id:string, pago:number, monto:number, index:number) {
  const alert = await this.alertController.create({
    header: 'Atención',
    subHeader:`¿Segura que quieres continuar con esta operación?. Multa a pagar: $${monto}.00`,
    buttons: [
      {
        text:'Cancelar',
        handler:()=>{return true}
      },
      {
        text:'Convenio',
        handler:()=>{console.log('Convenio')}
      },
      {
        text:'Pagar',
        handler: () => {
          console.log('Data: ', this.modalInfo, index)

          this.prestService.pagarMulta(id, pago, {}).subscribe((res:any) =>{
            console.log(res)
            this.updatePagoMulta(this.modalInfo, pago, res.multa)
            this.presentToast("bottom", res.message, 3000)

            //setData al guardar el pago de la multa
          })
        }
      },
    ],
  });

  await alert.present();
}
async presentToast(position: 'top' | 'middle' | 'bottom', message:string, time:number) {
  const toast = await this.toastController.create({
    message: message,
    duration: time,
    position: position,
  });

  await toast.present();
}

addItemAceptados(item:{}){
  this.prestamos[0].prestamos.unshift(item);
  // this.updateResultsAfterAdd();
  this.results = [...this.prestamos]
}
addItemPendientes(item:{}){
  this.prestamos[1].prestamos.unshift(item);
  // this.updateResultsAfterAdd();
  this.results = [...this.prestamos]
}
addItemRechazados(item:{}){
  this.prestamos[2].prestamos.unshift(item);
  // this.updateResultsAfterAdd();
  this.results = [...this.prestamos]
}
addItemCerrados(item:{}){
  this.prestamos[3].prestamos.unshift(item);
  // this.updateResultsAfterAdd();
  this.results = [...this.prestamos]
}

updateResultsAfterAdd() {
  // Si hay algún filtro activo, vuelve a aplicar el filtro
  if (
    this.filters.estados.length > 0 ||
    this.filters.saldoMin > 0 ||
    this.filters.clienteId ||
    this.filters.asesorId ||
    this.filters.tipoPago
  ) {
    this.filterPrestamos(this.filters);
  } else {
    // Si no hay filtros, simplemente clona prestamos
    this.results = [...this.prestamos];
  }
}
removeItemPendientes(id:string){
  let pendientes = this.prestamos[1].prestamos.filter((prest:any)=>{
    return prest._id !== id;
  })
  this.prestamos[1].prestamos = pendientes
  console.log(this.prestamos[1].prestamos)
}
removeItemAceptado(id:string){
  let aceptados = this.prestamos[0].prestamos.filter((prest:any)=>{
    return prest._id !== id;
  })
  this.prestamos[0].prestamos = aceptados
  console.log(this.prestamos[0].prestamos)
}
updatePagoMulta(pago:any, pagoNum:number, res:any){
  console.log(pago, pagoNum)
  pago.tabla_amortizacion[pagoNum-1].multa = res
  pago.tabla_amortizacion[pagoNum-1].estado_pago = 'Pagado'
  this.setModalInfo(true, pago)

  const index = this.prestamos[0].prestamos.findIndex((item:any) => item._id === pago._id)
  console.log(index)
  this.prestamos[0].prestamos[index].tabla_amortizacion[pagoNum-1].multa = res
  this.prestamos[0].prestamos[index].tabla_amortizacion[pagoNum-1].estado_pago = 'Pagado'
  console.log(this.prestamos[0].prestamos[index])
}

srcImageName(images: { originalname: string }[], name: string): any {
  if (images && images.length > 0) {
    return images.find(img => img.originalname === name + '.jpeg');
  } else { // Si modal add/update esta abierto no muestres la imagen por defecto
    return { url: 'https://ionicframework.com/docs/img/demos/avatar.svg' }; // Default image if not found
  }
}

//FILTRO PARA PRESTAMOS

toggleEstado(estado: string) { //Para ESTADOS (chips)
  const idx = this.selectedEstados.indexOf(estado);
  if (idx > -1) {
    this.selectedEstados.splice(idx, 1); // Quita si ya estaba seleccionado
  } else {
    this.selectedEstados.push(estado);   // Agrega si no estaba seleccionado
  }
  console.log(this.selectedEstados)
  this.filters.estados = this.selectedEstados;
  console.log(this.filters)
}

catchRange(event: Event){
  console.log((event as RangeCustomEvent).detail)
  const value = (event as RangeCustomEvent).detail.value;
  this.filters.saldoMin = typeof value === 'number' ? value : value.lower;
  //this.filters.saldoMin = (event as RangeCustomEvent).detail.value;
}

refreshFilter() {
  this.filters = {
    estados: [],
    saldoMin: 0,
    clienteId: '',
    asesorId: '',
    tipoPago: ''
  };
  this.selectedEstados = [];
  this.selectedClientes = [];
  this.selectedClientesText = 'No se ha asignado cliente';
  this.selectedAsesores = [];
  this.selectedAsesoresText = 'No se ha asignado asesor';
  console.log('Filtros reiniciados', this.filters)
  setTimeout(() => {
    this.filterPrestamos(this.filters); // Actualiza los resultados con los filtros reiniciados
  }, 1000);
}

  filterPrestamos({
    estados = [],
    saldoMin = 0,
    clienteId = '',
    clienteNombre = '',
    asesorId = '',
    asesorNombre = '',
    tipoPago = ''
  }: {
    estados?: string[],
    saldoMin?: number,
    clienteId?: string,
    clienteNombre?: string,
    asesorId?: string,
    asesorNombre?: string,
    tipoPago?: string
  }) {
    const saldoMinReal = saldoMin * 1000;

    console.log('saldo minimo: ', saldoMin)
    console.log('Filtrando prestamos con: ', this.filters)
    // Filtra los grupos por estado (titulo)
    let filtrados = this.prestamos.filter((grupo: any) =>
      estados.length === 0 || estados.includes(grupo.titulo)
    ).map((grupo: any) => {
      // Filtra los prestamos dentro de cada grupo
      let prestamosFiltrados = grupo.prestamos.filter((p: any) => {
        // Saldo mínimo
        if (saldoMin && p.saldo < saldoMinReal) return false;

        // Cliente (por id o nombre)
        //if (clienteId && (!p.id_cliente || p.id_cliente._id !== clienteId)) return false;
        // Asesor (por id o nombre)
        //if (asesorId && (!p.id_asesor || p.id_asesor._id !== asesorId)) return false;
        if (clienteId || asesorId) {
          const matchCliente = clienteId && p.id_cliente && p.id_cliente._id === clienteId;
          const matchAsesor = asesorId && p.id_asesor && p.id_asesor._id === asesorId;
          // Si ambos están presentes, debe coincidir al menos uno
          if (!(matchCliente || matchAsesor)) return false;
        }

        // Tipo de pago
        if (tipoPago && p.tipo_pago !== tipoPago) return false;

        return true;
      });

      // Devuelve el grupo solo si tiene prestamos filtrados
      return { ...grupo, prestamos: prestamosFiltrados };
    });

    // Elimina los grupos vacíos
    filtrados = filtrados.filter((grupo: any) => grupo.prestamos.length > 0);
    console.log(filtrados)
    this.results = filtrados; // Actualiza los resultados
    this.isModalFilter = false;
    return filtrados;
  }

  pressKey(key: string) {
    if (key === 'del') {
      this.keyboardValue = Math.floor(this.keyboardValue / 10);
    } else {
      // Solo acepta dígitos
      const digit = parseInt(key, 10);
      if (!isNaN(digit)) {
        this.keyboardValue = this.keyboardValue * 10 + digit;
      }
    }
  }
  // Long press handlers for delete button
  onDelPressStart() {
    this.delPressTimer = setTimeout(() => {
      this.keyboardValue = 0;
    }, 600);
  }
  onDelPressEnd() {
    clearTimeout(this.delPressTimer);
  }
  confirmKeyboard() {
    this.formInputPOST.patchValue({ saldo: this.keyboardValue });
    setTimeout(() => {
      this.openKeyboard = false;
    }, 100);
  }
  closeKeyboard() {
    this.openKeyboard = false;
  }
  hasKeys(obj: any): boolean {
    return obj && Object.keys(obj).length > 0;
  }


  //Zoom settings
  setZoomIn(imageUrl:string, imageName:string) {
    this.toZoom = true;
    this.zoomImage = imageUrl;
    this.zoomImageName = imageName;
  }
  dismissZoom() {
    this.toZoom = false;
    this.zoomImage = '';
  }


  //Modal comprobantes
  setOpenModalComprobantes(isOpen:boolean, pago: any) {
    this.isOpenModalComp = isOpen
    this.pagoParaComprobante = pago
    console.log('Pago para comprobante: ', pago)
  }

  closeModalComprobantes() {
    this.isOpenModalComp = false;
    this.pagoParaComprobante = null 
    this.selectedPhotoForDelete = []
    this.sendingComprobantes = false;
    this.eliminandoPhotos = false;
    this.editComprobantePrestamo = false;
  }

  pickPictures(imageName:string) {
    if(this.pagoParaComprobante) {
      this.esperandoPickPictures = true;
      this.pickedPicturesEsperadas = 0;
  
      this.loginService.pickImages(imageName, 'prestamos').then((cantidad) => {
        // Si tu método pickImages puede retornar la cantidad seleccionada, úsala aquí
        this.pickedPicturesEsperadas = cantidad;
  
        // Espera a que el observable de imágenes tenga la cantidad correcta
        const checkInterval = setInterval(() => {
          const imagesActuales = this.images.filter(img => img.name.includes('comprobante')).length;
          console.log(this.esperandoPickPictures, imagesActuales, this.pickedPicturesEsperadas);
          if (this.esperandoPickPictures && imagesActuales === this.pickedPicturesEsperadas) {
            clearInterval(checkInterval);
            this.esperandoPickPictures = false;
            this.submitComprobantes(this.pagoParaComprobante.num_pago);
          }
        }, 200); // Checa cada 200ms
      });
    }else {
      console.log('No hay pago seleccionado') 
      return;
    }
  }

  async submitComprobantes(numero_pago: number) {
    if(this.modalInfo && numero_pago !== undefined && numero_pago > 0){
      this.sendingComprobantes = true;
      const comprobantes = this.images.filter(img => img.name.includes('comprobante'));
      console.log('Comprobantes a enviar:', comprobantes);

      let formData = new FormData();
      formData.append('num_pago', numero_pago.toString());
      if (comprobantes.length > 0) {
        for (let file of comprobantes) { // Add images to formData
          const response = await fetch(file.data);
          const blob = await response.blob();
          formData.append('image_comprobante', blob, file.name);
        }
      }

      this.prestService.postComprobantesPago(this.modalInfo._id, formData).subscribe((data:any) => {
        console.log('Respuesta del servidor:', data);
        this.pagoParaComprobante.comprobantes = data.comprobantes; // Actualiza los comprobantes en modalInfo
        this.presentToast('bottom', data.message, 2000);
        this.loginService.deleteFolder(this.loginService.imagesPrestamos, 'prestamos'); // Limpia la carpeta temporal
        this.images = [];

        //ACtualizar el prestamo en el array principal
        for (const grupo of this.prestamos) {
          if(Array.isArray(grupo.prestamos)){
            const index = grupo.prestamos.findIndex((p:any) => p._id === this.modalInfo._id);
            if (index !== -1) {
              grupo.prestamos[index].comprobantes = data.comprobantes;
              break; // Sale del loop una vez que encuentra y actualiza el prestamo
            }
          }
        }
        this.sendingComprobantes = false;
      });
    }
  }

  //ACEPTAR PAGO PRESTAMO
  async aceptarPago(pago: any) {
    // Verifica si el array de comprobantes está vacío
    const tieneComprobantes = pago.comprobantes && pago.comprobantes.length > 0;

    const alert = await this.alertController.create({
      header: '¡Atención!',
      subHeader: tieneComprobantes
        ? '¿Seguro que deseas continuar?'
        : 'Pago sin comprobantes, ¿Deseas continuar?',
      message: tieneComprobantes
        ? 'Al aceptar el pago este se registrará en los movimientos de la wallet.'
        : 'Recuerda que al aceptar el pago este se registrará en los movimientos de la wallet.',
      buttons: [
        {
          text: 'No',
          handler: () => { return true; }
        },
        {
          text: 'Continuar',
          handler: () => {
            this.actualizarPagoAceptado(pago);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async actualizarPagoAceptado(pago: any) {
    // Llama al endpoint para aceptar el pago
    this.prestService.aceptarPagoPrestamo(this.modalInfo._id, pago.num_pago, {}).subscribe((data: any) => {
      // Actualiza el pago en modalInfo.tabla_amortizacion
      const index = this.modalInfo.tabla_amortizacion.findIndex((p: any) => p.num_pago === pago.num_pago);
      if (index !== -1) {
        this.modalInfo.tabla_amortizacion[index] = {
          ...this.modalInfo.tabla_amortizacion[index],
          ...data.pago
        };
      }

      // Actualiza el pago en el array principal de prestamos
      for (const grupo of this.prestamos) {
        if (Array.isArray(grupo.prestamos)) {
          const prestamoIndex = grupo.prestamos.findIndex((p: any) => p._id === this.modalInfo._id);
          if (prestamoIndex !== -1) {
            const pagoIndex = grupo.prestamos[prestamoIndex].tabla_amortizacion.findIndex((p: any) => p.num_pago === pago.num_pago);
            if (pagoIndex !== -1) {
              grupo.prestamos[prestamoIndex].tabla_amortizacion[pagoIndex] = {
                ...grupo.prestamos[prestamoIndex].tabla_amortizacion[pagoIndex],
                ...data.pago
              };
            }
          }
        }
      }

      this.presentToast('bottom', data.message, 2000);
    });
  }

  //DELETE COMPROBANTES
  onPhotoCheckboxChange(event: any, comp: any) {
    if (event.detail.checked) {
      // Agrega si no está
      if (!this.selectedPhotoForDelete.some((img: any) => img.public_id === comp.public_id)) {
        this.selectedPhotoForDelete.push(comp);
      }
    } else {
      // Elimina si está
      this.selectedPhotoForDelete = this.selectedPhotoForDelete.filter((img: any) => img.public_id !== comp.public_id);
    }
  }
  checkElementSelected(array:any, image:any): boolean {
    return array.some((img:any) => img.public_id === image.public_id);
  }
  async deleteSelectedComp() {
    if (!this.modalInfo?._id || !this.pagoParaComprobante.num_pago || this.selectedPhotoForDelete.length === 0) return;
    const public_ids = this.selectedPhotoForDelete.map((img:any) => img.public_id);
    this.eliminandoPhotos = true;
    console.log('Eliminar comprobantes con public_ids:', public_ids);
    await this.prestService.deletePhotos(this.modalInfo._id, this.pagoParaComprobante.num_pago, public_ids).subscribe((data: any) => {
      this.pagoParaComprobante.comprobantes = data.comprobantes; // Actualiza los comprobantes en modalInfo
      this.presentToast('bottom', data.message, 2000);
      this.selectedPhotoForDelete = [];
      this.eliminandoPhotos = false;
      console.log('Comprobantes actualizados:', this.pagoParaComprobante.comprobantes);
    }, (error: any) => {
      console.error('Error al eliminar comprobantes:', error);
      this.eliminandoPhotos = false;
      this.presentToast('top', `${error.error.message}`, 5500);
    });
  }

  cancelPhotoSelection() {
    this.selectedPhotoForDelete = [];
  }

}

