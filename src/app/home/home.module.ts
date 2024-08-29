import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { AsesoresPageModule } from '../asesores/asesores.module';
import { ClientesPageModule } from '../clientes/clientes.module';
import { DashboardPageModule } from '../dashboard/dashboard.module';
import { PrestamosPageModule } from '../prestamos/prestamos.module';


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    //Import the routing components
    // AsesoresPageModule,
    // ClientesPageModule,
    // DashboardPageModule,
    // PrestamosPageModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
