import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { LoginService } from '../services/login/login.service';
import { ProfileModalComponent } from '../profile-modal/profile-modal.component';
import { UsuariosService } from '../services/usuarios/usuarios.service';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';


@Component({
  selector: 'app-asesores',
  templateUrl: './asesores.page.html',
  styleUrls: ['./asesores.page.scss'],
})
export class AsesoresPage implements OnInit {
@ViewChild('formDirective') formDirective!: NgForm;
  

  dataSingleAsesor:any = {};
  editedAsesor:any = {};

  isModalOpenAdd = false;
  isModalOpenItem = false;
  isModalOpenOptns = false;
  isModalOpenPicture = false;

  rollModal = ''
  // Para form 
  formInputPOST: FormGroup;
  formSubmit = false;
  postingPrestamo = false

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

  public results = [...this.pseudo_table_asesors]
  
  constructor(
    private actionSheetCtrl: ActionSheetController, 
    private loginService: LoginService,
    private usuariosService: UsuariosService,
    private modalCtrl: ModalController,
    public formPrest : FormBuilder,
  ) { 
    this.formInputPOST = this.formPrest.group({
      nombre : new FormControl("", Validators.required),
      telefono :  new FormControl("", Validators.required),
      correo :  new FormControl("", Validators.required),
      direccion :  new FormControl("", Validators.required),
    })
   }

  ngOnInit() {
    this.getData()
  }

  async getData(){
    this.usuariosService.getAsesores().subscribe((data:any) => {
      console.log(data)
      this.pseudo_table_asesors = data
      this.results = data
    })
  }
  
  setOpenAdd(isOpen: boolean, roll:string) {
    this.isModalOpenAdd = isOpen;
    this.rollModal = roll

    this.rollModal == 'AGREGAR'? this.editedAsesor = {}: ''
  }
  async setOpenEllip(isOpen: boolean, data:any){
    this.dataSingleAsesor = data
  
    await this.usuariosService.getClientes(this.dataSingleAsesor._id).subscribe((data:any) => {
      this.dataSingleAsesor.clientes = data
      this.isModalOpenItem = isOpen;
    })

    console.log(this.dataSingleAsesor)
  }
  setOpenOpts(isOpen: boolean, data:any){
    this.isModalOpenOptns = isOpen;
    this.editedAsesor = data
    console.log(this.editedAsesor)
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¡Atención!',
      subHeader: '¿Seguro que quieres eliminar un asesor?',
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


  infoModalEdited(){
    console.log(this.editedAsesor)
  }

  takePicture(){
    this.loginService.takePicture()
  }
  selectPicture(){
    this.loginService.selectPicture()
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
    console.log(this.formInputPOST.value)

    if(! this.formInputPOST.valid){
      console.log("not valid"); return
    }else if(this.formInputPOST.valid && this.formInputPOST.value.periodo == 14 && this.formInputPOST.value.dia_pago == ""){
      console.log("not valid"); return
    }
  }

  setEvidencia(evidenciaTyp:string, ){

  }
}
