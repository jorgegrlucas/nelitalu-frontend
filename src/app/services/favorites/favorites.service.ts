import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private API_URL = environment.API_URL;
  private JWT_TOKEN = this.cookie.get('USER_INFO');
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.JWT_TOKEN}`,
    }),
  };

  constructor(private http: HttpClient, private cookie: CookieService) {}

  getFavoritesByUser(userId: string): Observable<number[]> {
    return this.http.get<number[]>(
      `${this.API_URL}/favorites/user/${userId}`,
      this.httpOptions
    );
  }

  addFavorite(userId: string, productId: number): Observable<any> {
    return this.http.post(
      `${this.API_URL}/favorites/add`,
      {
        userId,
        productId,
      },
      this.httpOptions
    );
  }

  removeFavorite(userId: string, productId: number): Observable<any> {
    return this.http.post(
      `${this.API_URL}/favorites/remove`,
      {
        userId,
        productId,
      },
      this.httpOptions
    );
  }
}
