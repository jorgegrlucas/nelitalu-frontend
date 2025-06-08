import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { AuthRequest } from 'src/app/models/interfaces/user/authRequest';
import { AuthResponse } from 'src/app/models/interfaces/user/authResponse';
import { SignUpUserRequest } from 'src/app/models/interfaces/user/signUpUserRequest';
import { SignUpUserResponse } from 'src/app/models/interfaces/user/signUpUserResponse';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private API_URL = environment.API_URL;

  constructor(private http: HttpClient, private cookie: CookieService) {}

  signUpUser(requestDatas: SignUpUserRequest): Observable<SignUpUserResponse> {
    return this.http.post<SignUpUserResponse>(
      `${this.API_URL}/user`,
      requestDatas
    );
  }

  authUser(requestDatas: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth`, requestDatas);
  }

  isLoggedIn(): boolean {
    const JWT_TOKEN = this.cookie.get('USER_INFO');
    return JWT_TOKEN ? true : false;
  }

  getCurrentUserId(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const payload = token.split('.')[1]; // pega a parte do payload
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '='
    );
    const decodedPayload = atob(padded);
    const decoded = JSON.parse(decodedPayload);

    // Retorna o sub (id do usuário)
    return decoded.sub;
  }
}
