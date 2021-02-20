import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';
import { RecipeEditComponent } from './recipe-edit.component';
import { RouterTestingModule } from '@angular/router/testing'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { mockFile, Mode, URL_LINK_CLASS } from 'src/app/shared/classes/utils';
import { RecipesService } from '../services/recipes.service';
import { of, throwError } from 'rxjs';
import { RecipeListComponent } from '../recipe-list/recipe-list.component';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('RecipeEditComponent', () => {
  let component: RecipeEditComponent;
  let fixture: ComponentFixture<RecipeEditComponent>;
  let recipesService: RecipesService;
  let router: Router;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: "", component: RecipeListComponent }]),
        ReactiveFormsModule,
        SharedModule,
        HttpClientTestingModule],
      declarations: [RecipeEditComponent]
    })
      .compileComponents().then(() => {
        fixture = TestBed.createComponent(RecipeEditComponent);
        component = fixture.componentInstance;
        recipesService = TestBed.inject(RecipesService);
        router = TestBed.inject(Router);
      });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeEditComponent);
    component = fixture.componentInstance;
    component.isLoading = false;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.isLoading = false;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('if the mode is "CREATE", should call addRecipe method', fakeAsync(() => {
    component['mode'] = Mode.CREATE;
    component.recipeForm = new FormGroup({});
    const addRecipeSpy = spyOn(recipesService, 'addRecipe').and.callFake(() => of({ message: '', recipe: null }));
    const routerNavigateSpy = spyOn(router, 'navigate').and.callFake(() => Promise.resolve(true));
    component.onClickSubmit();
    flush();

    // check that service is called once
    expect(addRecipeSpy).toHaveBeenCalledTimes(1);

    // check that the router is called
    expect(routerNavigateSpy).toHaveBeenCalled();
  }));

  it('if the mode is "UPDATE", should call updateRecipe method', fakeAsync(() => {
    component['mode'] = Mode.EDIT;
    component.recipeForm = new FormGroup({});
    const updateRecipeSpy = spyOn(recipesService, 'updateRecipe').and.callFake(() => of({ message: '', recipe: null }));
    const routerNavigateSpy = spyOn(router, 'navigate').and.callFake(() => Promise.resolve(true));
    component.onClickSubmit();
    flush();

    // check that service is called once
    expect(updateRecipeSpy).toHaveBeenCalledTimes(1);

    // check that the router is called
    expect(routerNavigateSpy).toHaveBeenCalled();
  }));

  it('if the mode is "CREATE", should navigate to recipeList component in case of an error', fakeAsync(() => {
    component['mode'] = Mode.CREATE;
    component.recipeForm = new FormGroup({});
    const addRecipeSpy = spyOn(recipesService, 'addRecipe').and.callFake(() => throwError({ error: { title: 'title', status: 404 } }));
    const routerNavigateSpy = spyOn(router, 'navigate').and.callFake(() => Promise.resolve(true));
    component.onClickSubmit();
    flush();

    // check that service is called once
    expect(addRecipeSpy).toHaveBeenCalledTimes(1);

    // check that the router is called with the recipes list route
    expect(routerNavigateSpy).toHaveBeenCalledWith(['/']);
  }));

  it('if the mode is "UPDATE", should navigate to recipeList component in case of an error', fakeAsync(() => {
    component['mode'] = Mode.EDIT;
    component.recipeForm = new FormGroup({});
    const updateRecipeSpy = spyOn(recipesService, 'updateRecipe').and.callFake(() => throwError({ error: { title: 'title', status: 404 } }));
    const routerNavigateSpy = spyOn(router, 'navigate').and.callFake(() => Promise.resolve(true));
    component.onClickSubmit();
    flush();

    // check that service is called once
    expect(updateRecipeSpy).toHaveBeenCalledTimes(1);

    // check that the router is called with the recipes list route
    expect(routerNavigateSpy).toHaveBeenCalledWith(['/']);
  }));

  it('should remove "url-link" class if it exists in urlInput element classList, and add it if it doesn\'t exist', (() => {
    component.toggleUrl(new Event("keydown.enter"));

    // in the first function call the URL_LINK_CLASS class should be added
    expect(component.urlInput.nativeElement.classList.contains(URL_LINK_CLASS)).toBeTruthy();

    component.toggleUrl(new Event("keydown.enter"));

    // in the first function call the URL_LINK_CLASS class should be removed
    expect(component.urlInput.nativeElement.classList.contains(URL_LINK_CLASS)).toBeFalsy();
  }));

  it('should set the href', () => {
    var currentUrl = window.location.href;
    const testUrl = "#test";
    component.url.setValue(currentUrl + testUrl);
    component.urlInput.nativeElement.classList.add("url-link");
    component.navigateToUrl();

    // check if the href value has changed to the 'url' control value
    expect(window.location.href).toBe(currentUrl + testUrl);
  });

  it('should not call add recipe if the form is invalid', fakeAsync(() => {
    component['mode'] = Mode.CREATE;
    component.recipeForm = new FormGroup({});
    component.recipeForm.controls = { name: new FormControl() };

    // set one of the required controls as touched, so that the form will be invalid
    component.recipeForm.controls['name'].markAsTouched();

    const addRecipeSpy = spyOn(recipesService, 'addRecipe').and.callFake(() => of({ message: '', recipe: null }));
    component.ngOnInit();
    flush();

    component.onClickSubmit();
    flush();

    // check that service is not called
    expect(addRecipeSpy).not.toHaveBeenCalled();
  }));

  it('should not call update recipe if the form is invalid', fakeAsync(() => {
    component['mode'] = Mode.EDIT;
    component.recipeForm = new FormGroup({});
    component.recipeForm.controls = { name: new FormControl() };

    // set one of the required controls as touched, so that the form will be invalid
    component.recipeForm.controls['name'].markAsTouched();

    const updateRecipeSpy = spyOn(recipesService, 'updateRecipe').and.callFake(() => of({ message: '', recipe: null }));
    component.ngOnInit();
    flush();

    component.onClickSubmit();
    flush();

    // check that service is not called
    expect(updateRecipeSpy).not.toHaveBeenCalled();
  }));

  it('should call onImagePicked function on file change event', fakeAsync(() => {
    let input = fixture.debugElement.query(By.css('input[type=file]')).nativeElement;
    const imagePickedSpy = spyOn(component, 'onImagePicked');
    input.dispatchEvent(new Event('change'));
    flush();
    expect(imagePickedSpy).toHaveBeenCalled();
  }));


  it('should get controls values', () => {
    expect(component.name).toEqual(component.recipeForm.get('name'));
    expect(component.ingredients).toEqual(component.recipeForm.get('ingredients'));
    expect(component.url).toEqual(component.recipeForm.get('url'));
  });

  it("should update the image value in the form after upload", fakeAsync(() => {
    const testFile = mockFile({size:50000, type: 'image/png'});

    let event = new Event('change');

    Object.defineProperty(event, 'target', { writable: false, value: { files: [] } });
    (event.target as HTMLInputElement).files[0] = testFile;
    component.onImagePicked(event as Event);
    flush();

    expect(component.recipeForm.get("image").value).toEqual(testFile);
  }));
});
