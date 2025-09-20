import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AsesoresPageRoutingModule } from './asesores-routing.module';

import { AsesoresPage } from './asesores.page';
import { PipesModule } from '../Pipes/pipes.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AsesoresPageRoutingModule,
    PipesModule
  ],
  declarations: [AsesoresPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AsesoresPageModule {}
