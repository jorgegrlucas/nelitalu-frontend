import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CategoryEvent } from 'src/app/models/enums/products/categories/CategoryEvent';
import { DeleteCategoryAction } from 'src/app/models/interfaces/categories/responses/event/DeleteCategoryAction';
import { EditCategoryAction } from 'src/app/models/interfaces/categories/responses/event/EditCategoryAction';
import { GetCategoriesResponse } from 'src/app/models/interfaces/categories/responses/getCategoriesResponse';

@Component({
  selector: 'app-categories-table',
  templateUrl: './categories-table.component.html',
  styleUrls: []
})
export class CategoriesTableComponent {
  @Input() public categories: Array<GetCategoriesResponse> = []
  @Output() public categoryEvent = new EventEmitter<EditCategoryAction>()
  @Output() public deleteCategoryEvent = new EventEmitter<DeleteCategoryAction>()

  public categorySelected!: GetCategoriesResponse
  public addCategoryAction = CategoryEvent.ADD_CATEGORY_ACTION
  public editCategoryAction = CategoryEvent.EDIT_CATEGORY_ACTION

  handleDeleteCategoryEvent(category_id:string, categoryName: string) : void {
    if (category_id !== '' && categoryName !== '') {
      this.deleteCategoryEvent.emit({category_id, categoryName})
    }
  }
}
