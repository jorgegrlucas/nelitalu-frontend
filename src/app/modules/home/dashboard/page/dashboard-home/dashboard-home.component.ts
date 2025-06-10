import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { GetAllproductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponseInterface';
import { ProductsService } from 'src/app/services/products/products.service';
import { ProductsDataTransferService } from 'src/app/shared/services/products/products-data-transfer.service';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: [],
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  public productsList: Array<GetAllproductsResponse> = [];
  private destroy$ = new Subject<void>();

  public productChartDatas!: ChartData;
  public productCharOptions!: ChartOptions;

  constructor(
    private productService: ProductsService,
    private message: MessageService,
    private productsDtTransferService: ProductsDataTransferService
  ) {}

  ngOnInit(): void {
    this.getProductDatas();
  }

  getProductDatas() {
    this.productService
      .getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.productsList = response;
            this.productsDtTransferService.setProductsDatas(this.productsList);
            this.setProductsChartConfig();
          }
        },
        error: (err) => {
          this.message.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao buscar produtos',
            life: 1000,
          });
        },
      });
  }

  setProductsChartConfig(): void {
    if (this.productsList.length > 0) {
      const documentStyle = getComputedStyle(document.documentElement);
      // const textColor = documentStyle.getPropertyValue('--text-color');
      // const textColorSecondary = documentStyle.getPropertyValue(
      //   '--text-color-secondary'
      // );
      // const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

      const textColor = '#000';
      const textColorSecondary = '#000';
      const surfaceBorder = 'rgba(0,0,0,0.1)';

      this.productChartDatas = {
        labels: this.productsList.map((element) => element?.name),
        datasets: [
          {
            label: 'Quantidade',
            backgroundColor: documentStyle.getPropertyValue('--indigo-400'),
            borderColor: documentStyle.getPropertyValue('--indigo-400'),
            hoverBackgroundColor:
              documentStyle.getPropertyValue('--indigo-500'),
            data: this.productsList.map((element) => element?.amount),
          },
        ],
      };
      this.productCharOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
              font: {
                weight: 500,
              },
            },
            grid: {
              color: surfaceBorder,
            },
          },
          y: {
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
        },
      };
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
