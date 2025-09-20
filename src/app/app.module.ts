import { NgModule, LOCALE_ID} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomePageModule } from './home/home.module';
import { LoginPageModule } from './login/login.module';
import { CommonModule, registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MoneyTransformPipe } from './Pipes/money-transform.pipe';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Drivers, Storage } from '@ionic/storage';
import { ProfileModalComponent } from './profile-modal/profile-modal.component'
import { ClienteModalComponent } from './cliente-modal/cliente-modal.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgChartsModule } from 'ng2-charts';


import localEs from '@angular/common/locales/es-MX'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
registerLocaleData(localEs, 'es-MX')

@NgModule({
  declarations: [AppComponent, ProfileModalComponent],
  imports: [
    CommonModule,
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    HomePageModule,
    LoginPageModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgChartsModule,
    IonicStorageModule.forRoot({
      name: 'Login-Session-DB',
      driverOrder: [Drivers.IndexedDB,Drivers.LocalStorage]
    })
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, {provide: LOCALE_ID, useValue: 'es-MX'}],
  bootstrap: [AppComponent],
  exports: []
})
export class AppModule {}
