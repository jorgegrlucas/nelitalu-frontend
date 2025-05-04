import { Component, Input } from '@angular/core';
import { GetAllproductsResponse } from 'src/app/models/interfaces/response/GetAllProductsResponseInterface';

@Component({
  selector: 'app-products-table',
  templateUrl: './products-table.component.html',
  styleUrls: []
})
export class ProductsTableComponent {
  @Input() products: Array<GetAllproductsResponse> = []
  public productSelected!: GetAllproductsResponse


}
