import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { RecipeListComponent } from "./recipe-list/recipe-list.component";
import { RecipeEditComponent } from "./recipe-edit/recipe-edit.component";
import { MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from "../shared.module";

@NgModule({
    declarations: [
        RecipeListComponent,
        RecipeEditComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatPaginatorModule,
        SharedModule
    ]
})
export class RecipesModule {}