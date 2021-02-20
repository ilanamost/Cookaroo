import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { LOADER_TIMEOUT, emailValidator, passwordValidator, showPassword, PASSWORD_VALIDATOR, EMAIL_VALIDATOR } from "src/app/shared/classes/utils";
import { AuthService } from "../auth.service";

@Component({
    templateUrl: "./signup.component.html",
    styleUrls: ["./signup.component.scss"]
})

export class SignupComponent implements OnInit {
    public signupForm: FormGroup;
    private authStatusSub: Subscription;
    isLoading = false;
    public showPassword = showPassword;

    constructor(private authService: AuthService) { }

    ngOnInit() {
        // initialize the signup form 
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

    /**
     * Initialize the signup form
     */
    private initForm() {
        this.signupForm = new FormGroup({
            userName: new FormControl(null, {
                validators: [Validators.required]
            }),
            email: new FormControl(null, {
                validators: [Validators.required, emailValidator(EMAIL_VALIDATOR)]
            }),
            password: new FormControl(null, {
                validators: [Validators.required, passwordValidator(PASSWORD_VALIDATOR)]
            }),
            passwordRetype: new FormControl(null, {
                validators: [this.passwordRetypeValidator()]
            })
        });

    }

    /**
    * Validate the password retype control
    */
    private passwordRetypeValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {

            // check if both password values are the same
            const isPassValid = (this.password && this.password.value === control.value) ? true : false;
            return isPassValid ? null : { passwordInValid: { value: control.value } };
        };
    }

    ngOnDestroy() {
        if (this.authStatusSub) this.authStatusSub.unsubscribe();
    }

    // form controls getters
    get userName() { return this.signupForm ? this.signupForm.get('userName') : null; }
    get email() { return this.signupForm ? this.signupForm.get('email') : null; }
    get password() { return this.signupForm ? this.signupForm.get('password') : null; }
    get passwordRetype() { return this.signupForm ? this.signupForm.get('passwordRetype') : null; }

    /**
     * Perform operations on user signup
     */
    onSignup() {
        // if the login form has errors
        // return from the function
        if (this.signupForm.invalid) {
            return;
        }

        // display the loader
        this.isLoading = true;

        // create a new user in the backend
        this.authService.createUser(this.signupForm.value.email, this.signupForm.value.password, this.signupForm.value.userName);
    }
}