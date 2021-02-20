import { NgModule } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { LoaderComponent } from './shared/components/loader/loader.component';

@NgModule({
    declarations: [
        LoaderComponent
    ],
    imports: [
        NgbModule
    ],
    exports: [
        LoaderComponent,
        NgbModule
    ]
})

export class SharedModule { }