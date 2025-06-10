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
    console.log('this.cookie, ', this.cookie);
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

  private getTokenPayload(): any | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const [, payloadB64] = token.split('.');
    const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (payloadB64.length % 4)) % 4),
      '='
    );
    return JSON.parse(atob(padded));
  }

  /** Retorna true se o token indicar que é admin */
  isAdmin(): boolean {
    const payload = this.getTokenPayload();
    return payload?.isAdmin === true;
  }

  getUserRole(): string | null {
    const payload = this.getTokenPayload();
    // imagina que no payload tens { isAdmin: true, role: 'admin' }
    return payload?.role ?? (payload?.isAdmin ? 'admin' : null);
  }
}
