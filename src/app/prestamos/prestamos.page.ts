import { Component, OnInit, ViewChild, LOCALE_ID, Inject, ElementRef } from '@angular/core';
import { ProfileModalComponent } from '../profile-modal/profile-modal.component';
import { ModalController, IonModal, AlertController, AlertInput, ToastController } from '@ionic/angular';
import { PrestamosService } from '../services/prestamo/prestamos.service';
import { Cliente, Item } from '../types'
import { LoginService } from '../services/login/login.service';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import Swiper from 'swiper';
import { HistorialService } from '../services/historial/historial.service';

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
  // @ViewChild('formDirective') formDirective : FormGroupDirective;
  @ViewChild('formDirective') formDirective!: NgForm;
  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?:Swiper

  dataUser:any = []

  public progress = 0.5; //Regla de tres para porcentaje de barra (aprobados)*(1)/(total de prestamos) || (aprobados)/(total de prestamos) 
  openModalInfo = false
  isModalOpenAdd = false
  isModalClientes = false

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
  modalInfo:any = {}
  copyData:any = {}

  selectedClientesText = 'No se ha asignado cliente';
  selectedClientes: string[] = [];
  clientes: Cliente[] = [];

  constructor(
    private modalCtrl: ModalController,
    private prestService: PrestamosService,
    private historialService: HistorialService,
    private loginService: LoginService,
    private alertController: AlertController,
    private toastController: ToastController,
    public formPrest : FormBuilder,
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

  showMore = false; 
  toggleShowMore() {
    this.showMore = !this.showMore; // Toggle the value of showMore
  }

  async submitAddPrestamo(){
    this.formSubmit = true
    console.log(this.formInputPOST.value)
    let estadoCliente = ""
    await this.historialService.getHistorialByIdUser(this.formInputPOST.value.id_cliente).subscribe((res: any) => {
      estadoCliente = res.estado_general
      console.log(estadoCliente)

      if(! this.formInputPOST.valid){
        console.log("not valid"); return
      }else if(this.formInputPOST.valid && this.formInputPOST.value.periodo == 14 && this.formInputPOST.value.dia_pago == ""){
        console.log("not valid"); return
      }
      else{
        console.log("valid")
        this.formInputPOST.value.dia_pago == "" ? delete this.formInputPOST.value.dia_pago : ''
        this.postingPrestamo = true
  
        setTimeout(() => {
          this.prestService.postPrestamos(this.formInputPOST.value).subscribe((res: any) => {
            // if estadoCliente == Malo send the loan to pendientes
            if(estadoCliente == "Malo"){
              this.addItemPendientes(res)
              this.postingPrestamo = false
              this.isModalOpenAdd = false
              console.log(res)
              this.presentToast('top', 'El estado general del cliente debe revisarse antes de aceptar un cliente',5500)
            }else if (estadoCliente == 'Excelente' || 'Bueno' || 'Regular'){
              const today = new Date().toLocaleDateString('en-CA')
              console.log(today)
              let body = res.dia_pago? {'fecha_prestamo': today, 'dia_pago':res.dia_pago} : {'fecha_prestamo': today}
              console.log(body)
              this.prestService.aceptarPrestamo(res._id, body).subscribe((val:any)=>{
                this.addItemAceptados(val)
                this.postingPrestamo = false
                this.isModalOpenAdd = false
                console.log(val)
                this.presentToast('bottom', 'Se ha generado la tabla de amortización exitosamente', 4500)
              })
            }
            // else send the loan to aceptados
          })
        }, 1500);
      }
    });
    
  }
  cancelSubmit(){
    this.formDirective?.resetForm();
    this.formSubmit = false
  }

  async ngOnInit() {  
    this.setAllData();
    console.log(new Date().toISOString())
  }

  handleRefresh(event:any) {
    setTimeout(() => {
      this.setAllData();
      event.target.complete();
    }, 2000);
  }

  async setAllData(){
    await this.prestService.getPrestamos().subscribe((res:any)=>{
       console.log(res)

      this.prestamos[0].prestamos = res.filter(((ptms:any) => { return ptms.estado == 'Aceptado'}))
      this.prestamos[1].prestamos = res.filter(((ptms:any) => { return ptms.estado == 'Pendiente'}))
      this.prestamos[2].prestamos = res.filter(((ptms:any) => { return ptms.estado == 'Rechazado'}))
      this.prestamos[3].prestamos = res.filter(((ptms:any) => { return ptms.estado == 'Cerrado'}))
      // console.log(this.prestamos);
    })
    await this.prestService.getClientes().subscribe((res:any)=>{
      // console.log(res)
      this.clientes = res
    })
    this.dataUser = await this.loginService.getData(STORAGE_KEY);
    this.formInputPOST.patchValue({'id_asesor': this.dataUser._id})
    // this.editedAsesor.id_asesor = this.dataUser._id
    console.log(this.dataUser, this.formInputPOST.value)
  }

  setModalInfo(isOpen: boolean, data:any){
    this.openModalInfo = isOpen
    this.bonoCheck = new Array(data.tabla_amortizacion.length).fill(false); 
    const estados = this.setEstados(data.tabla_amortizacion);
    data.tabla_amortizacion = estados.array;
    data.totalPagado = estados.totalPagado; //Pago total de cuotas pagadas
    data.totalCuota = estados.totalCuota; //Pago total del prestamo con los intereses (con ganancia)
    data.totalMultas = estados.totalMultas; //Pago total de multas (solo multas)
    data.totalPendiente = estados.totalPendiente; //Pagos que no se han pagado (multas y abonos malos)
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
    let totalPagado = 0; // Initialize a variable to store the sum of pagado values
    let totalCuota = 0; // Initialize a variable to store the sum of cuota values
    let totalMultas = 0; // Initialize a variable to store the sum of multa values
    let totalPendiente = 0; // Initialize a variable to store the sum of pendiente values (multas y pagos abonos)
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
            totalPendiente += saldo_pendiente
            totalPagado += pago.abono_pago //Calcular el total pagado
          }else{
            pago.saldo_pendiente = 0
            totalPagado += pago.abono_pago //Calcular el total pagado
          }
        //console.log(saldo_pendiente)
      }
      if (pago.estado_pago == 'No pagado' && pago.multa.monto_pendiente > 0) {
        // console.log(pago.multa.dia_retraso, "SI")
        const montoPorDia = pago.multa.monto_pendiente / pago.multa.dia_retraso;
        multasArray = Array(pago.multa.dia_retraso).fill(montoPorDia);
        pago.multa.multasArray = multasArray;
        totalPendiente += pago.cuota
      }else if (pago.estado_pago == 'No pagado' && pago.multa.monto_pendiente > 0 && pago.multa.saldado) {
        console.log("Ya me pagaron la multa")
        totalPagado += pago.cuota //Calcular el total pagado
        totalPagado += pago.multa.monto_pendiente //Calcular el total pagado
      }else if (pago.estado_pago == 'Pagado') { //no borrar el monto_pendiente en el backend para poder tener el historia
        totalPagado += pago.cuota //Calcular el total pagado
        // const montoPorDia = pago.multa.monto_pendiente / pago.multa.dia_retraso;
        // multasArray = Array(pago.multa.dia_retraso).fill(montoPorDia);
        // console.log(montoPorDia, multasArray, "NO")
        // pago.multa.multasArray = multasArray;
      }
      

    // Add the cuota value to the total
    totalCuota += pago.cuota;
    totalMultas += pago.multa.monto_pendiente;

    //console.log(`Current cuota: ${pago.cuota}, Total cuota so far: ${totalCuota}`);
    //console.log(`Pendientes de no pagos o abonos total: ${totalPendiente}`);
    }
    //console.log(multasArray)
    return {array, totalCuota, totalMultas, totalPendiente, totalPagado}
  }

  async openModalProfile() {
    const modal = await this.modalCtrl.create({
      component: ProfileModalComponent,
    });
    modal.present();
  }

  generarTablaAmor(monto:number, interes:number, periodo:number){
    
    let tabla = [];
    let intereses = 0;

    intereses = (interes * monto) / (100);

    let fechas = this.calcularFechas(new Date ('2024-12-04'))
    for (let i = 1; i <= periodo; i++) { // if periodo 
      // const interes = saldoPendiente * tasaMensual;
      // const capital = cuota - interes;
      // saldoPendiente -= capital;

      tabla.push({
        num_pago: i,
        fecha_pago:fechas[i-1],
        cuota: intereses,
        estado_pago: false
      });

    }
    tabla[tabla.length -1].cuota = intereses + monto
    // console.log(fechas)
    console.log(tabla)
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

setOpenAdd(isOpen: boolean, roll:string) {
  this.isModalOpenAdd = isOpen;
  this.rollModal = roll
  this.cancelSubmit()

  // this.rollModal == 'AGREGAR'? this.editedAsesor = {}: ''
}
setOpenCleinteModal(isOpen:boolean){
  this.isModalClientes = isOpen
}

formatData(data: string[]) {
  if (data.length === 1) {
    const cliente = this.clientes.find((cliente:Cliente) => cliente._id === data[0]);
    return cliente? cliente.nombre : '';
    // console.log(cliente)
  }

  return `${data.length} items`;
}

clienteSelectionChanged(clientes: string[]) {
  this.selectedClientes = clientes;
  this.selectedClientesText = this.formatData(this.selectedClientes);
  console.log(clientes, this.selectedClientesText)

  // this.formInputPOST.setValue({'id_cliente': clientes[0]})
  this.formInputPOST.patchValue({'id_cliente': clientes[0]})
  this.editedAsesor.id_cliente = clientes[0]
  this.modal_cli.dismiss();
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
          //if(alertData.fecha){
            //console.log(infoPrestamo)
            //let body = infoPrestamo.dia_pago? {'fecha_prestamo': alertData.fecha, 'dia_pago':infoPrestamo.dia_pago} : {'fecha_prestamo': alertData.fecha}
            //console.log(body)
            //this.accept_reject = true
            //this.prestService.aceptarPrestamo(infoPrestamo._id, body).subscribe((res:any)=>{
            //  setTimeout(() => {
            //    this.removeItemPendientes(infoPrestamo._id)
            //    this.addItemAceptados(res)
            //    this.accept_reject = false

            //    this.presentToast('bottom', 'Se ha generado la tabla de amortización exitosamente', 2500)
            //    setTimeout(() => {
            //      this.openModalInfo = false
            //    }, 1200);
            //  }, 1500);
            //  console.log(res)
            //})
            //return true
          //}else{
          //  this.presentToast('top', 'Selecciona una fecha para generar la tabla de amortización', 1500)
          //  return false
          //}
          
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
  this.prestamos[0].prestamos.push(item)
}
addItemPendientes(item:{}){
  this.prestamos[1].prestamos.push(item)
}
addItemRechazados(item:{}){
  this.prestamos[2].prestamos.push(item)
}
addItemCerrados(item:{}){
  this.prestamos[3].prestamos.push(item)
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
  this.setModalInfo(true, pago)

  const index = this.prestamos[0].prestamos.findIndex((item:any) => item._id === pago._id)
  console.log(index)
  this.prestamos[0].prestamos[index].tabla_amortizacion[pagoNum-1].multa = res
  console.log(this.prestamos[0].prestamos[index])
}


}

