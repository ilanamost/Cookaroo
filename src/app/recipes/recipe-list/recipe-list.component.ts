import { Component, OnInit, ViewChild } from '@angular/core';
import { RecipesService } from '../services/recipes.service';
import { Recipe } from '../models/recipe.model';
import { Subscription } from 'rxjs/internal/Subscription';
import swal from 'sweetalert2';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { LOADER_TIMEOUT, SPECIAL_CHAR_REGEX } from 'src/app/shared/classes/utils';

@Component({
  selector: 'recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})

export class RecipeListComponent implements OnInit {
  public recipes: Array<Recipe> = [];
  public recipesPerPage = 10;
  public totalRecipes = 0;
  public currentPage = 1;
  public pageSizeOptions = [1, 2, 5, 10];
  public isLoading = false;
  private recipesSub: Subscription;
  private filter: string = "";
  @ViewChild(MatPaginator, {static:false}) paginator: MatPaginator;

  constructor(private recipesService: RecipesService) { }

  /**
   *  Get the filter value
   */
  public getFilter() {
    return this.filter;
  }

  ngOnInit() {
    // display the loader
    this.isLoading = true;

    // get all the users' recipes from the server
    this.recipesService.getRecipes(this.recipesPerPage, this.currentPage, this.filter);

    // listen to the recipes status updates
    this.recipesSub = this.recipesService.getRecipeUpdateListener()
      .subscribe((recipesData: { recipes: Recipe[], recipesCount: number }) => {
        // if the response has data 
        if (recipesData) {
          // hide the loader after getting the result 
          // and waiting a given amount of time
          setTimeout(
            () => { this.isLoading = false; }
            , LOADER_TIMEOUT);

          // save the recipes received from the server
          this.recipes = recipesData.recipes;

          // save the total recipes number received from the server
          this.totalRecipes = recipesData.recipesCount;
        } else {
          // hide the loader
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy() {
    if (this.recipesSub) this.recipesSub.unsubscribe();
    this.filter = '';
  }

  /**
   * Perform operations when the user presses one of the pagination arrows
   * 
   * @param {PageEvent}         pageData              The page evant data
   */
  public onChangedPage(pageData: PageEvent) {
    // hide the loader
    this.isLoading = true;

    // set the pagination values
    this.currentPage = pageData.pageIndex + 1;
    this.recipesPerPage = pageData.pageSize;

    // get the recipes from the server
    this.recipesService.getRecipes(this.recipesPerPage, this.currentPage, this.filter);
  }

  /**
   * Perform operations when the user presses on the 'X' button
   * 
   * @param {Event}             event                 The click event data
   * @param {string}            id                    The chosen item's id
   */
  public deleteItem(event: Event, id: string) {
    event.stopPropagation();

    // display a popup modal message 
    // asking whether to delete the selected item
    swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this recipe!",
      backdrop: true,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      showClass: {
        popup: '',
        icon: ''
      },
      hideClass: {
        popup: '',
      },
    })
      .then((willDelete) => {
        // display the loader
        this.isLoading = true;

        // if the user chose to delete the given item
        if (willDelete.value) {
          // delete the recipe if the user confirmed
          this.onDeleteConfirm(id);
        } else {
          // cancel the recipe deletion
          this.onDeleteCancel();
        }
      });
  }

  /**
   * Delete the recipe if the user confirmed
   * 
   * @param {string}            id                    The given recipe id value
   */
  private onDeleteConfirm(id: string) {
    this.recipesService.deleteRecipe(id).subscribe(() => {
      // reset the current page values
      this.resetCurrentPage();

      this.recipesService.getRecipes(this.recipesPerPage, this.currentPage, this.filter);

      setTimeout(
        // hide the loader after getting the result 
        // and waiting for a given amount of time
        () => { this.isLoading = false; }
        , LOADER_TIMEOUT);
    });

    // display a popup modal message for the successfull delete operation
    swal.fire({
      text: "The selected recipe was deleted successfully!", showClass: {
        popup: '',
        icon: ''
      },
      hideClass: {
        popup: '',
      },
    });
  }

  /**
   * Handle the case that the user has canceled deletion
   */
  private onDeleteCancel() {
    // display a popup modal message for canceling the delete operation
    swal.fire({
      text: "Delete canceled!", showClass: {
        popup: '',
        icon: ''
      },
      hideClass: {
        popup: '',
      },
    });

    // hide the loader
    this.isLoading = false;
  }

  /**
   * Search for the types input and get paginated recipes result from the server
   * 
   * @param {Event}             event                 The input event data          
   */
  public serachValue(event: Event) {
    this.filter = (<HTMLInputElement>event.target).value;

    // add double slash before each special character 
    this.filter = this.filter.replace(SPECIAL_CHAR_REGEX, '\\$&');

    // reset the current page values
    this.resetCurrentPage();

    this.recipesService.getRecipes(this.recipesPerPage, this.currentPage, this.filter);
  }

  /**
   *  Reset the current page values
   */
  private resetCurrentPage() {
    // change the 'currentPage' value to display the recipes for the first page
    this.currentPage = 1;

    // reset the paginator: go to the first page index
    this.paginator.pageIndex = 0;
  }
}
