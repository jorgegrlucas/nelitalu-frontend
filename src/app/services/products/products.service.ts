import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { map, Observable } from 'rxjs';
import { CreateProductRequest } from 'src/app/models/interfaces/products/request/CreateProductRequest';
import { CreateProductResponse } from 'src/app/models/interfaces/products/response/CreateProductResponse';
import { deleteProductResponse } from 'src/app/models/interfaces/products/response/deleteProdcutResponse';
import { GetAllproductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponseInterface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private API_URL = environment.API_URL;
  private JWT_TOKEN = this.cookie.get('USER_INFO');
  private httpOptions = {
    headers: new HttpHeaders({
      contentType: 'application/json',
      Authorization: `Bearer ${this.JWT_TOKEN}`,
    }),
  };

  constructor(private http: HttpClient, private cookie: CookieService) {}

  getAllProducts(): Observable<Array<GetAllproductsResponse>> {
    console.log(this.API_URL);
    console.log(this.httpOptions);
    return this.http
      .get<Array<GetAllproductsResponse>>(
        `${this.API_URL}/products`,
        this.httpOptions
      )
      .pipe(map((product) => product.filter((data) => data?.amount > 0)));
  }

  deleteProduct(product_id: string): Observable<deleteProductResponse> {
    return this.http.delete<deleteProductResponse>(
      `${this.API_URL}/product/delete`,
      { ...this.httpOptions, params: { product_id: product_id } }
    );
  }

  createProduct(
    requestDatas: CreateProductRequest
  ): Observable<CreateProductResponse> {
    return this.http.post<CreateProductResponse>(
      `${this.API_URL}/product`,
      requestDatas,
      this.httpOptions
    );
  }
}
