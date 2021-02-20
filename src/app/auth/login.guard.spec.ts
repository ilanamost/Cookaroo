import { TestBed, inject, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { LoginGuard } from './login.guard';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../shared.module';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RecipeEditComponent } from '../recipes/recipe-edit/recipe-edit.component';

describe('LoginGuard', () => {
  let authService: AuthService;
  let loginGuard: LoginGuard;
  let httpTestingController: HttpTestingController;
  let router: Router;
  let routeStateMock: RouterStateSnapshot;
  let routeMock: ActivatedRouteSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ 
      RouterTestingModule.withRoutes([
        { path: "auth/login", component: LoginComponent },  
        { path: "create", component: RecipeEditComponent }
      ]), 
      SharedModule, HttpClientTestingModule ]
    });
  });

  beforeEach(() => {
    authService = TestBed.inject(AuthService);
    loginGuard = TestBed.inject(LoginGuard);
    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    routeStateMock = jasmine.createSpyObj<RouterStateSnapshot>('RouterStateSnapshot', ['toString']);
    routeMock = jasmine.createSpyObj<ActivatedRouteSnapshot>('ActivatedRouteSnapshot', ['paramMap']);
  });

  it('should be created', inject([LoginGuard], (guard: LoginGuard) => {
    expect(guard).toBeTruthy();
  }));

  it('should allow the authenticated user to access the application routes', fakeAsync(() => {
    spyOn(authService, 'getIsAuth').and.returnValue(true);
    const routerNavigateSpy = spyOn(router, 'navigate').and.callFake(() => Promise.resolve(true));

    loginGuard.canActivate(routeMock, routeStateMock).then((res) => {
      expect(res).toBe(true);
    })

    flushMicrotasks();

    expect(routerNavigateSpy).not.toHaveBeenCalled();
  }));

  it('should redirect an unauthenticated user to the login route', fakeAsync(() => {
    spyOn(authService, 'getIsAuth').and.returnValue(false);
    const routerNavigateSpy = spyOn(router, 'navigate').and.callFake(() => Promise.resolve(true));
    loginGuard.canActivate(routeMock, routeStateMock);
    flushMicrotasks();

    expect(routerNavigateSpy).toHaveBeenCalledWith(['/auth/login']);
  }));
});
