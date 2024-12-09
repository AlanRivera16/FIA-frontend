import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, ActionSheetController } from '@ionic/angular';
import { LoginService } from '../services/login/login.service';


const data = ''
const STORAGE_KEY = 'login-data-user'

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.scss'],
})
export class ProfileModalComponent  implements OnInit {
  data:any=[]

  constructor(
    private modalCtrl: ModalController,
    private loginService: LoginService,
    public navCtrl: NavController,
    private actionSheetCtrl: ActionSheetController,
    
  ) { }

  ngOnInit() {
    this.loadData()
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async loadData(){
    this.data = await this.loginService.getData(STORAGE_KEY);
    // console.log(this.data);
    // console.log(this.loginService.googleAccount);
    
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
}
