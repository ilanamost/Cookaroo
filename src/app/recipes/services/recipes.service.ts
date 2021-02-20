import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { environment } from "src/environments/environment";
import { map } from 'rxjs/operators';

import { Recipe } from "../models/recipe.model";
import { AuthService } from "src/app/auth/auth.service";
import { RECIPES } from "src/assets/data/recipes";

const BACKEND_URL = environment.apiUrl + "/recipes/";

@Injectable({ providedIn: "root" })
export class RecipesService {
  constructor(private http: HttpClient, private router: Router, private authService: AuthService) { }

  private recipes: Recipe[] = [];
  private recipesUpdated = new Subject<{ recipes: Recipe[]; recipesCount: number }>();

  /**
   * Get the recipes from the server
   * 
   * @param {number}            recipesPerPage        The amount of recipes that will be displayed in a page     
   * @param {number}            currentPage           The current page in the applications' pagination
   * @param {string}            searchedValue         The search value the user entered
   */
  public getRecipes(recipesPerPage: number, currentPage: number, searchedValue?: string) {
    // get the current user id
    const userId = this.authService.getUserId();

    // create the query parameters for the backend request
    let queryParams = (searchedValue) 
    // if there is a searched value add it to the parameters
    ? `?pagesize=${recipesPerPage}&page=${currentPage}&userId=${userId}&search=${searchedValue}` 
    : `?pagesize=${recipesPerPage}&page=${currentPage}&userId=${userId}`

    // send a get requset to the server with the given query parameters
    this.http
      .get<any>(BACKEND_URL + queryParams).pipe(
        map(recipesData => {
          return {
            // map the recipes data 
            // to include an 'id' parameter intead of an '_id' parameter
            recipes: recipesData.recipes.map((recipe) => {
              return {
                name: recipe.name,
                url: recipe.url,
                id: recipe._id,
                description: recipe.description,
                ingredients: recipe.ingredients,
                imagePath: recipe.imagePath,
                creator: recipe.creator
              };
            }),
            maxRecipes: recipesData.maxRecipes
          };
        })
      )
      // listen to the response from the backend
      .subscribe(transformedRecipiesData => {
        // save the mapped recipes data in the service
        this.recipes = transformedRecipiesData.recipes;

        // notify components about the recipes data change
        this.recipesUpdated.next({
          recipes: [...this.recipes],
          recipesCount: transformedRecipiesData.maxRecipes
        });
      }, error => {
        // in case of an error use 'null' as the subject value
        this.recipesUpdated.next(null);
      });
  }

  /**
   * Add new recipe to the server 
   * 
   * @param {string}            name                  The recipes' name
   * @param {string}            url                   The recipes' url
   * @param {string}            description           The recipes' description
   * @param {string}            ingredients           The recipes' ingredients
   * @param {string}            instructions          The recipes' instructions(optional)
   * @param {File}              image                 An image for the recipe(optional)
   */
  public addRecipe(name: string, 
            ingredients: string, 
            instructions?: string, 
            image?: File, 
            url?: string, 
            description?: string) {

    const recipeData = new FormData();
    this.createRecipeFormData(recipeData, name, ingredients, image, url, instructions, description);
   
    return this.http
      .post<{ message: string; recipe: Recipe }>(
        BACKEND_URL,
        recipeData
      )
  }

  /**
   * Update existing recipe in the server
   * 
   * @param {string}            id                    The recipe's id
   * @param {string}            name                  The recipes' name
   * @param {string}            url                   The recipes' url
   * @param {string}            description           The recipes' description
   * @param {string}            ingredients           The recipes' ingredients
   * @param {string}            instructions          The recipes' instructions(optional)
   * @param {File}              image                 An image for the recipe(optional)
   */
  public updateRecipe(id: string, 
               name: string, 
               ingredients: string, 
               instructions?: string, 
               image?: File | string, 
               url?: string, 
               description?: string) {

    let recipeData: Recipe | FormData;

    // if the image is a File object
    if (typeof image === "object") {
      // create a form data object to send to the server
      recipeData = new FormData();
      recipeData.append("id", id);
      this.createRecipeFormData(recipeData, name, ingredients, image, url, instructions, description);
      
    } else {
      // otherwise, send a regular object to the server
      recipeData = {
        id: id,
        name: name,
        url: url,
        description: description,
        ingredients: ingredients,
        instructions: instructions,
        imagePath: image,
        creator: null
      };
    }

    return this.http
      .put(BACKEND_URL + id, recipeData)
  }

  /**
   * Create the recipe's formData object for the server
   * 
   * @param {FormData}          recipeData            The form data instance
   * @param {string}            name                  The recipes' name
   * @param {string}            url                   The recipes' url
   * @param {string}            description           The recipes' description
   * @param {string}            ingredients           The recipes' ingredients
   * @param {string}            instructions          The recipes' instructions(optional)
   * @param {File}              image                 An image for the recipe(optional)
   */
  private createRecipeFormData(recipeData: FormData, 
                               name: string, 
                               ingredients: string, 
                               image?: File, 
                               url?: string, 
                               instructions?: string, 
                               description?: string) {

    recipeData.append("name", name);
    recipeData.append("ingredients", ingredients);
    if(image) recipeData.append("image", image, name);
    if(url) recipeData.append("url", url);
    if(instructions) recipeData.append("instructions", instructions);
    if(description) recipeData.append("description", description);
  }

  /**
   * Create an Observable out of the recipesUpdated Subject
   * And notify components about recipes update
   */
  public getRecipeUpdateListener() {
    return this.recipesUpdated.asObservable();
  }

  /**
   * Get a recipe from the server by its' id
   * 
   * @param {string}            recipeId              The given recipe id
   */
  public getRecipe(recipeId: string) {
    return this.http.get<{
      _id: string;
      name: string;
      url: string;
      description: string;
      ingredients: string;
      instructions: string;
      creator: string;
      imagePath: string;
    }>(BACKEND_URL + recipeId);
  }

  /**
   * Delete a recipe in the server by its' id
   * 
   * @param {string}            id                    The given recipe id                  
   */
  public deleteRecipe(id: string) {
    return this.http.delete(BACKEND_URL + id);
  }

  /**
   * Get all the recipes of the given user for testing 
   * 
   * @param {string}            userId                The given user id parameter
   */
  public getUserRecipesForTesting(userId: string) {
    const userRecipes = RECIPES.filter((recipe: Recipe) => {
      return recipe.creator === userId;
    });

    return userRecipes;
  }
}