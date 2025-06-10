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

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const allowedRoles: string[] = route.data['roles'] || [];

    if (!this.userService.isLoggedIn()) {
      return this.router.createUrlTree(['/home'], {
        queryParams: { returnUrl: state.url },
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
