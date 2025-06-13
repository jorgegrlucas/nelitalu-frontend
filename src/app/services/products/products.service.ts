import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { map, Observable } from 'rxjs';
import { CreateProductRequest } from 'src/app/models/interfaces/products/request/CreateProductRequest';
import { EditProductRequest } from 'src/app/models/interfaces/products/request/EditProductRequest';
import { SaleProductRequest } from 'src/app/models/interfaces/products/request/SaleProductRequest';
import { CreateProductResponse } from 'src/app/models/interfaces/products/response/CreateProductResponse';
import { deleteProductResponse } from 'src/app/models/interfaces/products/response/deleteProdcutResponse';
import { GetAllproductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponseInterface';
import { SaleProductResponse } from 'src/app/models/interfaces/products/response/SaleProductResponse';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private API_URL = environment.API_URL;
  private JWT_TOKEN = this.cookie.get('USER_INFO');
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.JWT_TOKEN}`,
    }),
  };
  private authHeader = {
    headers: new HttpHeaders({ Authorization: `Bearer ${this.JWT_TOKEN}` }),
  };

  constructor(private http: HttpClient, private cookie: CookieService) {}

  getAllProducts(): Observable<Array<GetAllproductsResponse>> {
    return this.http.get<Array<GetAllproductsResponse>>(
      `${this.API_URL}/products`,
      this.httpOptions
    );
  }

  deleteProduct(product_id: string): Observable<deleteProductResponse> {
    return this.http.delete<deleteProductResponse>(
      `${this.API_URL}/product/delete/${product_id}`
    );
  }

  createProduct(formData: FormData): Observable<CreateProductResponse> {
    return this.http.post<CreateProductResponse>(
      `${this.API_URL}/product`,
      formData,
      this.authHeader
    );
  }

  editProduct(formData: FormData): Observable<void> {
    return this.http.put<void>(
      `${this.API_URL}/product/edit`,
      formData,
      this.authHeader
    );
  }

  saleProduct(
    requestDatas: SaleProductRequest
  ): Observable<SaleProductResponse> {
    return this.http.put<SaleProductResponse>(
      `${this.API_URL}/product/sale`,
      { amount: requestDatas.amount },
      { ...this.httpOptions, params: { product_id: requestDatas.product_id } }
    );
  }
}
