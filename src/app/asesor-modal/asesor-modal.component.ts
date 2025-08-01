import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Cliente, Asesor, Item } from '../types';


@Component({
  selector: 'app-asesor-modal',
  templateUrl: './asesor-modal.component.html',
  styleUrls: ['./asesor-modal.component.scss'],
})
export class AsesorModalComponent  implements OnInit {

  constructor(private modalCtrl:ModalController) { }

  @Input() items: Cliente[] = [];
  @Input() selectedItems: string[] = [];
  @Input() title = 'Select Items';
  
  @Output() selectionCancel = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<string[]>();

  filteredItems: Cliente[] = [];
  workingSelectedValues: string[] = [];

  ngOnInit() {
    this.filteredItems = [...this.items];
    this.workingSelectedValues = [...this.selectedItems];
  }

  trackItems(index: number, item: Asesor) {
    return item.nombre;
  }

  cancelChanges() {
    this.selectionCancel.emit()
    // this.selectionCancel.emit()
  }

  confirmChanges() {
    this.selectionChange.emit(this.workingSelectedValues);
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

  checkboxChange(ev:any){
      console.log(ev)
      const { value } = ev.detail;
      this.workingSelectedValues = [value];
      console.log(this.workingSelectedValues)
  }

}
