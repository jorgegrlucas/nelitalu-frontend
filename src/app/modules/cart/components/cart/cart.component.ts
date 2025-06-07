import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CartService } from 'src/app/services/cart/cart-service.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];

  constructor(
    private cartService: CartService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCart();
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

  removeFromCart(cartItemId: string) {
    this.cartService.removeFromCart(cartItemId).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(
          (item) => item._id !== cartItemId
        );
        this.messageService.add({
          severity: 'sucess',
          summary: 'Successo',
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
}
