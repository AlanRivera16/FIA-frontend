import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsesorModalComponent } from '../asesor-modal/asesor-modal.component';
import { ClienteModalComponent } from '../cliente-modal/cliente-modal.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [AsesorModalComponent,ClienteModalComponent],
  imports: [CommonModule,IonicModule],
  exports: [AsesorModalComponent,ClienteModalComponent]
})
export class SharedComponentsModule {}