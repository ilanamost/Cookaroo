import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { RecipeListComponent } from '../recipes/recipe-list/recipe-list.component';
import { LoginComponent } from "./login/login.component";
import { NUMBER_OF_MILISECONDS_IN_SECOND } from '../shared/classes/utils';

describe('AuthService', () => {
  let authService: AuthService;
  let httpTestingController: HttpTestingController;
  let router: Router;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [RouterTestingModule.withRoutes(
      [{ path: "", component: RecipeListComponent },
      { path: "auth/login", component: LoginComponent }]),
      HttpClientTestingModule]
  }));

  beforeEach(() => {
    authService = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    const service: AuthService = TestBed.inject<AuthService>(AuthService);
    expect(service).toBeTruthy();
  });

  it('should create user', () => {
    const email = "test@test.com";
    const password = "password";
    const userName = "userName";
    const routerNavigateByUrlSpy = spyOn(router, 'navigateByUrl').and.callFake(() => Promise.resolve(true));
    authService.createUser(email, password, userName);

    const req = httpTestingController.expectOne(`http://localhost:3000/api/user/signup`);

    expect(req.request.method).toEqual("POST");
    expect(req.request.body.email).toEqual(email);
    expect(req.request.body.password).toEqual(password);
    expect(req.request.body.userName).toEqual(userName);

    req.flush({ message: "User created!", result: { id: "testId", email: email, password: password, userName: userName } });

    expect(routerNavigateByUrlSpy).toHaveBeenCalled();
  });


  it('should login user', () => {
    const email = "test@test.com";
    const password = "password";
    authService.login(email, password);

    const req = httpTestingController.expectOne(`http://localhost:3000/api/user/login`);

    expect(req.request.method).toEqual("POST");
    expect(req.request.body.email).toEqual(email);
    expect(req.request.body.password).toEqual(password);

    req.flush({ token: 'testToken', expiresIn: 3600, userId: 'testId' });
  });

  it('should logout the user', fakeAsync(() => {
    const routerNavigateSpy = spyOn(router, 'navigate').and.callFake(() => Promise.resolve(true));
    localStorage.setItem('token', 'token');
    localStorage.setItem('expiration', 'expiration');
    localStorage.setItem('userId', 'userId');
    localStorage.setItem('userName', 'userName');

    authService.logout();
    flush();

    // check that the authentication data will be reset in the authService
    expect(authService.getIsAuth()).toBeFalse();
    expect(authService.getToken()).toBeFalsy();
    expect(authService.getUserId()).toBeFalsy();

    authService.getAuthStatusListener().subscribe((authenticationStatus: boolean) => {
      expect(authenticationStatus).toBeFalse();
    });

    // check that the local storage authentication keys will have no data in them
    expect(localStorage.getItem('token')).toBeFalsy();
    expect(localStorage.getItem('expiration')).toBeFalsy();
    expect(localStorage.getItem('userId')).toBeFalsy();
    expect(localStorage.getItem('userName')).toBeFalsy();

    // check that the router is called
    expect(routerNavigateSpy).toHaveBeenCalledWith(['/auth/login']);
  }));

  
  it('should authenticate the user if his authentication data is in the localStorage', () => {
    const now = new Date();
    const expiration = new Date(now.getTime() + 5000 * NUMBER_OF_MILISECONDS_IN_SECOND);
    const token = 'token';
    const userId = 'userId';
    const userName = 'userName';
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expiration.toISOString());
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', userName);

    authService.autoAuthUser();

    expect(authService.getIsAuth()).toBeTrue();
    expect(authService.getToken()).toEqual(token);
    expect(authService.getUserId()).toEqual(userId);
    expect(authService.getUserName()).toEqual(userName);

    authService.getAuthStatusListener().subscribe((authenticationStatus: boolean) => {
      expect(authenticationStatus).toBeTrue();
    });
  });
});
