import { GetAllproductsResponse } from './../../../../models/interfaces/products/response/GetAllProductsResponseInterface';
import { MessageService } from 'primeng/api';
import { FormBuilder, Validators } from '@angular/forms';
import { CategoriesService } from './../../../../services/categories/categories.service';
import { Subject, takeUntil } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getCategoriesResponse } from 'src/app/models/interfaces/categories/responses/getCategoriesResponse';
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
    category_id: ['', Validators.required],
    amount: [0, Validators.required],
  });

  public editProductForm = this.formBuilder.group({
    name: ['', Validators.required],
    price: ['', Validators.required],
    description: ['', Validators.required],
    amount: [0, Validators.required],
  });

  public categoriesDatas: Array<getCategoriesResponse> = [];
  public selectedCategory: Array<{ name: string; code: string }> = [];
  public productAction!: {
    event: EventAction;
    productDatas: Array<GetAllproductsResponse>;
  };
  public productSelectedDatas!: GetAllproductsResponse;
  public productDatas: Array<GetAllproductsResponse> = []
  public addProductAction = ProductEvent.ADD_PRODUCT_EVENT
  public editProductAction = ProductEvent.EDIT_PRODUCT_EVENT
  public saleProductAction = ProductEvent.SALE_PRODUCT_EVENT

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
            this.categoriesDatas = response;
          }
        },
      });
  }

  ngOnInit(): void {
    this.productAction = this.ref.data;
    if (this.productAction?.event?.action === this.editProductAction && this.productAction?.productDatas) {
      this.getProductSelectedDatas(this.productAction?.event?.id as string)
    }
    // if (this.productAction?.event?.action === this.saleProductAction) {
    //   this.getProductSelectedDatas(this.productAction?.event?.id as string)
    // }
    this.getAllCategories();
  }

  handleSubmitAddProduct(): void {
    if (this.addProductForm?.value && this.addProductForm?.valid) {
      const requestCreateProduct: CreateProductRequest = {
        name: this.addProductForm.value.name as string,
        price: this.addProductForm.value.price as string,
        description: this.addProductForm.value.description as string,
        category_id: this.addProductForm.value.category_id as string,
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
    if (this.editProductForm.value && this.editProductForm.valid && this.productAction.event.id) {
      const requestEditProduct: EditProductRequest = {
        name: this.editProductForm.value.name as string,
        price: this.editProductForm.value.price as string,
        description: this.editProductForm.value.description as string,
        product_id: this.productAction?.event?.id,
        amount: this.editProductForm.value.amount as number
      }
      this.productService.editProduct(requestEditProduct)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Produto editado com sucesso!',
            life: 2500
          })
          this.editProductForm.reset();
        }, error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro o editar produto!',
            life: 2500
          })
          this.editProductForm.reset();
        }

      })
    }
  }

  getProductSelectedDatas(productId: string): void {
    const allProducts = this.productAction.productDatas;
    if (allProducts.length > 0) {
      const productFiltered = allProducts.filter(
        (ele) => ele?.id === productId
      );
      if (productFiltered) {
        this.productSelectedDatas = productFiltered[0];

        this.editProductForm.setValue({
          name: this.productSelectedDatas.name,
          price: this.productSelectedDatas.price,
          amount: this.productSelectedDatas.amount,
          description: this.productSelectedDatas.description,
        });
      }
    }
  }

  getProductDatas(): void {
    this.productService.getAllProducts()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if (response.length > 0) {
          this.productDatas = response
          this.productDatas && this.productsDtService.setProductsDatas(this.productDatas)
        }
      }
    })
  }
}
