// src/app/guards/auth-guard.service.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanLoad,
  Route,
  UrlSegment,
  UrlTree,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate, CanLoad {
  constructor(private userService: UserService, private router: Router) {}

  // src/app/guards/auth-guard.service.ts
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    // ler roles permitidas desta rota
    const allowedRoles: string[] = route.data['roles'] || [];

    // primeiro valida se está logado
    if (!this.userService.isLoggedIn()) {
      return this.router.createUrlTree(['/home'], {
        queryParams: { returnUrl: state.url },
      });
    }

    // depois, se existirem roles configuradas, valida-as
    if (allowedRoles.length) {
      // obter a role real do user (do JWT ou do endpoint /me)
      const userRole = this.userService.getUserRole();

      if (!userRole || !allowedRoles.includes(userRole)) {
        // não tem permissão
        return this.router.createUrlTree(['/page']);
      }
    }

    // se passou em todos os testes, autoriza
    return true;
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree {
    const path = `/${route.path}`;
    const allowedRoles: string[] = route.data?.['roles'] || [];

    if (!this.userService.isLoggedIn()) {
      return this.router.createUrlTree(['/home'], {
        queryParams: { returnUrl: path },
      });
    }

    if (allowedRoles.length) {
      const userRole = this.userService.getUserRole();
      if (!userRole || !allowedRoles.includes(userRole)) {
        return this.router.createUrlTree(['/page']);
      }
    }

    return true;
  }
}
