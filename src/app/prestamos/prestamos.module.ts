import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrestamosPageRoutingModule } from './prestamos-routing.module';

import { PrestamosPage } from './prestamos.page';
import { PipesModule } from '../Pipes/pipes.module';
import { ClienteModalComponent } from '../cliente-modal/cliente-modal.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PrestamosPageRoutingModule,
    PipesModule,
  ],
  declarations: [PrestamosPage, ClienteModalComponent]
})
export class PrestamosPageModule {}
