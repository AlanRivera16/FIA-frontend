import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoneyTransformPipe } from './money-transform.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [MoneyTransformPipe],
  exports: [MoneyTransformPipe]
})
export class PipesModule { }
