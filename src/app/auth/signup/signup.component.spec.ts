import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from 'src/app/shared.module';

import { SignupComponent } from './signup.component';
import { DebugElement } from '@angular/core';
import { AuthService } from '../auth.service';
import { By } from '@angular/platform-browser';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authService: AuthService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule.withRoutes([]), ReactiveFormsModule, SharedModule, HttpClientTestingModule],
      declarations: [ SignupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call signup method', fakeAsync (() => {
    let signupElement: DebugElement;
    const debugElement = fixture.debugElement;
    authService = debugElement.injector.get(AuthService);
    let signupSpy = spyOn(authService, 'createUser').and.callThrough();
    flush();

    // set form values
    signupElement = debugElement.query(By.css('form'));
    component.signupForm.controls['email'].setValue('testUser@test.com');
    component.signupForm.controls['password'].setValue('3nujFSat');
    component.signupForm.controls['passwordRetype'].setValue('3nujFSat');
    component.signupForm.controls['userName'].setValue('userName');
    signupElement.triggerEventHandler('ngSubmit', null);

    // check that service is called once
    expect(signupSpy).toHaveBeenCalledTimes(1); 
   }));
});
