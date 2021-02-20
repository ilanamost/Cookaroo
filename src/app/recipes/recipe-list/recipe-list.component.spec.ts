import { ComponentFixture, fakeAsync, flush, flushMicrotasks, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from 'src/app/shared.module';
import { RecipeListComponent } from './recipe-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RecipesService } from '../services/recipes.service';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { of } from 'rxjs';

describe('RecipeListComponent', () => {
  let component: RecipeListComponent;
  let fixture: ComponentFixture<RecipeListComponent>;
  let recipesService: RecipesService;
  let userId = "1";

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        ReactiveFormsModule,
        SharedModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        MatPaginatorModule],
      declarations: [RecipeListComponent]
    })
      .compileComponents().then(() => {
        fixture = TestBed.createComponent(RecipeListComponent);
        component = fixture.componentInstance;
        recipesService = TestBed.inject(RecipesService);
      });;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeListComponent);
    component = fixture.componentInstance;
    component.isLoading = false;
    const userRecipes = recipesService.getUserRecipesForTesting(userId);
    component.recipes = userRecipes;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.isLoading = false;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the recipes list', () => {
    const elements = fixture.debugElement.queryAll(By.css(".item"));

    expect(elements).toBeTruthy("Could not find recipes");
    expect(elements.length).toEqual(component.recipes.length);
  });


  it('should display the first recipe', () => {
    const recipe = component.recipes[0];

    const recipeEl = fixture.debugElement.query(By.css(".item:first-child"));
    const title = recipeEl.query(By.css(".content"));
    const image = recipeEl.query(By.css(".image"));

    expect(recipeEl).toBeTruthy("Could not find recipe element in the DOM");
    expect(title.nativeElement.textContent.trim()).toBe(recipe.name.trim());

    if (recipe.imagePath) {
      expect(image.nativeElement.src).toBe(recipe.imagePath);
    }
  });

  it('should display no recipes if there are no recipes', () => {
    const userRecipes = [];
    component.recipes = userRecipes;
    fixture.detectChanges();

    const elements = fixture.debugElement.queryAll(By.css(".item"));

    expect(elements.length).toEqual(0);
  })

  it('should display swal if the if the user selects a recipe for deletion', () => {
    const recipeId = "1";
    component.deleteItem(new Event("click"), recipeId);
    expect(Swal.isVisible()).toBeTruthy();
    expect(Swal.getTitle().textContent).toEqual('Are you sure?');
  })

  it('should call deleteRecipe and getRecipes methods if the user confirms deletion', fakeAsync(() => {
    let deleteRecipeSpy = spyOn(recipesService, 'deleteRecipe').and.callFake(() => of({}));
    let getRecipesSpy = spyOn(recipesService, 'getRecipes').and.callFake(() => { });
    const recipeId = "1";
    component.deleteItem(new Event("click"), recipeId);
    Swal.clickConfirm();

    flushMicrotasks();
    flush();

    expect(deleteRecipeSpy).toHaveBeenCalledTimes(1);
    expect(getRecipesSpy).toHaveBeenCalledTimes(1);
    expect(component.isLoading).toBeFalse();
  }));

  it('should NOT call the server to delete the selected recipe if the user cancels', fakeAsync(() => {
    let deleteRecipeSpy = spyOn(recipesService, 'deleteRecipe').and.callFake(() => of({}));
    let getRecipesSpy = spyOn(recipesService, 'getRecipes').and.callFake(() => { });
    const recipeId = "1";
    component.deleteItem(new Event("click"), recipeId);
    Swal.clickCancel();
    flushMicrotasks();
    flush();

    expect(deleteRecipeSpy).toHaveBeenCalledTimes(0);
    expect(getRecipesSpy).toHaveBeenCalledTimes(0);
  }));

  it('should set currentPage and recipesPerPage values and get all the recipes according to these parameters', () => {
    const pageData = new PageEvent();
    pageData.pageIndex = 1;
    pageData.pageSize = 2;
    let getRecipesSpy = spyOn(recipesService, 'getRecipes').and.callFake(() => { });
    component.onChangedPage(pageData);

    expect(component.isLoading).toEqual(true);
    expect(component.currentPage).toEqual(pageData.pageIndex + 1);
    expect(component.recipesPerPage).toEqual(pageData.pageSize);
    expect(getRecipesSpy).toHaveBeenCalledWith(component.recipesPerPage, component.currentPage, component.getFilter());
  });

  it('should set the filter value and get the recipes', () => {
    let inputEvent = new Event("input");
    Object.defineProperty(inputEvent, 'target', { writable: false, value: 'search value' });
    let getRecipesSpy = spyOn(recipesService, 'getRecipes').and.callFake(() => { });
    component.serachValue(inputEvent);

    expect(component.getFilter()).toEqual((<HTMLInputElement>inputEvent.target).value);
    expect(getRecipesSpy).toHaveBeenCalledWith(component.recipesPerPage, component.currentPage, component.getFilter());
  });


  it('should change component properties values after getting the recipes in ngOnInit', fakeAsync(() => {
    const res = {
      recipes: [{
        id: "1",
        name: "test name",
        ingredients: "test ingredients",
        url: "test url",
        imagePath: "test image",
        description: "test description",
        creator: "1"
      }],
      recipesCount: 0
    };

    let getRecipeUpdateListenerSpy = spyOn(recipesService, 'getRecipeUpdateListener').and.callFake(() => of(res));

    component.ngOnInit();
    flush();

    expect(getRecipeUpdateListenerSpy).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();

    if (res) {
      expect(component.recipes).toEqual(res.recipes);
      expect(component.totalRecipes).toEqual(res.recipesCount);
    }
  }));
});
