import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../shared.module';
import { LoginComponent } from '../auth/login/login.component';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { By } from '@angular/platform-browser';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let router: Router;
  let authService: AuthService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([
        { path: "auth/login", component: LoginComponent }
      ]), SharedModule, HttpClientModule],
      declarations: [HeaderComponent]
    })
      .compileComponents().then(() => {
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        authService = TestBed.inject(AuthService);
      });;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset the user name in logout', fakeAsync(() => {
    component.userName = "userName";
    const routerNavigateSpy = spyOn(router, 'navigate').and.callFake(() => Promise.resolve(true));
    component.onLogout();
    flush();

    expect(component.userName).toBeNull();

    // check that the router is called
    expect(routerNavigateSpy).toHaveBeenCalledWith(["/auth/login"]);
  }));

  it('should call the authService logout method', fakeAsync(() => {
    const logoutSpy = spyOn(authService, 'logout').and.callFake(() => { });
    component.onLogout();
    flush();

    // check that the logout method is called
    expect(logoutSpy).toHaveBeenCalled();
  }));

  
  it('should toggle between displaying and hiding the menu', fakeAsync(() => {
    let menuIconEl = fixture.debugElement.query(By.css('.icon')).nativeElement;
    let menuEl = fixture.debugElement.query(By.css('#header-items')).nativeElement;
    menuEl.style.display = 'block';
    menuIconEl.dispatchEvent(new Event('click'));
    flush();

    expect(menuEl.style.display).toBe('none');

    menuIconEl.dispatchEvent(new Event('click'));
    flush();

    expect(menuEl.style.display).toBe('block');
  }));
});
