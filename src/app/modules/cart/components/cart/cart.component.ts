import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { SaleProductRequest } from 'src/app/models/interfaces/products/request/SaleProductRequest';
import { CartService } from 'src/app/services/cart/cart-service.service';
import { ProductsService } from 'src/app/services/products/products.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  checkoutDialogVisible = false;
  private API_URL = environment.API_URL;
  private JWT_TOKEN = this.cookie.get('USER_INFO');
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.JWT_TOKEN}`,
    }),
  };
  private readonly destroy$: Subject<void> = new Subject();

  constructor(
    private cartService: CartService,
    private messageService: MessageService,
    private http: HttpClient,
    private cookie: CookieService,
    private router: Router,
    private productService: ProductsService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCart() {
    this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems = items;
      },
      error: (err) => {
        console.error('Erro ao carregar carrinho:', err);
      },
    });
  }

  increaseQuantity(cartItemId: string, currentQuantity: number) {
    const newQuantity = currentQuantity + 1;
    this.cartService
      .updateCartItemQuantity(cartItemId, 'cart', '1', newQuantity)
      .subscribe({
        next: () => {
          this.cartItems = this.cartItems.map((item) => {
            if (item._id === cartItemId) {
              item.quantity = newQuantity;
            }
            return item;
          });
        },
        error: (err: any) => {
          console.error('Erro ao aumentar quantidade:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: err.error.message,
            life: 2000,
          });
        },
      });
  }

  decreaseQuantity(cartItemId: string, currentQuantity: number) {
    const newQuantity = currentQuantity - 1;
    this.cartService
      .updateCartItemQuantity(cartItemId, 'cart', '1', newQuantity)
      .subscribe({
        next: () => {
          if (newQuantity <= 0) {
            this.cartItems = this.cartItems.filter(
              (item) => item._id !== cartItemId
            );
          } else {
            this.cartItems = this.cartItems.map((item) => {
              if (item._id === cartItemId) {
                item.quantity = newQuantity;
              }
              return item;
            });
          }
        },
        error: (err: any) => {
          console.error('Erro ao diminuir quantidade:', err);
        },
      });
  }

  removeFromCart(cartItemId: string) {
    this.cartService.removeFromCart(cartItemId).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(
          (item) => item._id !== cartItemId
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Removido com sucesso',
          life: 2000,
        });
      },
      error: (err) => {
        console.error('Erro ao remover item:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Erro ao remover produto do carrinho',
          life: 2000,
        });
      },
    });
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => {
      return total + item.jewel.price * item.quantity;
    }, 0);
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  showCheckoutDialog() {
    this.checkoutDialogVisible = true;
  }

  finalizePurchase() {
    const container = document.getElementById('paypal-button-container');
    if (container) {
      container.innerHTML = '';
    }
    this.http
      .post<{ orderId: string }>(`${this.API_URL}/paypal/create-order`, {
        items: this.cartItems,
        subtotal: this.getSubtotal(),
      })
      .subscribe({
        next: (res) => {
          const orderId = res.orderId;
          // @ts-ignore
          paypal
            .Buttons({
              createOrder: (data: any, actions: any) => {
                return orderId;
              },
              onApprove: (data: any, actions: any) => {
                return this.http
                  .post(`${this.API_URL}/paypal/capture-order`, {
                    orderId: data.orderID,
                  })
                  .toPromise()
                  .then(() => {
                    this.checkoutDialogVisible = false;
                    console.log('cart:', this.cartItems);
                    for (
                      let index = 0;
                      index < this.cartItems.length;
                      index++
                    ) {
                      console.log(
                        'product_id: ',
                        this.cartItems[index].jewel._id
                      );
                      console.log('amount: ', this.cartItems[index].quantity);
                      const requestDatas: SaleProductRequest = {
                        amount: this.cartItems[index].quantity,
                        product_id: this.cartItems[index].jewel._id,
                      };
                      this.productService
                        .saleProduct(requestDatas)
                        .pipe(takeUntil(this.destroy$))
                        .subscribe({
                          next: (res) => {
                            this.http
                              .delete(`${this.API_URL}/cart`, {
                                ...this.httpOptions,
                                body: { userId: this.JWT_TOKEN },
                              })
                              .subscribe({
                                next: () => {
                                  this.cartItems = [];

                                  this.router.navigateByUrl('/page');
                                  this.messageService.add({
                                    severity: 'success',
                                    summary: 'Sucesso',
                                    detail: 'Compra efetuada com sucesso',
                                    life: 2000,
                                  });
                                },
                                error: (err) => {
                                  console.error(
                                    'Erro ao limpar carrinho:',
                                    err
                                  );
                                },
                              });
                          },
                        });
                    }
                  });
              },
              onError: (err: any) => {
                console.error('Erro no PayPal:', err);
              },
            })
            .render('#paypal-button-container');
          this.checkoutDialogVisible = false;
        },
        error: (err) => {
          console.error('Erro ao criar order:', err);
        },
      });
  }
}
