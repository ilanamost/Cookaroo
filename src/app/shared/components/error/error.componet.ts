import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    templateUrl: "./error.component.html",
    styleUrls: ['./error.component.scss']
})

export class ErrorComponent {
    displayDialog = true;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { message: string }) {}

    public closeDialog() {
        this.displayDialog = false;
    }
}