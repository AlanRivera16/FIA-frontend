import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavController, ActionSheetController, IonModal, ToastController } from '@ionic/angular';
import { LocalFile, LoginService } from '../services/login/login.service';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { UsuariosService } from '../services/usuarios/usuarios.service';
import { HistorialService } from '../services/historial/historial.service';
import { Router } from '@angular/router';
import { NotificModalComponent } from '../notific-modal/notific-modal.component';


const STORAGE_KEY = 'login-data-user'

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.scss'],
})
export class ProfileModalComponent  implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  images: LocalFile[] = [];
  @ViewChild('formDirective') formDirective!: NgForm;

  data:any=[]

  pickPictureModal = false;
  guardadosModal = false;

  formProfilePOST!: FormGroup;
  toEdit = false;
  formSubmit = false;
  updating = false;

  guardados: any[] = [];

  constructor(
    private modalCtrl: ModalController,
    private loginService: LoginService,
    public navCtrl: NavController,
    private actionSheetCtrl: ActionSheetController,
    public formBuilder : FormBuilder,
    private usuarioService: UsuariosService,
    private toastController: ToastController,
    private historialService: HistorialService,
    public router: Router,
  ) {
    // this.formProfilePOST = this.formBuilder.group({
    //   nombre: new FormControl("", Validators.required),
    //   email: new FormControl("", [Validators.required, Validators.email]),
    //   telefono: new FormControl("", Validators.required),
    // });
  }

  async ngOnInit() {
    this.loadData()
    this.loginService.imagesPerfil$.subscribe(images => {
      this.images = images;
      console.log('Imágenes de perfil cargadas:', images);
    });

    await this.loginService.loadFilesEntity('perfil');
  }

  initForm(){
    // this.formProfilePOST = this.formBuilder.group({
    //   nombre: new FormControl("", Validators.required),
    //   email: new FormControl("", [Validators.required, Validators.email]),
    //   telefono: new FormControl("", Validators.required),
    // });
    this.formProfilePOST = new FormGroup({
      nombre: new FormControl(this.data?.nombre, Validators.required),
      email: new FormControl(this.data?.email, [Validators.required, Validators.email]),
      telefono: new FormControl(this.data?.telefono, Validators.required),
    });
  }

  checkOutEditModal = async () => {
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¿Estás segura que deseas continuar?',
      subHeader: 'Se perderán los cambios no guardados',
      buttons: [
        {
          text: 'Sí',
          role: 'confirm',
        },
        {
          text: 'No',
          role: 'cancel',
        },
      ],
    });

    actionSheet.present();

    const { role } = await actionSheet.onWillDismiss();
    console.log(role)
    if(role == "confirm"){

    }
    return
  };


  async back() {
    if(this.images.length > 0 || this.toEdit){
      const actionSheet = await this.actionSheetCtrl.create({
        header: '¿Estás segura que deseas continuar?',
        subHeader: 'Se perderán los cambios no guardados',
        buttons: [
          {
            text: 'Sí',
            role: 'confirm',
          },
          {
            text: 'No',
            role: 'cancel',
          },
        ],
      });

      actionSheet.present();

      const { role } = await actionSheet.onWillDismiss();
      console.log(role)
      if(role == "confirm"){
        this.toEdit = false;
        this.modal.dismiss(null, 'cancel');
        this.loginService.deleteFolder(this.loginService.imagesPerfil, 'perfil');
        this.images = [];
      }
    } else {
      this.modal.dismiss(null, 'cancel');
    }

  }

  onWillDismiss() {
    this.back();
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  openPickPicture() {
    this.pickPictureModal = true;
  }
  openGuardados() {
    this.guardadosModal = true;
    // Trae la data completa solo cuando se abre el modal
    this.historialService.obtenerDatosMovimientosGuardados(this.data._id).subscribe((res: any) => {
      this.guardados = res.movimientos;
      console.log('Movimientos guardados:', this.guardados);
      // Aquí puedes procesar o mostrar los movimientos guardados en el modal
    });
  }
  closeGuardados() {
    this.guardadosModal = false;
  }
  closePickPicture() {
    this.pickPictureModal = false;
  }

  verMovimientoGuardado(mov: any) {
    this.closeGuardados();
    setTimeout(() => {
      this.cancel();
      setTimeout(() => {
        this.router.navigate(['/home/dashboard'], { queryParams: { movimientoId: mov._id } });
      }, 200);
    }, 200);
  }

  async loadData(){
    this.data = await this.loginService.getData(STORAGE_KEY);
    console.log(this.data);
    // console.log(this.loginService.googleAccount);

    this.initForm()
    // await this.historialService.obtenerMovimientosGuardados(this.data._id).subscribe((res: any) => {
    //   this.guardados = res.guardados.map((mov: any) => mov._id);
    // });

  }

  async signOut(){
    await this.loginService.removeData(STORAGE_KEY);
    this.data = null
    console.log("Te has desconectado!!");
    this.navCtrl.navigateRoot([`/login`]);
    this.cancel()
  }

  checkOut = async () => {
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¿Estás segura que deseas continuar?',
      buttons: [
        {
          text: 'Sí',
          role: 'confirm',
        },
        {
          text: 'No',
          role: 'cancel',
        },
      ],
    });

    actionSheet.present();

    const { role } = await actionSheet.onWillDismiss();
    console.log(role)
    if(role == "confirm"){
      this.signOut()
    }
    return
  };

  setEdit(){
    this.toEdit = true;
    this.initForm();
  }

  cancelEditInputs(){
    this.toEdit = false;
    this.formDirective?.resetForm();
  }


  takePicture(){
    this.loginService.takePicture('foto-perfil', 'perfil').then(() => {
      this.pickPictureModal = false;
    })
  }
  selectPicture(){
    this.loginService.selectPicture('foto-perfil', 'perfil').then(() => {
      this.pickPictureModal = false;
    })
  }
  deletePicture(image:any){
    this.loginService.deleteImageEntity(image, 'perfil').then(() => {
      this.pickPictureModal = false;
    })
  }

  async submitForm() {
    this.formSubmit = true;
    let formData = new FormData();
    if(!this.formProfilePOST.valid) {
      return;
    } if (this.formProfilePOST.valid) {
      this.updating = true;

      if(this.images.length > 0){
        const response = await fetch(this.images[0].data);
        const blob = await response.blob();
        formData.append('image', blob, 'foto-perfil.jpeg');
      }

      if(this.toEdit){
        // formData.append('nombre', this.formProfilePOST.value.nombre);
        // formData.append('telefono', this.formProfilePOST.value.telefono);
        // formData.append('email', this.formProfilePOST.value.email);
        console.log(this.formProfilePOST.value);
      }

        //this.images.length > 0 && !this.toEdit
      await this.usuarioService.putUsuario(this.data._id, formData).subscribe((data:any) => {
        console.log("Perfil actualizado:", data);
        setTimeout(() => {
          this.formSubmit = false;
          this.updating = false;
          this.formDirective?.resetForm();

          //Agregar la nueva imagen al usuario data
          this.loginService.setItem(STORAGE_KEY, data.usuario);
          this.data = data.usuario;
          if(this.images.length > 0 && !this.toEdit){
            this.presentToast('bottom', "Imagen de perfil actualizada", 2500);
          }else {
            this.presentToast('bottom', "Perfil actualizado correctamente", 2500);
          }

          this.loginService.deleteFolder(this.loginService.imagesPerfil, 'perfil');
          this.images = [];
          this.toEdit = false;
        }, 2000);
      });
    }
  }

  srcImageName(images: { originalname: string }[], name: string): any {
    if(images && images.length > 0) {
      return images.find(img => img.originalname === name + '.jpeg');
    } else {
      return { url: 'https://ionicframework.com/docs/img/demos/avatar.svg' }; // Default image if not found
    }
  }

  getImageByName(name: string): LocalFile | undefined {
    return this.images.find(img => img.name === name + '.jpeg');
  }

  async presentToast(position: 'top' | 'middle' | 'bottom', message: string, time: number) {
    const toast = await this.toastController.create({
      message: message,
      duration: time,
      position: position,
    });

    await toast.present();
  }


  goToWallet() {
    this.router.navigate(['/home/dashboard']);
    this.onWillDismiss();
    setTimeout(() => {
      this.cancel(); // Cierra el modal al navegar, si es necesario
    }, 900);
  }

  async openNotificacionesModal() {
    const modal = await this.modalCtrl.create({
      component: NotificModalComponent,
    });
    modal.present();
  }

}
