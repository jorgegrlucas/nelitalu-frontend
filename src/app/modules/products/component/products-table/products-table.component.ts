import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductEvent } from 'src/app/models/enums/products/product.event';
import { EventAction } from 'src/app/models/interfaces/products/event/eventAction';
import { GetAllproductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponseInterface';

@Component({
  selector: 'app-products-table',
  templateUrl: './products-table.component.html',
  styleUrls: []
})
export class ProductsTableComponent {
  @Input() products: Array<GetAllproductsResponse> = []
  @Output() productEvent = new EventEmitter<EventAction>()

  public productSelected!: GetAllproductsResponse
  public addProductEvent = ProductEvent.ADD_PRODUCT_EVENT
  public editProductEvent = ProductEvent.EDIT_PRODUCT_EVENT

  public handleProductEvent(action: string, id?: string): void{
    if(action && action != ''){
       const productEventData = id && id != '' ? { action, id} : { action }
        this.productEvent.emit(productEventData)
    }
  }


}
