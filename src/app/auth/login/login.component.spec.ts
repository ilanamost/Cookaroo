import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from 'src/app/shared.module';
import { AuthService } from '../auth.service';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule.withRoutes([]), ReactiveFormsModule, SharedModule, HttpClientTestingModule ],
      declarations: [ LoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    component.isLoading = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call login method', fakeAsync (() => {
    let loginElement: DebugElement;
    const debugElement = fixture.debugElement;
    authService = debugElement.injector.get(AuthService);
    let loginSpy = spyOn(authService, 'login').and.callThrough();
    flush();

    // set form values
    loginElement = debugElement.query(By.css('form'));
    component.loginForm.controls['email'].setValue('testUser@test.com');
    component.loginForm.controls['password'].setValue('3nujFSat');
    loginElement.triggerEventHandler('ngSubmit', null);

    // check that service is called once
    expect(loginSpy).toHaveBeenCalledTimes(1); 
   }));

   it('should toggle the type of the password element between "password" and "text"', () => {
    const debugElement = fixture.debugElement;
    const id = 'password';
    let passwordEl = debugElement.query(By.css('#' + id)).nativeElement;
  
    component.showPassword(id, id);
    expect(passwordEl.type).toBe('text');

    component.showPassword(id, id);
    expect(passwordEl.type).toBe(id);
  });
});
