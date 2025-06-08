import { Injectable } from '@angular/core';
// import jwt_decode from "jwt-decode";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
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
