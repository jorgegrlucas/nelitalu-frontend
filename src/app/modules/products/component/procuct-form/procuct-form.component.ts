import { SaleProductRequest } from 'src/app/models/interfaces/products/request/SaleProductRequest';
import { GetAllproductsResponse } from './../../../../models/interfaces/products/response/GetAllProductsResponseInterface';
import { MessageService } from 'primeng/api';
import { FormBuilder, Validators } from '@angular/forms';
import { CategoriesService } from './../../../../services/categories/categories.service';
import { Subject, takeUntil } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GetCategoriesResponse } from 'src/app/models/interfaces/categories/responses/getCategoriesResponse';
import { CreateProductRequest } from 'src/app/models/interfaces/products/request/CreateProductRequest';
import { ProductsService } from 'src/app/services/products/products.service';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EventAction } from 'src/app/models/interfaces/products/event/eventAction';
import { ProductsDataTransferService } from 'src/app/shared/services/products/products-data-transfer.service';
import { ProductEvent } from 'src/app/models/enums/products/product.event';
import { EditProductRequest } from 'src/app/models/interfaces/products/request/EditProductRequest';

@Component({
  selector: 'app-procuct-form',
  templateUrl: './procuct-form.component.html',
  styleUrls: [],
})
export class ProcuctFormComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();

  public addProductForm = this.formBuilder.group({
    name: ['', Validators.required],
    price: [''],
    description: ['', Validators.required],
    // category_id: ['', Validators.required],
    amount: [0, Validators.required],
  });

  public editProductForm = this.formBuilder.group({
    name: ['', Validators.required],
    price: ['', Validators.required],
    description: ['', Validators.required],
    amount: [0, Validators.required],
    // category_id: ['', Validators.required],
  });

  public saleProductForm = this.formBuilder.group({
    amount: [0, Validators.required],
    product_id: ['', Validators.required],
  });

  public categoriesDatas: Array<GetCategoriesResponse> = [];
  public selectedCategory: Array<{ name: string; code: string }> = [];
  public productAction!: {
    event: EventAction;
    productDatas: Array<GetAllproductsResponse>;
  };
  public productSelectedDatas!: GetAllproductsResponse;
  public productDatas: Array<GetAllproductsResponse> = [];
  public saleProductSelected!: GetAllproductsResponse;
  public addProductAction = ProductEvent.ADD_PRODUCT_EVENT;
  public editProductAction = ProductEvent.EDIT_PRODUCT_EVENT;
  public saleProductAction = ProductEvent.SALE_PRODUCT_EVENT;
  public renderDropdown = false;

  constructor(
    private categoriesService: CategoriesService,
    private productService: ProductsService,
    private messageService: MessageService,
    private productsDtService: ProductsDataTransferService,
    private formBuilder: FormBuilder,
    private router: Router,
    public ref: DynamicDialogConfig
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  getAllCategories() {
    this.categoriesService
      .getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            if (
              this.productAction?.event?.action === this.editProductAction &&
              this.productAction?.productDatas
            ) {
              this.getProductSelectedDatas(
                this.productAction?.event?.id as string
              );
            }
            this.categoriesDatas = response;
          }
        },
      });
  }

  ngOnInit(): void {
    console.log('==== DATA do modal: ====');
    console.log(this.ref.data);
    this.productAction = this.ref.data;

    if (
      (!this.productAction.productDatas ||
        this.productAction.productDatas.length === 0) &&
      this.ref.data.event.action != 'Vender produto'
    ) {
      console.log('chamou');
      // Se vier vazio, faz uma chamada
      this.productService
        .getAllProducts()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (products) => {
            this.productAction.productDatas = products;
            this.getProductSelectedDatas(this.productAction.event.id as string);
          },
        });
    } else if (
      this.productAction.event?.action === 'EDIT_PRODUCT' &&
      this.productAction.event?.id &&
      this.ref.data.event.action != 'Vender produto'
    ) {
      console.log('else if');
      this.getProductSelectedDatas(this.productAction.event.id);
    }

    console.log('AQUI, ', this.ref);

    if (
      (this.productAction.event?.action === 'EDIT_PRODUCT' ||
        this.productAction.event?.action == 'Editar produto') &&
      this.productAction.event?.id &&
      this.ref.data.event.action != 'Vender produto'
    ) {
      console.log('this.ref.data.productDatas, ', this.ref.data.productDatas);
      const productFiltered = this.ref.data.productDatas.find(
        (ele: any) => String(ele?._id) === String(this.productAction.event.id)
      );
      this.editProductForm.setValue({
        name: productFiltered.name,
        price: productFiltered.price,
        amount: productFiltered.amount,
        description: productFiltered.description,
      });
    }

    if (this.ref.data.event.action == 'Vender produto') {
      this.getProductDatas();
    }
    this.renderDropdown = true;
  }

  handleSubmitAddProduct(): void {
    if (this.addProductForm?.value && this.addProductForm?.valid) {
      const requestCreateProduct: CreateProductRequest = {
        name: this.addProductForm.value.name as string,
        price: this.addProductForm.value.price as string,
        description: this.addProductForm.value.description as string,
        // category_id: this.addProductForm.value.category_id as string,
        amount: Number(this.addProductForm.value.amount),
      };
      this.productService
        .createProduct(requestCreateProduct)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Produto criado com sucesso',
                life: 2500,
              });
            }
          },
          error: (err) => {
            console.log(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Erro ao criar produto',
              life: 2500,
            });
          },
        });
    }
    this.addProductForm.reset();
  }

  handleSubmitEditProduct(): void {
    if (
      this.editProductForm.value &&
      this.editProductForm.valid &&
      this.productAction.event.id
    ) {
      const requestEditProduct: EditProductRequest = {
        name: this.editProductForm.value.name as string,
        price: this.editProductForm.value.price as string,
        description: this.editProductForm.value.description as string,
        product_id: this.productAction?.event?.id,
        amount: this.editProductForm.value.amount as number,
        // category_id: this.editProductForm.value.category_id as string,
      };
      this.productService
        .editProduct(requestEditProduct)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Produto editado com sucesso!',
              life: 2500,
            });
            this.editProductForm.reset();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro o editar produto!',
              life: 2500,
            });
            this.editProductForm.reset();
          },
        });
    }
  }

  handleSubmitSaleProduct(): void {
    if (this.saleProductForm.valid) {
      // Pega o rawValue e converte para number, garantindo never null/undefined
      const rawAmount = this.saleProductForm.value.amount;
      const amountNumber = rawAmount != null ? Number(rawAmount) : 0;

      const requestDatas: SaleProductRequest = {
        amount: amountNumber,
        product_id: this.saleProductForm.value.product_id as string,
      };

      this.productService
        .saleProduct(requestDatas)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Venda efetuada!`,
              life: 2500,
            });
            this.getProductDatas();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: err.error?.message || 'Não foi possível efetuar venda',
              life: 2500,
            });
          },
        });
    }
  }

  getProductSelectedDatas(productId: string): void {
    const allProducts = this.productAction.productDatas;
    if (allProducts.length > 0) {
      const productFiltered = allProducts.find(
        (ele) => String(ele?._id) === String(productId)
      );
      console.log('filtered: ', productFiltered);
      if (productFiltered) {
        this.productSelectedDatas = productFiltered;
        console.log('Setou os valores');
        this.editProductForm.setValue({
          name: productFiltered.name,
          price: productFiltered.price,
          amount: productFiltered.amount,
          description: productFiltered.description,
        });
      }
    }
  }

  getProductDatas(): void {
    this.productService
      .getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.productDatas = response;
            this.productDatas &&
              this.productsDtService.setProductsDatas(this.productDatas);
          }
        },
      });
  }
}
