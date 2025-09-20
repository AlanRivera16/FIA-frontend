import { Component, Input, Output, EventEmitter } from '@angular/core';
import type { OnInit } from '@angular/core';
import { Cliente, Item } from '../types';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-cliente-modal',
  templateUrl: './cliente-modal.component.html',
  styleUrls: ['./cliente-modal.component.scss'],
})
export class ClienteModalComponent  implements OnInit {

  constructor(private modalCtrl:ModalController) { }

  @Input() items: any[] = [];
  @Input() selectedItems: string[] = [];
  @Input() title = 'Select Items';

  @Output() selectionCancel = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<string[]>();

  filteredItems: any[] = [];
  workingSelectedValues: string[] = [];

  ngOnInit() {
    this.filteredItems = [...this.items];
    this.workingSelectedValues = [...this.selectedItems];
    console.log(this.filteredItems, this.selectedItems, this.workingSelectedValues)
  }

  trackItems(index: number, item: any) {
    return item.nombre;
  }

  cancelChanges() {
    this.selectionCancel.emit()
    // this.selectionCancel.emit()
  }

  confirmChanges() {
    this.selectionChange.emit(this.workingSelectedValues);
  }

  cleanSelection() {
    this.workingSelectedValues = [];
    this.selectedItems = [];
  }

  searchbarInput(ev:any) {
    this.filterList(ev.target.value);
  }

  /**
   * Update the rendered view with
   * the provided search query. If no
   * query is provided, all data
   * will be rendered.
   */
  filterList(searchQuery: string | undefined) {
    /**
     * If no search query is defined,
     * return all options.
     */
    if (searchQuery === undefined) {
      this.filteredItems = [...this.items];
    } else {
      /**
       * Otherwise, normalize the search
       * query and check to see which items
       * contain the search query as a substring.
       */
      const normalizedQuery = searchQuery.toLowerCase();
      this.filteredItems = this.items.filter((item) => {
        return item.nombre.toLowerCase().includes(normalizedQuery);
      });
    }
  }

  // isChecked(value: string) {
  //   return this.workingSelectedValues.find((item) => item === value);
  // }

  // checkboxChange(ev:any) {
  //   const { checked, value } = ev.detail;
  //   console.log(ev)

  //   if (checked) {
  //     this.workingSelectedValues = [...this.workingSelectedValues, value];
  //   } else {
  //     this.workingSelectedValues = this.workingSelectedValues.filter((item) => item !== value);
  //   }
  // }

  checkboxChange(ev:any){
      console.log(ev)
      const { value } = ev.detail;
      this.workingSelectedValues = [value];
      console.log(value, this.workingSelectedValues)
  }


  srcImageName(images: { originalname: string }[], name: string): any {
    if (images && images.length > 0) {
      return images.find(img => img.originalname === name + '.jpeg');
    } else { // Si modal add/update esta abierto no muestres la imagen por defecto
      return { url: 'https://ionicframework.com/docs/img/demos/avatar.svg' }; // Default image if not found
    }
  }

}
