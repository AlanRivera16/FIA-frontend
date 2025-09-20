import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoginService } from '../services/login/login.service';

const STORAGE_KEY = 'login-data-user'

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  @ViewChild('email') inputEmail!: ElementRef;
  @ViewChild('password') inputPassword!: ElementRef;

  errors:any;
  user = {
    email:'',
    password: ''
  }
  data : any
  number=1000000000
  //Propiedades para input email
  mailFocuse = false
  mailNeedsFocus = false;
  mailWillOpen = false
  mailValue = false
  //Propiedades para input email
  passFocuse = false
  passWillOpen = false
  passValue = false

  constructor(
    private loginService : LoginService, 
    private toastController: ToastController,
    private loadingCtrl: LoadingController,
    public navCtrl: NavController,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    this.mailFocuse = true
    this.data = await this.loginService.getData(STORAGE_KEY);
    console.log(this.data?.role);
    if(this.data && this.data?.role == 'ADMINISTRADOR'){
      console.log(this.data);
      this.navCtrl.navigateRoot(['/home/dashboard']);
    }else if(this.data && this.data?.role == 'ASESOR'){
      this.navCtrl.navigateRoot(['/home/prestamos']);
    }    
  }

  //Metodos para input mail
  actvMail(){
    this.mailWillOpen = true
    setTimeout(() => {
      this.inputEmail.nativeElement.focus();
    }, 0.5);
  }
  mailFocusIn(event: FocusEvent){
    event.isTrusted?this.mailFocuse = true:''
    this.mailValue = false
  }
  mailFocusOut(event: FocusEvent){
    console.log(event);
    if(this.inputEmail.nativeElement.value!=''){
      this.mailValue = true
    }else{
      event.isTrusted?this.mailFocuse = false:''
      this.mailWillOpen = false
    }
    
  }

  //Metodos para input password
  actvPassw(){
    this.passWillOpen = true
    setTimeout(() => {
      this.inputPassword.nativeElement.focus();
    }, 0.5);
  }
  passFocusIn(event: FocusEvent){
    event.isTrusted?this.passFocuse = true:''
    this.passValue = false
  }
  passFocusOut(event: FocusEvent){
    if(this.inputPassword.nativeElement.value!=''){
      this.passValue = true
    }else{
      event.isTrusted?this.passFocuse = false:''
      this.passWillOpen = false
    }
  }

  
  async presentToast(message:string, position: 'top' | 'bottom') {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: position,
    });

    await toast.present();
  }

  async submitNow(){
    this.loginService.login(this.user).subscribe(async(value:any)=>{  
      if(value.findUser){
        await this.loginService.addData(STORAGE_KEY,value.findUser) //Agregamos una variable a nuestra login-storage con nuestro método
        console.log(value.findUser)
        this.presentToast('Bienvenido ' + value.findUser.nombre, 'bottom');         

        setTimeout(() => {
          this.navCtrl.navigateRoot(['/home/prestamos']);
        }, 1500);
        
      } else if(value.error){
        this.presentToast(value.error, 'top');
      }   
      console.log(value)
    },error=>{
      console.log(error)
      this.presentToast(error, 'top');;
    })

    // this.loginService.login(this.user).subscribe({
    //   next(value) {
    //     console.log(value);
    //   },
    //   error(err) {
    //     console.log(err)
    //     this.presentToast(err);
    //   }
    // });  
  }

  async submit(){
    this.navCtrl.navigateRoot(['/home/dashboard']);

    // const loading = await this.loadingCtrl.create({
    //   mode: 'md',
    //   spinner: 'crescent',
    //   cssClass: 'login-custom',
    // });
    // loading.present();

    // await this.loginService.login(this.user).subscribe((value)=>{

    //   this.data = value

    //   if(this.data.findUser){
    //     console.log(this.data.findUser);
    //     setTimeout(() => {
    //       loading.dismiss();
    //       this.navCtrl.navigateRoot(['/home/dashboard']);
    //     }, 2000);
    //   }
    //   if(this.data.error){
        
    //     this.presentToast(this.data.error);
    //     loading.dismiss();
    //   } 

      
    // })

  }

}
