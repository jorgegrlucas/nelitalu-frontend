import { ProductsDataTransferService } from './../../../../shared/services/products/products-data-transfer.service';
import { ProductsService } from 'src/app/services/products/products.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { GetAllproductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponseInterface';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EventAction } from 'src/app/models/interfaces/products/event/eventAction';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { ProcuctFormComponent } from '../../component/procuct-form/procuct-form.component';

@Component({
  selector: 'app-products-home',
  templateUrl: './products-home.component.html',
  styleUrls: [],
})
export class ProductsHomeComponent implements OnDestroy, OnInit {
  private readonly destroy$: Subject<void> = new Subject();
  public productDatas: Array<GetAllproductsResponse> = [];
  private ref!: DynamicDialogRef;

  constructor(
    private productsService: ProductsService,
    private productsDataTransferService: ProductsDataTransferService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService
  ) {}
  ngOnInit(): void {
    this.getServiceProductdDatas();
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

  handleProductAction(event: EventAction): void {
    if (event) {
      this.ref = this.dialogService.open(ProcuctFormComponent, {
        header: event?.action,
        width: '70%',
        contentStyle: { overflow: 'auto' },
        baseZIndex: 10000,
        maximizable: true,
        data: {
          event: event,
          productDatas: this.productDatas,
        },
      });
      this.ref.onClose.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => this.getAPIProductsData(),
      });
    }
  }

  private openProductModal(event: EventAction): void {
    this.ref = this.dialogService.open(ProcuctFormComponent, {
      header: event?.action,
      width: '70%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      data: {
        event: event,
        productDatas: this.productDatas,
      },
    });
    this.ref.onClose.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.getAPIProductsData(),
    });
  }

  handleDeleteProductAction(evento: {
    productId: string;
    productName: string;
  }): void {
    if (evento) {
      this.confirmationService.confirm({
        message: `Confirma a exclusão do produto: ${evento?.productName}?`,
        header: 'Confirmação de exclusão',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sim',
        rejectLabel: 'Não',
        accept: () => this.deleteProduct(evento?.productId),
      });
    }
  }

  deleteProduct(productId: string) {
    if (productId) {
      this.productsService
        .deleteProduct(productId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            if (res) {
              this.messageService.add({
                severity: 'sucess',
                summary: 'Successo',
                detail: 'Removido com sucesso',
                life: 2000,
              });
              this.getAPIProductsData();
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Erro ao remover o produto',
              life: 2000,
            });
          },
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
