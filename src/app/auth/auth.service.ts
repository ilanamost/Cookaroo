import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { AuthData } from "./models/auth-data.model";
import { Subject } from "rxjs";
import { Router } from "@angular/router";

import { environment } from "../../environments/environment";
import { NUMBER_OF_MILISECONDS_IN_SECOND } from "../shared/classes/utils";

const BACKEND_URL = environment.apiUrl + "/user/";

@Injectable({ providedIn: "root" })
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private userId: string;
  private userName: string;
  private authStatusListener = new Subject<boolean>();
  constructor(private http: HttpClient, private router: Router) { }

  // Getters //
  getToken() {
    return this.token;
  }

  /**
   * Get authentication status
   */
  getIsAuth() {
    return this.isAuthenticated;
  }

  /**
  * Create an Observable out of the authStatusListener Subject
  * And notify components about user authentication update
  */
  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getUserId() {
    return this.userId;
  }

  getUserName() {
    return this.userName;
  }

  /**
   * Create a new user in the server
   * 
   * @param {string}            email                 The users' email
   * @param {string}            password              The users' password
   * @param {string}            userName              The users' user name
   */
  createUser(email: string, password: string, userName: string) {
    const authData: AuthData = { email: email, password: password, userName: userName };

    // create a post request with the user's authentication data
    this.http.post(BACKEND_URL + "signup", authData)
      .subscribe(response => {
        this.router.navigateByUrl('/');
      }, (error) => {

        // notify components that the user is not authenticated
        this.authStatusListener.next(false);
      });
  }

  /**
 * Login the user in the server
 * 
 * @param {string}            email                 The users' email
 * @param {string}            password              The users' password
 */
  async login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };

    try {
      const response = await this.http.post
        <{ token: string, expiresIn: number, userId: string }>(BACKEND_URL + "login", authData).toPromise();

      // save the response token
      const token = response.token;
      this.token = response.token;

      // if there is a token in the response
      if (token) {
        // get the token's expiration date
        const expiresInDuration = response.expiresIn;

        // Create a timer for the token validity
        this.setAuthTimer(expiresInDuration);

        // set the user status as authenticated
        this.isAuthenticated = true;

        // save the user id in the service
        this.userId = response.userId;

        const now = new Date();

        // calculate the time that remains between now and the token's expiration date
        const expirationDate = new Date(now.getTime() + expiresInDuration * NUMBER_OF_MILISECONDS_IN_SECOND);

        try {
          // get the users' data according to his id
          const userData = await this.getUserData(this.userId).toPromise();

          // save the authentication data in the localStorage
          this.saveAuthData(token, expirationDate, this.userId, userData.userName);

          // save the user name in the service
          this.userName = userData.userName;
        } catch (error) {
          // Save the authentication data in the localStorage without the user name
          this.saveAuthData(token, expirationDate, this.userId);
        }

        // notify components that the user is authenticated
        this.authStatusListener.next(true);

        // navigate to the home page
        this.router.navigate(['/']);
      }
    } catch (error) {
      // notify components that the user is not authenticated
      this.authStatusListener.next(false);
    }
  }

  /**
   * Automatically authenticate the user if he has a valid token
   */
  public autoAuthUser() {
    // Get the current users' authentication data
    const authInformation = this.getAuthData();

    // if there is no data, return from the function
    if (!authInformation) {
      return;
    }

    const now = new Date();

    // calculate the time that remains between now and the token's expiration date
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();

    // if the remaining time is above zero seconds
    // the token is not yet expired
    if (expiresIn > 0) {
      // save the token
      this.token = authInformation.token;

      // set the user status as authenticated
      this.isAuthenticated = true;

      // save the user id and name in the service
      this.userId = authInformation.userId;
      this.userName = authInformation.userName;

      // create a timer for the token validity
      this.setAuthTimer(expiresIn / NUMBER_OF_MILISECONDS_IN_SECOND);

      // notify components that the user is authenticated
      this.authStatusListener.next(true);
    }
  }

  /**
   * Logout the user
   */
  public logout() {
    // reset the token and the authentication status
    this.token = null;
    this.isAuthenticated = false;

    // notify components that the user is not authenticated
    this.authStatusListener.next(false);

    // cancel the token timer
    clearTimeout(this.tokenTimer);

    // remove the authentication data from the localStorage
    this.clearAuthData();

    // reset the user id from the service
    this.userId = null;

    // navigate to the login page
    this.router.navigate(['/auth/login']);
  }

  /**
   * Create a timer for the token validity, and logout the user when it finishes
   * 
   * @param {number}            duration              The amount of time the token is valid 
   */
  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * NUMBER_OF_MILISECONDS_IN_SECOND);
  }

  /**
   * Save the authentication data in the localStorage
   * 
   * @param {string}            token                 The application token
   * @param {Date}              expirationDate        The token's expiration date
   * @param {string}            userId                The current user id
   * @param {string}            userName              The current user name
   */
  private saveAuthData(token: string, expirationDate: Date, userId: string, userName?: string) {
    localStorage.setItem('token', token);
    // save the expiration date in ISO format: 2011-10-05T14:48:00.000Z
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
    if (userName) localStorage.setItem('userName', userName);
  }

  /**
   * Remove the authentication data from the localStorage
   */
  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
  }

  /**
   * Get the current users' authentication data
   */
  private getAuthData() {
    // get the authentication data from the localStorage
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    // if there is no token or expiration date, 
    // return from the function
    if (!token || !expirationDate) {
      return;
    }

    // return the authentication data
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
      userName: userName
    }
  }

  /**
   * Get the users' data according to his id
   * 
   * @param {string}            userId                The current user id
   */
  private getUserData(userId: string) {
    return this.http.get<{
      userName: string;
      email: string;
    }>(BACKEND_URL + userId);
  }

}
