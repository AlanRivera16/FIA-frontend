import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomePageModule } from './home/home.module';
import { LoginPageModule } from './login/login.module';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MoneyTransformPipe } from './Pipes/money-transform.pipe';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Drivers, Storage } from '@ionic/storage';
import { ProfileModalComponent } from './profile-modal/profile-modal.component'
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
    IonicStorageModule.forRoot({
      name: 'Login-Session-DB',
      driverOrder: [Drivers.IndexedDB,Drivers.LocalStorage]
    })
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  exports: []
})
export class AppModule {}
