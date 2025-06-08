import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { GetAllproductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponseInterface';
import { CartService } from 'src/app/services/cart/cart-service.service';
import { FavoritesService } from 'src/app/services/favorites/favorites.service';
import { ProductsService } from 'src/app/services/products/products.service';
import { ProductsDataTransferService } from 'src/app/shared/services/products/products-data-transfer.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: [],
})
export class PageComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  public productDatas: Array<GetAllproductsResponse> = [];
  public likedProductsIds: number[] = [];
  public currentUserId: string = '683ddf9e94c4253cd02c1720';
  cartItems: {
    [productId: string]: { cartItemId: string; quantity: number };
  } = {};

  constructor(
    private productsService: ProductsService,
    private productsDataTransferService: ProductsDataTransferService,
    private favoritesService: FavoritesService,
    private router: Router,
    private messageService: MessageService,
    private cartService: CartService // private confirmationService: ConfirmationService, // private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.getServiceProductdDatas();
    this.loadUserFavorites();
    this.loadCartItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getServiceProductdDatas() {
    const productLoads = this.productsDataTransferService.getAllproductsDatas();

    if (productLoads.length > 0) {
      this.productDatas = productLoads;
    } else {
      this.getAPIProductsData();
    }
  }

  getAPIProductsData() {
    this.productsService
      .getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.productDatas = response;
          }
        },
        error: (err) => {
          console.log(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Erro ao carregar produtos',
            life: 2000,
          });
          this.router.navigate(['/home']);
        },
      });
  }

  loadUserFavorites() {
    this.favoritesService
      .getFavoritesByUser(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (favoritesIds) => {
          this.likedProductsIds = favoritesIds;
        },
        error: (err) => {
          console.error('Erro ao carregar favoritos', err);
        },
      });
  }

  loadCartItems() {
    this.cartService.getCartItems().subscribe({
      next: (cartItems) => {
        // Cria um dicionário: jewelId -> { cartItemId, quantity }
        this.cartItems = {};
        cartItems.forEach((item) => {
          this.cartItems[item.jewel._id] = {
            cartItemId: item._id,
            quantity: item.quantity,
          };
        });
      },
      error: (err) => {
        console.error('Erro ao carregar carrinho:', err);
      },
    });
  }

  toggleLike(productId: number) {
    const isLiked = this.likedProductsIds.includes(productId);

    if (isLiked) {
      this.favoritesService
        .removeFavorite(this.currentUserId, productId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.likedProductsIds = this.likedProductsIds.filter(
            (id) => id !== productId
          );
        });
    } else {
      this.favoritesService
        .addFavorite(this.currentUserId, productId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.likedProductsIds.push(productId);
        });
    }
  }

  addToCart(jewelId: string) {
    this.cartService.addToCart(jewelId, 1).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Produto adicionado ao carrinho',
          life: 2000,
        });
      },
      error: (err) => {
        console.error('Erro ao adicionar ao carrinho:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao adicionar no carrinho',
          life: 2000,
        });
      },
    });
  }

  toggleCart(productId: any) {
    if (this.cartItems[productId]) {
      // Já está no carrinho: remove
      delete this.cartItems[productId];
    } else {
      // Adiciona com quantidade 1
      this.cartItems[productId] = { cartItemId: '', quantity: 1 };

      this.addToCart(productId); // Chama a API real (opcional)
    }
  }
  increaseQuantity(productId: string) {
    const cartItem = this.cartItems[productId];
    if (cartItem) {
      const newQuantity = cartItem.quantity + 1;
      this.cartService
        .updateCartItemQuantity(cartItem.cartItemId, newQuantity)
        .subscribe({
          next: () => {
            cartItem.quantity = newQuantity; // atualiza na view
          },
          error: (err) => {
            console.error('Erro ao aumentar quantidade:', err);
          },
        });
    }
  }

  decreaseQuantity(productId: string) {
    const cartItem = this.cartItems[productId];
    if (cartItem) {
      const newQuantity = cartItem.quantity - 1;
      if (newQuantity <= 0) {
        // Remove item do carrinho
        this.cartService.removeFromCart(cartItem.cartItemId).subscribe({
          next: () => {
            delete this.cartItems[productId];
          },
          error: (err) => {
            console.error('Erro ao remover item:', err);
          },
        });
      } else {
        this.cartService
          .updateCartItemQuantity(cartItem.cartItemId, newQuantity)
          .subscribe({
            next: () => {
              cartItem.quantity = newQuantity; // atualiza na view
            },
            error: (err) => {
              console.error('Erro ao diminuir quantidade:', err);
            },
          });
      }
    }
  }
}
