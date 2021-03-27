import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { LOADER_TIMEOUT, Mode, URL_VALIDATOR, urlValidator, URL_LINK_CLASS } from 'src/app/shared/classes/utils';
import { RecipesService } from '../services/recipes.service';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.scss']
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  constructor(private recipeService: RecipesService, private route: ActivatedRoute, private authService: AuthService, private router: Router) { }
  public recipeForm: FormGroup;
  public isLoading = false;
  public imagePreview: string;
  public window: Window = window;
  private mode = Mode.CREATE;
  private recipeId: string;
  private authStatusSub: Subscription;
  @ViewChild('urlInput') urlInput: ElementRef;

  ngOnInit() {
    // Initialize the components' form
    this.initForm();

    // listen to the authentication status updates
    this.authStatusSub = this.authService.getAuthStatusListener()
      .subscribe(authStatus => {
        setTimeout(
          // hide the loader after getting the result 
          // and waiting for a given amount of time
          () => { this.isLoading = false; }
          , LOADER_TIMEOUT);
      });

    // listen to the route changes
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      // if the route parameters have the value of 'recipeId'
      if (paramMap.has("recipeId")) {
        // change the components' form mode to edit
        this.mode = Mode.EDIT;

        // get the current recipe id from the router parameters
        this.recipeId = paramMap.get("recipeId");

        // display a loader
        this.isLoading = true;

        // get the recipe data from the server according to its' id value
        this.recipeService.getRecipe(this.recipeId).subscribe(recipeData => {
          // hide the loader after getting the result 
          // and waiting for a given amount of time
          setTimeout(
            // hide the loader after getting the result 
            // and waiting for a given amount of time
            () => { this.isLoading = false; }
            , LOADER_TIMEOUT);

          // set the recipeForm control values
          // according to the values from the server
          this.recipeForm.setValue({
            name: recipeData.name,
            url: recipeData.url || null,
            description: recipeData.description || null,
            ingredients: recipeData.ingredients,
            instructions: recipeData.instructions || null,
            image: recipeData.imagePath || null
          });
        })
      }
    });
  }

  ngOnDestroy() {
    if(this.authStatusSub) this.authStatusSub.unsubscribe();
  }

  // form controls getters
  get name() { return this.recipeForm.get('name'); }
  get ingredients() { return this.recipeForm.get('ingredients'); }
  get url() { return this.recipeForm.get('url'); }

  /**
   * Initialize the components' form
   */
  private initForm() {
    this.recipeForm = new FormGroup({
      name: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(4)]
      }),
      description: new FormControl(null),
      url: new FormControl(null , {
        validators: [urlValidator(URL_VALIDATOR)]
      }),
      ingredients: new FormControl(null, {
        validators: [Validators.required],
      }),
      instructions: new FormControl(null),
      image: new FormControl(null, {
        asyncValidators: [mimeType]
      })
    });
  }

  /**
   * Handle the form submit
   */
  public onClickSubmit() {
    // if the recipeForm form has errors
    // return from the function
    if (this.recipeForm.invalid) {
      return;
    }

    // display the loader
    this.isLoading = true;

    // if the componnets' form mode is 'create'
    if (this.mode === Mode.CREATE) {
      // send a request to add a new recipe in the backend
      this.recipeService.addRecipe(
        this.recipeForm.value.name,
        this.recipeForm.value.ingredients,
        this.recipeForm.value.instructions || null,
        this.recipeForm.value.image || null,
        this.recipeForm.value.url || null,
        this.recipeForm.value.description || null
      ).subscribe(responseData => {
        this.router.navigate(["/"]);
        this.isLoading = false;
      }, error => {
        this.router.navigate(["/"]);
        this.isLoading = false;
      });
    } else {
      // send a request to update an existing recipe in the backend
      this.recipeService.updateRecipe(
        this.recipeId,
        this.recipeForm.value.name,
        this.recipeForm.value.ingredients,
        this.recipeForm.value.instructions || null,
        this.recipeForm.value.image || null,
        this.recipeForm.value.url || null,
        this.recipeForm.value.description || null,
      ).subscribe(response => {
        this.router.navigate(["/"]);
        this.isLoading = false;
      }, error => {
        this.router.navigate(["/"]);
        this.isLoading = false;
      });;
    }

    // reset the recipeForm
    this.recipeForm.reset();
  }

  /**
   * Handle change event when choosing image to upload
   * 
   * @param {Event}             event                 The change event data
   */
  public onImagePicked(event: Event) {
    // get the uploaded file data
    const file = (event.target as HTMLInputElement).files[0];

    // replace the image property value in the recipeForm
    this.recipeForm.patchValue({ image: file });

    // Recalculate the value and validation status of the image control
    this.recipeForm.get("image").updateValueAndValidity();

    const reader = new FileReader();

    // execute when the load event is fired
    reader.onload = () => {
      // get the image source
      this.imagePreview = reader.result as string;
    };

    // read the contents of the specified File
    reader.readAsDataURL(file);
  }

  /**
   * Toggle between a url link and an editable string
   * 
   * @param {Event}             event                 The key down enter event data
   */
  public toggleUrl(event: Event) {
    // stop the events' default behaviour
    event.preventDefault();

    // stop the events' prpagation
    event.stopPropagation();

    // add and remove the url style accordingly
    if(this.urlInput.nativeElement.classList.contains(URL_LINK_CLASS)) {
      this.urlInput.nativeElement.classList.remove(URL_LINK_CLASS);
    } else {
      this.urlInput.nativeElement.classList.add(URL_LINK_CLASS);
    }
  }

  /**
   * Navigate to the given url
   */
  public navigateToUrl() {
    // get the url controls' value
    const url = this.url.value;

    // if there is a value and a URL_LINK_CLASS in the inputs' class list
    if(url && this.urlInput.nativeElement.classList.contains(URL_LINK_CLASS)) {
      
      // navigate to the given url
      window.location.href = url;
    };  
  }
}
