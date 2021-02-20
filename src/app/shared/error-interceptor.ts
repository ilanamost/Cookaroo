import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { ErrorComponent } from "./components/error/error.componet";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private dialog: MatDialog) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMessage = 'An unknown error occured!'

                // get the error message out of the http request
                if(error.message) {
                    errorMessage = error.message;
                }

                // display the error message in a dialog
                this.dialog.open(ErrorComponent, {data: { message: errorMessage }});
                return throwError(error);
            })
        );
    }
}