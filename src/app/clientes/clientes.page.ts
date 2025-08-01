import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, ModalController, ToastController } from '@ionic/angular';
import { ProfileModalComponent } from '../profile-modal/profile-modal.component';
import { UsuariosService } from '../services/usuarios/usuarios.service';
import { HistorialService } from '../services/historial/historial.service';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { LocalFile, LoginService } from '../services/login/login.service';
import { PrestamosService } from '../services/prestamo/prestamos.service';


@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
})
export class ClientesPage implements OnInit {
@ViewChild('formDirective') formDirective!: NgForm;
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

  async ngOnInit() {
    this.loginService.imagesClientes$.subscribe(images => {
      this.images = images;
    });

    await this.loginService.loadFilesEntity('cliente');

    await this.usuariosService.getAsesores().subscribe((data:any) => {
      //console.log(data);
      let fotoAsesor:any = {};
      data.forEach((item:any) => {
        this.usuariosService.getClientes(item._id).subscribe((clientes: any) => {
          if(item.evidencia_aval.length > 0 ){
          fotoAsesor = item.evidencia_aval.filter((e:any) => e.originalname === 'foto-perfil.jpeg')[0];
          fotoAsesor? fotoAsesor : fotoAsesor = {url: 'https://ionicframework.com/docs/img/demos/avatar.svg'};
          //console.log(fotoAsesor, item.nombre);
          } else { fotoAsesor = {url: 'https://ionicframework.com/docs/img/demos/avatar.svg'}; }
          this.clientesData.push({
            _id: item._id,
            nombre: item.nombre,
            foto_perfil: fotoAsesor.url, 
            clientes: clientes,
          });
          this.results = [...this.clientesData];
          // console.log('Tablaaaa', this.results);
        })
      })
    });
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
    });
    console.log('Cliente Modal Info:', this.clienteModalInfo);
  }
  async setOpenPresAtraz(isOpen: boolean, dataType: 'prestamos' | 'retrasos') {
    this.presRetrModal = isOpen;
    //console.log('Soy prestamos o retrasos: ', array)
    this.isPrestOrRetrasos = dataType;
    for (let p of this.clienteModalInfo.historial.prestamos_detallados) {
      console.log(p)
      this.prestamosService.getPrestamosById(p.id_prestamo).subscribe((data:any) => {
        console.log('Prestamos Detallados:', data);
        p.detalles = data;
      });
    }
  }
  async getPrestamosById(id: string) {
    
  }
  setOpenOpts(isOpen: boolean, item: any) {
    this.isModalOpenOptns = isOpen;
    this.clienteModalInfo = item;
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¡Atención!',
      subHeader: '¿Seguro que quieres eliminar este cliente?',
      cssClass: 'my-custom-actsheet',
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          data: {
            action: 'delete',
          },
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

    this.results = filteredResults;
  }

  //For form
  async submitAddCliente(){
    this.formSubmit = true
    //const blobs = []
    console.log(this.formInputPOST.value, this.formInputPOST.valid, this.images, this.rollModal)


    if(!this.formInputPOST.valid || this.images.length != 8 && this.rollModal != 'ACTUALIZAR'){
      console.log("not valid"); return
    }else{

      this.postingCliente = true

      let formData: any = new FormData();
      formData.append('nombre', this.formInputPOST.value.nombre);
      formData.append('telefono', this.formInputPOST.value.telefono); 
      formData.append('email', this.formInputPOST.value.email);
      formData.append('direccion', this.formInputPOST.value.direccion);
      formData.append('role', "ASESOR");
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

            this.loginService.deleteFolder(this.loginService.images, 'cliente');
            this.isModalOpenAdd = false;
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

            this.loginService.deleteFolder(this.loginService.images, 'cliente');
            this.isModalOpenAdd = false;
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
    }
  }
  accordionGroupChange = (ev: any) => {
  this.accordionValues = ev.detail.value; // value es un array de los expandidos
  };

}
