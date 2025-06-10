import { GetAllproductsResponse } from '../../../models/interfaces/products/response/GetAllProductsResponseInterface';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductsDataTransferService {
  public productsDataEmitter$ =
    new BehaviorSubject<Array<GetAllproductsResponse> | null>(null);
  public productsDatas: Array<GetAllproductsResponse> = [];

  setProductsDatas(products: Array<GetAllproductsResponse>): void {
    this.productsDataEmitter$.next(products);
    this.getAllproductsDatas();
  }
  getAllproductsDatas() {
    this.productsDataEmitter$
      .pipe(
        take(1),
        map((data) => data?.filter((product) => product.amount > 0))
      )
      .subscribe({
        next: (response) => {
          if (response) {
            this.productsDatas = response;
          }
        },
      });
    return this.productsDatas;
  }

  constructor() {}
}
