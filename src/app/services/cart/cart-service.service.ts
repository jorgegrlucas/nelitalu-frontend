import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private API_URL = environment.API_URL;
  private JWT_TOKEN = this.cookie.get('USER_INFO');
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.JWT_TOKEN}`,
    }),
  };

  constructor(private http: HttpClient, private cookie: CookieService) {}

  addToCart(jewelId: number) {
    return this.http.post(
      `${this.API_URL}/cart/add`,
      { jewelId },
      this.httpOptions
    );
  }

  getCartItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/cart`, this.httpOptions);
  }

  removeFromCart(cartItemId: string): Observable<any> {
    return this.http.delete(
      `${this.API_URL}/cart/${cartItemId}`,
      this.httpOptions
    );
  }
}
