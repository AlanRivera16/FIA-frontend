import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificModalComponent } from '../notific-modal/notific-modal.component';
import { ClienteModalComponent } from '../cliente-modal/cliente-modal.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [NotificModalComponent,ClienteModalComponent],
  imports: [CommonModule,IonicModule],
  exports: [NotificModalComponent,ClienteModalComponent]
})
export class SharedComponentsModule {}