import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoginService } from '../services/login/login.service';

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
  ) { }

  ngOnInit() {
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
    // console.log(this.inputEmail.nativeElement.value);
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

  
  async presentToast(message:string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: 'bottom',
    });

    await toast.present();
  }

  async submitNow(){
    await this.loginService.login(this.user).subscribe({
      next(value) {
        console.log(value);
      },
      error(err) {
        console.log(err)
      },
    })
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
