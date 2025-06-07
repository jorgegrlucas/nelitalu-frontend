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

  addToCart(jewelId: number) {
    this.cartService.addToCart(jewelId).subscribe({
      next: () => {
        console.log('Produto adicionado ao carrinho!');
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Adicionado ao carrinho',
          life: 2500,
        });
      },
      error: (err) => {
        console.error('Erro ao adicionar ao carrinho:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao adicionar no carrinho',
          life: 2500,
        });
      },
    });
  }
}
