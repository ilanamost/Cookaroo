import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { EMAIL_VALIDATOR, LOADER_TIMEOUT, PASSWORD_VALIDATOR, showPassword, emailValidator, passwordValidator } from "src/app/shared/classes/utils";
import { AuthService } from "../auth.service";

@Component({
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
    public loginForm: FormGroup;
    private authStatusSub: Subscription;
    public isLoading = false;
    public showPassword = showPassword;
    @ViewChild('passwordInput') passwordInput: ElementRef;

    constructor(public authService: AuthService) { }

    ngOnInit() {
        // initialize the login form 
        this.initForm();

        // listen to the authentication status updates
        this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
            authStatus => {
                setTimeout(
                      // hide the loader after getting the result 
                      // and waiting for a given amount of time
                    () => { this.isLoading = false; }
                    , LOADER_TIMEOUT);
            }
        );
    }

    ngOnDestroy() {
        this.authStatusSub.unsubscribe();
    }

    // form controls getters
    get email() { return this.loginForm.get('email'); }
    get password() { return this.loginForm.get('password'); }

    /**
     * Initialize the login form 
     */
    private initForm() {
        this.loginForm = new FormGroup({
            email: new FormControl(null, {
                validators: [Validators.required, emailValidator(EMAIL_VALIDATOR)]
            }),
            password: new FormControl(null, {
                validators: [Validators.required, passwordValidator(PASSWORD_VALIDATOR)]
            })
        });
    }

    /**
     * Perform operations on user login
     */
    onLogin() {
        // if the login form has errors
        // return from the function
        if (this.loginForm.invalid) {
            return;
        }

        // display the loader
        this.isLoading = true;

        // send a login request to the server
        this.authService.login(this.loginForm.value.email, this.loginForm.value.password);
    }
}

