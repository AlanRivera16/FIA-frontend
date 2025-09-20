import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonInput, ModalController, ToastController } from '@ionic/angular';
import { LocalFile, LoginService } from '../services/login/login.service';
import { ProfileModalComponent } from '../profile-modal/profile-modal.component';
import { UsuariosService } from '../services/usuarios/usuarios.service';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import Swiper from 'swiper';
import { Router } from '@angular/router';
import { HistorialService } from '../services/historial/historial.service';

declare var google: any; // Importar Google Maps

@Component({
  selector: 'app-asesores',
  templateUrl: './asesores.page.html',
  styleUrls: ['./asesores.page.scss'],
})
export class AsesoresPage implements OnInit {
@ViewChild('formDirective') formDirective!: NgForm;
  @ViewChild('autocomplete') autocomplete!: IonInput;
  images: LocalFile[] = [];

  dataSingleAsesor:any = {};
  editedAsesor:any = {};

  isModalOpenAdd = false;
  isModalOpenItem = false;
  isModalOpenOptns = false;
  isModalOpenPicture = false;
  rollMedia = '';

  viewClient = false;
  viewClientData:any = {};

  rollModal = ''
  // Para form 
  formInputPOST: FormGroup;
  formSubmit = false;
  postingAsesor = false;
  accordionValues = ['first'];

  // Para Zoom Modal
  toZoom = false;
  zoomImage = '';
  zoomImageName = '';

  pseudo_table_asesors_lastmoves= [
    {
      _id: "6463debc096500b73df445b6",
      nombre: "Mariana Salas",
      email: "mariana.salas@gmail.com",
      password: "mari_orion_85",
      role: "ASESOR",
      deleteStatus: false,
      saldo_asignado: 21000,
      telefono: 4961208795,
      direccion: "San Rafael #338 - San Cayetano",
      evidencia: [
        {
          url: 'https://i.pravatar.cc/300?u=6',
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
      nombre: "Josefa Tiscareño",
      email: "josef.tisca_69@gmail.com",
      password: "josefa_taurus_98",
      role: "ASESOR",
      deleteStatus: false,
      saldo_asignado: 44000,
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
      nombre: "Rosaura Molina",
      email: "rosaura87.mol36@gmail.com",
      password: "rosaura_aquia_87",
      role: "ASESOR",
      deleteStatus: false,
      saldo_asignado: 10000,
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
  pseudo_table_asesors= [
    {
      _id: "6463debc096500b73df445b6",
      nombre: "Mariana Salas",
      email: "mariana.salas@gmail.com",
      password: "mari_orion_85",
      role: "ASESOR",
      deleteStatus: false,
      saldo_asignado: 21000,
      telefono: 4961208795,
      direccion: "San Rafael #338 - San Cayetano",
      evidencia: [],
      createdAt: "2023-05-16T19:51:24.939Z",
      updatedAt: "2023-05-16T20:04:09.596Z",
      __v: 0
    },
    {
      _id: "6463debc096500b73df445b7",
      nombre: "Karla Pinedo",
      email: "pinedo.karla@gmail.com",
      password: "pinedo_androm_17",
      role: "ASESOR",
      deleteStatus: false,
      saldo_asignado: 13000,
      telefono: 4496127598,
      direccion: "Miguel Hidalgo - Canada Diez",
      evidencia: [],
      createdAt: "2023-05-16T19:51:24.939Z",
      updatedAt: "2023-05-16T20:04:09.596Z",
      __v: 0
    },
    {
      _id: "6463debc096500b73df445b6",
      nombre: "Susana Sanchez",
      email: "susana12.sanare@gmail.com",
      password: "susana_pegaso_24",
      role: "ASESOR",
      deleteStatus: false,
      saldo_asignado: 71000,
      telefono: 4498746912,
      direccion: "Saucedo Velasquez - Canteras del Río",
      evidencia: [],
      createdAt: "2023-05-16T19:51:24.939Z",
      updatedAt: "2023-05-16T20:04:09.596Z",
      __v: 0
    },
    {
      _id: "6463debc096500b73df445b6",
      nombre: "Liliana Espinoza",
      email: "liliana.espin@gmail.com",
      password: "lilian_draco_69",
      role: "ASESOR",
      deleteStatus: false,
      saldo_asignado: 52000,
      telefono: 4492215894,
      direccion: "San Rafael #338 - San Cayetano",
      evidencia: [],
      createdAt: "2023-05-16T19:51:24.939Z",
      updatedAt: "2023-05-16T20:04:09.596Z",
      __v: 0
    },
    {
      _id: "6463debc096500b73df445b6",
      nombre: "Julia Alonso",
      email: "july.alonoso@gmail.com",
      password: "julian_leo_36",
      role: "ASESOR",
      deleteStatus: false,
      saldo_asignado: 14000,
      telefono: 4491638855,
      direccion: "Miguel Auza - Acevedo Mirales",
      evidencia: [],
      createdAt: "2023-05-16T19:51:24.939Z",
      updatedAt: "2023-05-16T20:04:09.596Z",
      __v: 0
    },
  ]

  public results:any = []
  
  constructor(
    private actionSheetCtrl: ActionSheetController, 
    public loginService: LoginService,
    public historialService: HistorialService,
    private usuariosService: UsuariosService,
    private modalCtrl: ModalController,
    public formPrest : FormBuilder,
    private toastController: ToastController,
    private router: Router,

  ) { 
    this.formInputPOST = this.formPrest.group({
      nombre : new FormControl("", Validators.required),
      telefono :  new FormControl("", Validators.required),
      email :  new FormControl("", Validators.required),
      direccion :  new FormControl("", Validators.required),
      
      nombre_aval : new FormControl("", Validators.required),
      telefono_aval :  new FormControl("", Validators.required),
      email_aval :  new FormControl("", Validators.required),
      direccion_aval :  new FormControl("", Validators.required),
    })
   }

  async ngOnInit() {
    // Suscribirse al observable para mantener sincronizado el array
    this.loginService.images$.subscribe(images => {
      this.images = images;
    });
    
    // Cargar las imágenes iniciales
    await this.loginService.loadFilesEntity('asesor');
    this.getData()
  }
  // ionViewDidEnter() {
  //   this.autocomplete.getInputElement().then((ref: any) => {
  //     const autocomplete = new google.maps.places.Autocomplete(ref);
  //     autocomplete.addListener('place_changed', () => {
  //       console.log('Lugar seleccionado:', autocomplete.getPlace());
  //     })
  //   });
  // }

  handleRefresh(event:any) {
    setTimeout(() => {
      this.getData();
      event.target.complete();
    }, 2000);
  }

  async getData(){
    this.usuariosService.getAsesores().subscribe((data:any) => {
      console.log(data)
      this.pseudo_table_asesors = data
      this.results = data
    })
  }
  
  async setOpenAdd(isOpen: boolean, roll:string) {
    this.isModalOpenAdd = isOpen;
    this.rollModal = roll
    console.log("Toy probando",this.dataSingleAsesor)

    //console.log(this.dataSingleAsesor)
    if (roll === 'ACTUALIZAR' && this.dataSingleAsesor) {
      // Llenar el formulario con los datos del asesor seleccionado
      this.formInputPOST.patchValue({
        nombre: this.dataSingleAsesor.nombre,
        telefono: this.dataSingleAsesor.telefono,
        email: this.dataSingleAsesor.email,
        direccion: this.dataSingleAsesor.direccion,
        nombre_aval: this.dataSingleAsesor.aval_info?.nombre_aval || '',
        telefono_aval: this.dataSingleAsesor.aval_info?.telefono_aval || '',
        email_aval: this.dataSingleAsesor.aval_info?.email_aval || '',
        direccion_aval: this.dataSingleAsesor.aval_info?.direccion_aval || '',
      });
      console.log(this.formInputPOST.value)
      // Si tienes imágenes asociadas, también puedes cargarlas aquí si lo necesitas
    } else {
      // Limpiar el formulario si es un alta nueva
      this.formInputPOST.reset();
      this.dataSingleAsesor = {};
    }
    //await this.cancelarSubmit()
  }
  async setOpenEllip(isOpen: boolean, data:any){
    this.dataSingleAsesor = data
    
    await this.usuariosService.getClientes(this.dataSingleAsesor._id).subscribe((clientes:any) => {
      this.dataSingleAsesor.clientes = clientes
      this.isModalOpenItem = isOpen;
    })
    // await this.historialService.getHistorialByIdUser(this.dataSingleAsesor._id).subscribe((historial:any) => {
    //   this.dataSingleAsesor.historial = historial;
    // });
    
    console.log('Soy al dar solo clic', this.dataSingleAsesor)
  }
  setOpenOpts(isOpen: boolean, data:any){
    this.isModalOpenOptns = isOpen;
    this.dataSingleAsesor = data
    //console.log(this.editedAsesor)
  }

  async presentActionSheet() {
    const asesor = this.dataSingleAsesor;
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¡Atención!',
      subHeader: '¿Seguro que quieres eliminar este asesor?',
      cssClass: 'my-custom-actsheet',
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            this.usuariosService.deleteUsuario(asesor._id).subscribe(async (res: any) => {
              // Elimina del array principal de asesores
              const idx = this.results.findIndex((a: any) => a._id === asesor._id);
              if (idx !== -1) {
                this.results.splice(idx, 1);
              }
              // Si tienes otro array como pseudo_table_asesors, también actualízalo si es necesario
              const idxPseudo = this.pseudo_table_asesors.findIndex((a: any) => a._id === asesor._id);
              if (idxPseudo !== -1) {
                this.pseudo_table_asesors.splice(idxPseudo, 1);
              }
              await this.presentToast('bottom', 'Asesor eliminado correctamente', 2000);
              this.isModalOpenOptns = false;
            });
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


  infoModalEdited(){
    console.log(this.editedAsesor)
  }

  takePicture(imageName:string){
    this.loginService.takePicture(imageName, 'asesor').then(() => {
      this.isModalOpenPicture = false
    })
  }
  selectPicture(imageName:string){
    this.loginService.selectPicture(imageName, 'asesor').then(() => {
      this.isModalOpenPicture = false
    })
  }
  deletePicture(image:any){
    this.loginService.deleteImageEntity(image, 'asesor').then(() => {
      this.isModalOpenPicture = false
    })
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: ProfileModalComponent,
    });
    modal.present();
  }

  handleInput(event:any) {
    const query = event.target.value.toLowerCase();
    this.results = this.pseudo_table_asesors.filter((d:any) => d.nombre.toLowerCase().indexOf(query) > -1);
  }

  showMore = false; 
  toggleShowMore() {
    this.showMore = !this.showMore; // Toggle the value of showMore
  }

  async submitAddAsesor(){
    this.formSubmit = true
    //const blobs = []
    console.log(this.formInputPOST.value, this.formInputPOST.valid, this.images, this.rollModal)


    if(!this.formInputPOST.valid || this.images.length != 8 && this.rollModal != 'ACTUALIZAR'){
      console.log("not valid"); return
    }else{

      this.postingAsesor = true

      let formData: any = new FormData();
      formData.append('nombre', this.formInputPOST.value.nombre);
      formData.append('telefono', this.formInputPOST.value.telefono); 
      formData.append('email', this.formInputPOST.value.email);
      formData.append('direccion', this.formInputPOST.value.direccion);
      formData.append('role', "ASESOR");
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
        formData.append('id', this.dataSingleAsesor._id);

        await this.usuariosService.putUsuario(this.dataSingleAsesor._id, formData).subscribe((data: any) => {
          setTimeout(() => {
            console.log(data)
            this.postingAsesor = false
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

            this.loginService.deleteFolder(this.loginService.images, 'asesor');
            this.isModalOpenAdd = false;
          }, 2000);
        });
      }else {
        await this.usuariosService.postUsuario(formData).subscribe((data: any) => {
          setTimeout(() => {
            console.log(data)
            this.postingAsesor = false
            this.formDirective?.resetForm();
            this.formSubmit = false;

            // Agregar el nuevo asesor al principio del array (opcional)
            if (data && data.usuario) {
              this.results.unshift(data.usuario);
              this.presentToast('bottom', data.message, 2500);
            }

            this.loginService.deleteFolder(this.loginService.images, 'asesor');
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

              this.loginService.deleteFolder(this.loginService.images, 'asesor');
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

  //Modal view client
  viewClientModal(data:any){
    this.viewClient = true;
    this.viewClientData = data;
  }
  dismissViewClient(){
    this.viewClient = false;
    this.viewClientData = {};
  }
  goToClient(id_cliente:string){
    this.isModalOpenItem = false;
    this.dismissViewClient();
    setTimeout(() => {
      this.router.navigate(['/home/clientes'], { queryParams: { id_cliente: id_cliente } });
    }, 200); // 200ms para asegurar cierre visual
  }
  goToPrestamosCli(cliente:any){
    this.isModalOpenItem = false; 
    this.dismissViewClient();
    setTimeout(() => {
      this.router.navigate(['/home/prestamos'], { queryParams: { post_prestamo: true, cliente_id: cliente._id, cliente_name: cliente.nombre } });
    }, 200); // 200ms para asegurar cierre visual
  }
}
