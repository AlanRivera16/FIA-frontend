import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'moneyTransform'
})
export class MoneyTransformPipe implements PipeTransform {

  // transform(value: unknown, ...args: unknown[]): unknown {
  //   return null;
  // }
  transform(value: number): string | any {
    if(isNaN(value) || value === null) return ''

    // Convertir el número a cadena
    const stringValue = value.toString();
    // Separar los miles por comas
    const separado = stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return separado;
  }
}
