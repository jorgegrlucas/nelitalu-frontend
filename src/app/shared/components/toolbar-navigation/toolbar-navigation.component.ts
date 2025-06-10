import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { DialogService } from 'primeng/dynamicdialog';
import { ProductEvent } from 'src/app/models/enums/products/product.event';
import { ProcuctFormComponent } from 'src/app/modules/products/component/procuct-form/procuct-form.component';

interface JwtPayload {
  sub: string;
  isAdmin: boolean;
}

@Component({
  selector: 'app-toolbar-navigation',
  templateUrl: './toolbar-navigation.component.html',
  styleUrls: [],
})
export class ToolbarNavigationComponent implements OnInit {
  constructor(
    private cookie: CookieService,
    private router: Router,
    private dialogService: DialogService
  ) {}
  isAdmin = false;

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeJWT<{ sub: string; isAdmin: boolean }>(token);
      this.isAdmin = decoded.isAdmin;
    }
  }

  handleLogout(): void {
    this.cookie.delete('USER_INFO');
    void this.router.navigate(['/home']);
  }

  handleSaleProduct(): void {
    const saleProductAction = ProductEvent.SALE_PRODUCT_EVENT;
    this.dialogService.open(ProcuctFormComponent, {
      header: saleProductAction,
      width: '70%',
      height: '50%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      data: {
        event: { action: saleProductAction },
      },
    });
  }
}

function decodeJWT<T = any>(token: string): T {
  const payload = token.split('.')[1];
  // Corrige o padding do base64
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '='
  );
  const decoded = atob(padded);
  return JSON.parse(decoded);
}

const token = localStorage.getItem('token');
if (token) {
  const decoded = decodeJWT(token);
}
