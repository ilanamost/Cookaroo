import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean | UrlTree> {
    // if the user is authenticated
    if(this.authService.getIsAuth()) {
        // allow the user to access the route
        return new Promise(resolve => {
            resolve(true);
        });
    } else {
        // otherwise, navigate the user to the login page
        this.router.navigate(['/auth/login']);
    }
  }
}