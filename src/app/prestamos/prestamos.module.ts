import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrestamosPageRoutingModule } from './prestamos-routing.module';

import { PrestamosPage } from './prestamos.page';
import { PipesModule } from '../Pipes/pipes.module';
import { ClienteModalComponent } from '../cliente-modal/cliente-modal.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AsesorModalComponent } from '../asesor-modal/asesor-modal.component';
import { SharedComponentsModule } from '../shared-components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PrestamosPageRoutingModule,
    PipesModule,
    SharedComponentsModule
  ],
  declarations: [PrestamosPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PrestamosPageModule {}
