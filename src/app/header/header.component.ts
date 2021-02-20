import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { toggleMenu, checkIfViewMobile } from 'src/app/shared/classes/utils';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  public userIsAuthenticated = false;
  public userName: string;
  public viewMobile: boolean = true;
  public toggleMenu = toggleMenu;
  private authListenerSubs: Subscription;
  
  constructor(public authService: AuthService) {
    // if the window's width is less than the desktop width, switch to mobile view
    this.viewMobile = checkIfViewMobile();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    // if the window's width is less than the desktop width, switch to mobile view
    this.viewMobile = checkIfViewMobile();
  }

  ngOnInit() {
    // check if the user is authenticated
    this.userIsAuthenticated = this.authService.getIsAuth();

    // get the user name
    this.userName = this.authService.getUserName();

    // listen to the authentication status updates
    this.authListenerSubs = this.authService.getAuthStatusListener()
    .subscribe(isAuthenticated => {
       // save the user status 
       // for displaying and hiding the relevant links in the template
       this.userIsAuthenticated = isAuthenticated;

       // if the user is authenticated
       if(this.userIsAuthenticated) {

        //get the user name
        this.userName = this.authService.getUserName();
       }
    });
  }

  ngOnDestroy() {
    if(this.authListenerSubs) this.authListenerSubs.unsubscribe();
  }

  /**
   * Handle user logout
   */
  onLogout() {
    // reset the userName value
    this.userName = null;

    // reset other values in the authService
    this.authService.logout();
  }
}