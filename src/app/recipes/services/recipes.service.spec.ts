import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from 'src/app/auth/auth.service';
import { SharedModule } from 'src/app/shared.module';
import { Recipe } from '../models/recipe.model';

import { RecipesService } from './recipes.service';

describe('RecipesService', () => {
  let recipesService: RecipesService;
  let authService: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(waitForAsync(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([]), SharedModule, HttpClientTestingModule],
      providers: [RecipesService]
    })
  ));

  beforeEach(() => {
    recipesService = TestBed.inject(RecipesService);
    authService = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    const service: RecipesService = TestBed.inject(RecipesService);
    expect(service).toBeTruthy();
  });

  it('should retrieve all the user\'s recipes', () => {
    const pagesize = 10;
    const pageNmber = 1;
    let userId = "1";
    authService['userId'] = userId;
    const userRecipes = recipesService.getUserRecipesForTesting(userId);

    recipesService.getRecipes(pagesize, pageNmber);
    const req = httpTestingController.expectOne(`http://localhost:3000/api/recipes/?pagesize=${pagesize}&page=${pageNmber}&userId=${userId}`);

    expect(req.request.method).toEqual("GET");

    recipesService.getRecipeUpdateListener().subscribe((recipesData) => {
      expect(recipesData.recipes.length).toBe(userRecipes.length, "incorrect number of recipes");
    });

    req.flush({
      message: "Recipes fetched successfully!",
      recipes: userRecipes,
      maxRecipes: userRecipes.length
    })
  });

  it('should find a recipe by id', () => {
    const recipeId = "1";
    let userId = "1";
    const userRecipes = recipesService.getUserRecipesForTesting(userId);

    recipesService.getRecipe(recipeId)
      .subscribe(recipe => {
        expect(recipe).toBeTruthy();
        expect(recipe['id']).toBe("1");
      });

    const req = httpTestingController.expectOne(`http://localhost:3000/api/recipes/${recipeId}`);
    expect(req.request.method).toEqual("GET");

    req.flush(userRecipes.find((recipe) => recipe.id === recipeId));
  });

  it('should save the recipe data', () => {
    const recipeId = "1";
    const name = "test recipe";
    const ingredients = "test ingredients";
    let userId = "1";
    const userRecipes = recipesService.getUserRecipesForTesting(userId);

    recipesService.updateRecipe(recipeId, name, ingredients)
      .subscribe((res: { message: string }) => {
        expect(res.message).toBe("Update successful!");
      });

    const req = httpTestingController.expectOne(`http://localhost:3000/api/recipes/${recipeId}`);

    expect(req.request.method).toEqual("PUT");

    const recipeIdx = userRecipes.findIndex((recipe) => recipe.id === recipeId);

    if (recipeIdx !== -1) {
      expect(req.request.body.name).toEqual(name);
      expect(req.request.body.ingredients).toEqual(ingredients);
    }

    req.flush({ message: "Update successful!" });
  });

  it('should give an error if save recipe fails', () => {
    const recipeId = "1";
    const name = "test recipe";
    const ingredients = "test ingredients";

    recipesService.updateRecipe(recipeId, name, ingredients)
      .subscribe(
        () => fail("Couldn\'t update recipe!"),

        (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
        }
      );

    const req = httpTestingController.expectOne(`http://localhost:3000/api/recipes/${recipeId}`);

    expect(req.request.method).toEqual("PUT");

    req.flush("Couldn\'t update recipe!", { status: 500, statusText: 'Internal Server Error' });
  });

  it('should add a new recipe', () => {
    const name = "test recipe";
    const ingredients = "test ingredients";

    recipesService.addRecipe(name, ingredients)
    .subscribe((res: { message: string, recipe: Recipe }) => {
      expect(res.message).toBe("Recipe added successfully");
      expect(res.recipe.name).toBe("test recipe");
      expect(res.recipe.ingredients).toBe("test ingredients");
    });
    
    const req = httpTestingController.expectOne(`http://localhost:3000/api/recipes/`);

    expect(req.request.method).toEqual("POST");

    req.flush({message: "Recipe added successfully", recipe: { id: "testId", name: name, ingredients: ingredients }});
  });

  
  it('should delete recipe', () => {
    const recipeId = "1";
    recipesService.deleteRecipe(recipeId)
    .subscribe((res: { message: string }) => {
      expect(res.message).toBe("Deletion successful!");
    });;

    const req = httpTestingController.expectOne(`http://localhost:3000/api/recipes/${recipeId}`);

    expect(req.request.method).toEqual("DELETE");

    req.flush({ message: "Deletion successful!" });
  });
});
